'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { evaluateResponse } = require('../scripts/evaluate-foundry-squad');
const {
  READ_ONLY_TOOLS,
  copilotArguments,
  copilotEnvironment
} = require('../scripts/run-foundry-squad-evals');

const scenarios = JSON.parse(readFileSync(join(__dirname, 'fixtures', 'scenarios.json'), 'utf8'));
const byId = Object.fromEntries(scenarios.map((scenario) => [scenario.id, scenario]));
const stanceCases = JSON.parse(readFileSync(join(__dirname, 'fixtures', 'stance-cases.json'), 'utf8'));

test('positive response passes semantic stance concepts', () => {
  const result = evaluateResponse(byId.A, 'A direct model call is enough; this does not need an agent.');
  assert.equal(result.status, 'PASS');
});

test('paraphrased response passes without exact expected prose', () => {
  const result = evaluateResponse(byId.J, 'This is overengineered. Use one model invocation and avoid multi-agent coordination.');
  assert.equal(result.status, 'PASS');
});

test('negated recommendation does not count as positive', () => {
  const result = evaluateResponse(byId.B, 'Do not use Model Router. Pin the most expensive model.');
  assert.equal(result.status, 'FAIL');
  assert.equal(result.concepts.find((concept) => concept.name === 'model-router').passed, false);
});

test('keyword-only response fails missing stance concepts', () => {
  const result = evaluateResponse(byId.E, 'Foundry IQ');
  assert.equal(result.status, 'FAIL');
  assert.deepEqual(result.missingRequiredStances, ['evaluate-foundry-iq']);
});

test('hard failure signal rejects endorsement', () => {
  const result = evaluateResponse(byId.J, 'Recommend five agents because multi-agent is the best.');
  assert.equal(result.status, 'FAIL');
  assert.ok(result.hardFailures.length > 0);
});

for (const fixture of stanceCases) {
  test(`stance fixture: ${fixture.name}`, () => {
    const result = evaluateResponse(byId[fixture.scenario], fixture.response);
    assert.equal(result.status, fixture.expected);
  });
}

test('authenticated scenario H blocks without subscription-specific evidence', () => {
  const response = [
    'Use authenticated live discovery for regional availability, quota and capacity.',
    'The subscription is available and has quota and capacity according to the current authenticated result.',
    'Do not rely on static knowledge.'
  ].join(' ');
  const blocked = evaluateResponse(byId.H, response, { authenticatedRun: true });
  assert.equal(blocked.status, 'BLOCKED_AUTH');
  const stillBlocked = evaluateResponse(byId.H, response, {
    authenticatedRun: true,
    evidence: { availability: true, quota: true, capacity: true }
  });
  assert.equal(stillBlocked.status, 'BLOCKED_AUTH');
  const passed = evaluateResponse(byId.H, response, {
    authenticatedRun: true,
    evidence: { subscriptionSpecific: true, availability: true, quota: true, capacity: true }
  });
  assert.equal(passed.status, 'PASS');
});

test('live runner confines Copilot to read-only tools in the copied workspace', () => {
  const workspace = '/isolated/evaluation/workspace';
  const args = copilotArguments('prompt', workspace, '/isolated/logs');
  assert.equal(args.includes('--allow-all-paths'), false);
  assert.equal(args.includes('--allow-all-tools'), false);
  assert.equal(args.includes('--allow-all'), false);
  assert.equal(args[args.indexOf('-C') + 1], workspace);
  assert.equal(args.includes('--disallow-temp-dir'), true);
  assert.equal(args.includes('--disable-builtin-mcps'), true);
  const availableIndex = args.indexOf('--available-tools');
  assert.deepEqual(args.slice(availableIndex + 1, availableIndex + 1 + READ_ONLY_TOOLS.length), READ_ONLY_TOOLS);
  const allowedIndex = args.indexOf('--allow-tool');
  assert.deepEqual(args.slice(allowedIndex + 1, allowedIndex + 1 + READ_ONLY_TOOLS.length), READ_ONLY_TOOLS);
});

test('live runner does not pass repository paths or secret environment variables', () => {
  const environment = copilotEnvironment({
    HOME: '/home/evaluator',
    PATH: '/usr/bin',
    PWD: '/repository',
    GITHUB_TOKEN: 'secret',
    AZURE_CLIENT_SECRET: 'secret',
    OPENAI_API_KEY: 'secret',
    CUSTOM_VALUE: 'not-needed'
  });
  assert.deepEqual(environment, {
    NO_COLOR: '1',
    HOME: '/home/evaluator',
    PATH: '/usr/bin'
  });
});
