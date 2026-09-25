'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { REQUIRED_SECTIONS, SCORE_DIMENSIONS } = require('../scripts/validate-experiment-journal');
const { summarizeJournals } = require('../scripts/summarize-experiment-journals');

function journal(score, improvement) {
  const sections = REQUIRED_SECTIONS.map((section) => {
    if (section === 'Core FoundrySquad improvements') {
      return [
        `## ${section}`,
        '',
        '| Improvement | Core surface | Evidence | Impact (1-5) | Effort (1-5) | Confidence (1-3) |',
        '| --- | --- | --- | --- | --- | --- |',
        `| ${improvement} | routing | Observed twice. | 4 | 2 | 3 |`
      ].join('\n');
    }
    if (section === 'Comparison score') {
      return [
        `## ${section}`,
        '',
        '| Dimension | Score (1-5) | Evidence |',
        '| --- | --- | --- |',
        ...SCORE_DIMENSIONS.map((dimension) => `| ${dimension} | ${score} | Direct evidence. |`)
      ].join('\n');
    }
    return `## ${section}\n\nEvidence.`;
  });
  return sections.join('\n\n');
}

test('journal summary averages scores and ranks recurring improvements', () => {
  const summary = summarizeJournals([
    { name: 'one.md', content: journal(4, 'Timebox architecture') },
    { name: 'two.md', content: journal(2, 'Timebox architecture') },
    { name: 'three.md', content: journal(5, 'Add fixture template') }
  ]);
  assert.equal(summary.averageScores['Routing accuracy'], 3.67);
  assert.equal(summary.improvements[0].improvement, 'Timebox architecture');
  assert.equal(summary.improvements[0].recurrence, 2);
  assert.equal(summary.improvements[0].priority, 12);
});
