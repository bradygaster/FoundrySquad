#!/usr/bin/env node
'use strict';

const { existsSync, readFileSync, readdirSync } = require('node:fs');
const { basename, join, resolve } = require('node:path');

const ROOT = resolve(__dirname, '..');
const REQUIRED_SECTIONS = [
  'Outcome and acceptance criteria',
  'Architecture decision',
  'Squad activity',
  'Evidence and assumptions',
  'Validation log',
  'Friction and recovery',
  'What Squad did well',
  'Core FoundrySquad improvements',
  'Comparison score'
];
const SCORE_DIMENSIONS = [
  'Architecture economy',
  'Routing accuracy',
  'Handoff quality',
  'Evidence discipline',
  'Implementation usefulness',
  'Quality coverage',
  'Security and RAI',
  'Ceremony efficiency',
  'Recovery behavior'
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateJournal(content) {
  const errors = [];
  for (const section of REQUIRED_SECTIONS) {
    const heading = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, 'im');
    if (!heading.test(content)) errors.push(`missing section: ${section}`);
  }
  for (const dimension of SCORE_DIMENSIONS) {
    const scoreRow = new RegExp(
      `^\\|\\s*${escapeRegExp(dimension)}\\s*\\|\\s*([1-5])\\s*\\|\\s*\\S.*\\|\\s*$`,
      'im'
    );
    if (!scoreRow.test(content)) errors.push(`missing scored evidence: ${dimension}`);
  }
  return errors;
}

function discoverJournals(directory = join(ROOT, 'docs', 'experiments')) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith('-journal.md') && name !== 'scenario-journal-template.md')
    .map((name) => join(directory, name));
}

function main(argv = process.argv.slice(2)) {
  const paths = argv.length > 0 ? argv.map((path) => resolve(path)) : discoverJournals();
  if (paths.length === 0) {
    console.error('No experiment journals found. Pass one or more journal paths.');
    process.exitCode = 2;
    return;
  }
  const results = paths.map((path) => ({
    path,
    errors: validateJournal(readFileSync(path, 'utf8'))
  }));
  console.log(JSON.stringify({
    status: results.every((result) => result.errors.length === 0) ? 'PASS' : 'FAIL',
    journals: results.map((result) => ({
      name: basename(result.path),
      errors: result.errors
    }))
  }, null, 2));
  if (results.some((result) => result.errors.length > 0)) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  REQUIRED_SECTIONS,
  SCORE_DIMENSIONS,
  discoverJournals,
  validateJournal
};
