'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const fictionalGuids = new Set([
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
]);

function trackedTextFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((file) => !/(^|\/)\.env($|\.)/.test(file))
    .filter((file) => /\.(?:cs|csproj|gitignore|gitattributes|js|json|md|slnx|ya?ml)$/.test(file));
}

test('tracked public content contains no live Azure resource identifiers', () => {
  const violations = [];

  for (const file of trackedTextFiles()) {
    const content = readFileSync(resolve(root, file), 'utf8');

    for (const match of content.matchAll(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    )) {
      if (!fictionalGuids.has(match[0].toLowerCase())) {
        violations.push(`${file}: unapproved GUID ${match[0]}`);
      }
    }

    if (/https:\/\/[^\s"'`<>]+(?:services\.ai\.azure\.com|search\.windows\.net)\//i.test(content)) {
      violations.push(`${file}: resource-specific Azure endpoint`);
    }
  }

  assert.deepEqual(violations, []);
});
