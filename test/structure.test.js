'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const ROOT = resolve(__dirname, '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');

test('roster and casting contain all six specialists', () => {
  const team = read('.squad', 'team.md');
  const casting = JSON.parse(read('.squad', 'casting', 'registry.json'));
  for (const agent of ['architect', 'model-strategist', 'agent-engineer', 'integration-engineer', 'knowledge-engineer', 'platform-engineer', 'quality-engineer', 'reviewer']) {
    assert.ok(casting.agents[agent], `missing casting entry ${agent}`);
    assert.match(team.toLowerCase(), new RegExp(agent.replace('-', ' ')));
  }
});

test('generated coordinator capabilities reflect the cast squad', () => {
  const coordinator = read('.github', 'agents', 'squad.agent.md');
  const metadata = coordinator.match(
    /<!-- squad:capabilities schema=1 specialists=(\d+) taskTypes=(\d+) hints=(\d+) -->/
  );
  assert.ok(metadata, 'missing generated capability metadata');
  assert.ok(Number(metadata[1]) > 0, 'generated capabilities must include specialists');
  assert.ok(Number(metadata[2]) > 0, 'generated capabilities must include task types');
  assert.doesNotMatch(coordinator, /this squad has not been cast yet/i);
});

test('specialist charters define inputs outputs evidence and completion', () => {
  for (const agent of ['architect', 'model-strategist', 'agent-engineer', 'integration-engineer', 'knowledge-engineer', 'platform-engineer', 'quality-engineer', 'reviewer']) {
    const charter = read('.squad', 'agents', agent, 'charter.md');
    assert.match(charter, /## Inputs/);
    assert.match(charter, /## Outputs and Handoffs/);
    assert.match(charter, /## Evidence and Completion/);
  }
});

test('routing and ceremonies enforce Foundry gates', () => {
  const routing = read('.squad', 'routing.md');
  const ceremonies = read('.squad', 'ceremonies.md');
  const responseMode = read('.github', 'skills', 'coordinator-response-mode', 'SKILL.md');
  assert.match(routing, /Foundry Delivery Route/);
  assert.match(routing, /No false unavailable/);
  assert.match(routing, /launches implementation within 60 seconds/);
  assert.match(responseMode, /first implementation artifact within 60/);
  assert.match(responseMode, /must not block deterministic local code/i);
  assert.equal((ceremonies.match(/\*\*Exit criteria:\*\*/g) || []).length, 2);
  for (const dimension of ['catalog presence', 'compatibility', 'regional availability', 'entitlement', 'quota', 'capacity', 'deployability', 'runtime health']) {
    assert.match(`${routing}\n${ceremonies}`.toLowerCase(), new RegExp(dimension));
  }
});

test('team-owned skills and artifact templates exist', () => {
  for (const skill of ['foundry-architecture', 'foundry-availability', 'foundry-delivery']) {
    assert.ok(existsSync(join(ROOT, '.squad', 'skills', skill, 'SKILL.md')));
  }
  for (const artifact of ['requirements.md', 'architecture-decision.md', 'model-evidence.md', 'infrastructure.md', 'evaluation.md', 'operations.md']) {
    assert.ok(existsSync(join(ROOT, '.squad', 'artifacts', 'templates', artifact)));
  }
});

test('availability skill and implementation expose all conceptual operations', () => {
  const content = `${read('.squad', 'skills', 'foundry-availability', 'SKILL.md')}\n${read('scripts', 'foundry-availability.js')}`;
  for (const operation of ['find_models', 'inspect_model', 'find_regions', 'check_quota', 'check_capacity', 'explain_deployment_options']) {
    assert.match(content, new RegExp(operation));
  }
  assert.match(content, /2024-10-01/);
  assert.doesNotMatch(content, /static model-region matrix\s*:/i);
});

test('developer docs schema doctor scenarios and runner exist', () => {
  for (const path of [
    ['README.md'],
    ['docs', 'foundry-squad.md'],
    ['docs', 'experiments', 'README.md'],
    ['docs', 'experiments', 'lab-log.md'],
    ['docs', 'experiments', 'scenario-journal-template.md'],
    ['schemas', 'foundry-availability-result.schema.json'],
    ['scripts', 'foundry-doctor.js'],
    ['scripts', 'run-foundry-squad-evals.js'],
    ['scripts', 'validate-experiment-journal.js'],
    ['scripts', 'summarize-experiment-journals.js'],
    ['test', 'fixtures', 'scenarios.json']
  ]) assert.ok(existsSync(join(ROOT, ...path)), `missing ${path.join('/')}`);
  const scenarios = JSON.parse(read('test', 'fixtures', 'scenarios.json'));
  assert.deepEqual(scenarios.map((scenario) => scenario.id), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
});

test('repository configuration avoids unsafe installers and embedded secret values', () => {
  const configFiles = [
    '.copilot/mcp-config.json',
    '.vscode/mcp.json',
    '.mcp.json'
  ];
  const configContent = configFiles.map((path) => read(...path.split('/'))).join('\n');
  assert.doesNotMatch(configContent, /"command"\s*:\s*"npx"[\s\S]{0,200}"(?:-y|--yes)"/);
  const files = [
    ...configFiles,
    'scripts/foundry-doctor.js',
    'scripts/foundry-availability.js',
    'docs/foundry-squad.md'
  ];
  const content = files.map((path) => read(...path.split('/'))).join('\n');
  assert.doesNotMatch(content, /-----BEGIN [A-Z ]+PRIVATE KEY-----/);
  assert.doesNotMatch(content, /\b(?:ghp|sk-proj)-[A-Za-z0-9_-]{12,}\b/);
  assert.doesNotMatch(configContent, /[A-Z_]*(?:PASSWORD|TOKEN|SECRET)[A-Z_]*"?\s*[:=]\s*"(?!\$\{|<)[^"]+"/);
});
