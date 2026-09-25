#!/usr/bin/env node
'use strict';

const { readFileSync } = require('node:fs');
const { basename, resolve } = require('node:path');
const {
  SCORE_DIMENSIONS,
  discoverJournals,
  validateJournal
} = require('./validate-experiment-journal');

function cells(row) {
  return row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
}

function section(content, name) {
  const heading = new RegExp(
    `^##\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`,
    'im'
  );
  const match = heading.exec(content);
  if (!match) return '';
  const remainder = content.slice(match.index + match[0].length);
  const nextHeading = remainder.search(/^##\s+/m);
  return nextHeading === -1 ? remainder : remainder.slice(0, nextHeading);
}

function tableRows(content) {
  return content.split(/\r?\n/)
    .filter((line) => /^\s*\|.*\|\s*$/.test(line))
    .map(cells)
    .filter((row) => !row.every((cell) => /^:?-+:?$/.test(cell)));
}

function parseJournal(name, content) {
  const errors = validateJournal(content);
  const scoreRows = tableRows(section(content, 'Comparison score'));
  const scores = {};
  for (const dimension of SCORE_DIMENSIONS) {
    const row = scoreRows.find((candidate) => candidate[0] === dimension);
    if (row) scores[dimension] = { score: Number(row[1]), evidence: row[2] };
  }
  const improvementRows = tableRows(section(content, 'Core FoundrySquad improvements'));
  const improvements = improvementRows
    .filter((row) => row[0] !== 'Improvement' && row.length >= 6)
    .map((row) => ({
      improvement: row[0],
      surface: row[1],
      evidence: row[2],
      impact: Number(row[3]),
      effort: Number(row[4]),
      confidence: Number(row[5])
    }))
    .filter((entry) => (
      entry.improvement &&
      [entry.impact, entry.effort, entry.confidence].every(Number.isFinite) &&
      entry.effort > 0
    ));
  return { name, errors, scores, improvements };
}

function summarizeJournals(journals) {
  const parsed = journals.map(({ name, content }) => parseJournal(name, content));
  const averageScores = {};
  for (const dimension of SCORE_DIMENSIONS) {
    const values = parsed.map((journal) => journal.scores[dimension]?.score).filter(Number.isFinite);
    averageScores[dimension] = values.length === 0 ? null :
      Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
  }
  const grouped = new Map();
  for (const journal of parsed) {
    for (const improvement of journal.improvements) {
      const key = `${improvement.surface.toLowerCase()}::${improvement.improvement.toLowerCase()}`;
      const existing = grouped.get(key) || {
        improvement: improvement.improvement,
        surface: improvement.surface,
        recurrence: 0,
        impact: 0,
        effort: 0,
        confidence: 0,
        journals: []
      };
      existing.recurrence += 1;
      existing.impact += improvement.impact;
      existing.effort += improvement.effort;
      existing.confidence += improvement.confidence;
      existing.journals.push(journal.name);
      grouped.set(key, existing);
    }
  }
  const improvements = [...grouped.values()].map((entry) => {
    const impact = entry.impact / entry.recurrence;
    const effort = entry.effort / entry.recurrence;
    const confidence = entry.confidence / entry.recurrence;
    return {
      improvement: entry.improvement,
      surface: entry.surface,
      recurrence: entry.recurrence,
      priority: Number((impact * entry.recurrence * confidence / effort).toFixed(2)),
      journals: entry.journals
    };
  }).sort((left, right) => right.priority - left.priority);
  return { journals: parsed, averageScores, improvements };
}

function main(argv = process.argv.slice(2)) {
  const paths = argv.length > 0 ? argv.map((path) => resolve(path)) : discoverJournals();
  if (paths.length === 0) {
    console.error('No experiment journals found. Pass one or more journal paths.');
    process.exitCode = 2;
    return;
  }
  const summary = summarizeJournals(paths.map((path) => ({
    name: basename(path),
    content: readFileSync(path, 'utf8')
  })));
  console.log(JSON.stringify(summary, null, 2));
  if (summary.journals.some((journal) => journal.errors.length > 0)) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  parseJournal,
  summarizeJournals,
  tableRows
};
