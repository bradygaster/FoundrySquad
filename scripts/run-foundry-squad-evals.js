#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { evaluateResponse } = require('./evaluate-foundry-squad');

const ROOT = resolve(__dirname, '..');
const SCENARIOS = JSON.parse(readFileSync(join(ROOT, 'test', 'fixtures', 'scenarios.json'), 'utf8'));
const READ_ONLY_TOOLS = ['view', 'glob', 'rg'];
const SAFE_ENV_KEYS = [
  'HOME', 'PATH', 'SHELL', 'USER', 'LOGNAME', 'LANG', 'LC_ALL', 'TERM',
  'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY',
  'SSL_CERT_FILE', 'SSL_CERT_DIR', 'NODE_EXTRA_CA_CERTS'
];

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) continue;
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function safeStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'));
}

function prepareWorkspace(runDir) {
  const workspace = join(runDir, 'workspace');
  mkdirSync(workspace, { recursive: true });
  const entries = [
    ['.github', 'agents'],
    ['.github', 'copilot-instructions.md'],
    ['.github', 'skills'],
    ['.squad', 'agents'],
    ['.squad', 'artifacts'],
    ['.squad', 'casting'],
    ['.squad', 'skills'],
    ['.squad', 'ceremonies.md'],
    ['.squad', 'config.json'],
    ['.squad', 'decisions.md'],
    ['.squad', 'routing.md'],
    ['.squad', 'team.md']
  ];
  for (const parts of entries) {
    const source = join(ROOT, ...parts);
    const destination = join(workspace, ...parts);
    if (existsSync(source)) {
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(source, destination, { recursive: true });
    }
  }
  return workspace;
}

function copilotEnvironment(environment = process.env) {
  const safeEnvironment = { NO_COLOR: '1' };
  for (const key of SAFE_ENV_KEYS) {
    if (environment[key]) safeEnvironment[key] = environment[key];
  }
  return safeEnvironment;
}

function copilotArguments(prompt, workspace, logDir) {
  return [
    '-p',
    prompt,
    '--silent',
    '--agent',
    'Squad',
    '-C',
    workspace,
    '--disallow-temp-dir',
    '--disable-builtin-mcps',
    '--available-tools',
    ...READ_ONLY_TOOLS,
    '--allow-tool',
    ...READ_ONLY_TOOLS,
    '--log-dir',
    logDir
  ];
}

function runCopilot(scenario, workspace, runDir) {
  const prompt = [
    'Act as the configured Microsoft Foundry Squad.',
    'Provide a read-only architecture assessment. Do not edit files, run commands, authenticate, provision, or deploy.',
    'State the smallest sufficient architecture, current-evidence needs, and completion gates.',
    `Request: ${scenario.prompt}`
  ].join('\n');
  const logDir = join(runDir, 'copilot-logs', scenario.id);
  mkdirSync(logDir, { recursive: true });
  const probe = spawnSync('copilot', copilotArguments(prompt, workspace, logDir), {
    cwd: workspace,
    encoding: 'utf8',
    timeout: 180000,
    windowsHide: true,
    env: copilotEnvironment()
  });
  return {
    response: String(probe.stdout || '').trim(),
    execution: {
      exitCode: probe.status,
      error: probe.error ? probe.error.code || probe.error.name : null,
      stderr: String(probe.stderr || '').trim()
    }
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const replay = args.replay ? loadJson(args.replay) : null;
  const live = Boolean(args.live);
  if (!live && !replay) {
    console.error('Use --replay <file> or explicitly opt in with --live.');
    process.exitCode = 2;
    return;
  }
  if (live && replay) {
    console.error('Choose either --live or --replay, not both.');
    process.exitCode = 2;
    return;
  }
  const evidence = args.evidence ? loadJson(args.evidence) : {};
  const runDir = join(ROOT, '.artifacts', 'foundry-squad-evals', safeStamp());
  mkdirSync(runDir, { recursive: true });
  const workspace = live ? prepareWorkspace(runDir) : null;
  const results = [];
  for (const scenario of SCENARIOS) {
    const liveResult = live ? runCopilot(scenario, workspace, runDir) : null;
    const response = live ? liveResult.response : replay[scenario.id];
    const evaluation = evaluateResponse(scenario, response, {
      authenticatedRun: live,
      evidence: evidence[scenario.id] || {}
    });
    results.push({
      id: scenario.id,
      name: scenario.name,
      mode: live ? 'live' : 'replay',
      response,
      execution: liveResult && liveResult.execution,
      evaluation
    });
    writeFileSync(join(runDir, `${scenario.id}.json`), JSON.stringify(results.at(-1), null, 2));
  }
  const summary = {
    timestamp: new Date().toISOString(),
    mode: live ? 'live' : 'replay',
    status: results.every((entry) => entry.evaluation.status === 'PASS') ? 'PASS' :
      results.some((entry) => entry.evaluation.status === 'BLOCKED_AUTH') ? 'BLOCKED_AUTH' : 'FAIL',
    results
  };
  writeFileSync(join(runDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ status: summary.status, artifactDirectory: runDir, scenarios: results.map((entry) => ({
    id: entry.id,
    status: entry.evaluation.status,
    score: entry.evaluation.score
  })) }, null, 2));
  if (summary.status !== 'PASS') process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  READ_ONLY_TOOLS,
  SAFE_ENV_KEYS,
  copilotArguments,
  copilotEnvironment,
  parseArgs,
  prepareWorkspace
};
