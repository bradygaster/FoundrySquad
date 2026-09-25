'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  REQUIRED_SECTIONS,
  SCORE_DIMENSIONS,
  validateJournal
} = require('../scripts/validate-experiment-journal');

function validJournal() {
  const sections = REQUIRED_SECTIONS.map((section) => `## ${section}\n\nEvidence for ${section}.`);
  const scores = SCORE_DIMENSIONS.map((dimension) => `| ${dimension} | 4 | Direct journal evidence. |`);
  return `${sections.join('\n\n')}\n\n${scores.join('\n')}\n`;
}

test('complete experiment journal passes validation', () => {
  assert.deepEqual(validateJournal(validJournal()), []);
});

test('journal reports missing sections and unscored dimensions', () => {
  const errors = validateJournal('## Outcome and acceptance criteria\n\nIncomplete.');
  assert.ok(errors.includes('missing section: Architecture decision'));
  assert.ok(errors.includes('missing scored evidence: Recovery behavior'));
});

test('comparison scores require a value from one through five and evidence', () => {
  const content = validJournal()
    .replace('| Routing accuracy | 4 | Direct journal evidence. |', '| Routing accuracy | 6 | Direct journal evidence. |')
    .replace('| Handoff quality | 4 | Direct journal evidence. |', '| Handoff quality | 4 | |');
  const errors = validateJournal(content);
  assert.ok(errors.includes('missing scored evidence: Routing accuracy'));
  assert.ok(errors.includes('missing scored evidence: Handoff quality'));
});
