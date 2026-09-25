#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync, readdirSync } = require('node:fs');
const { join, resolve } = require('node:path');

const ROOT = resolve(__dirname, '..');

function run(command, args, timeout = 10000) {
  const probe = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout,
    windowsHide: true,
    env: { ...process.env, AZURE_CORE_NO_COLOR: 'true', NO_COLOR: '1' }
  });
  return {
    present: !(probe.error && probe.error.code === 'ENOENT'),
    ok: !probe.error && probe.status === 0,
    status: probe.status,
    error: probe.error ? probe.error.code || probe.error.name : null,
    stdout: String(probe.stdout || '').trim(),
    stderr: String(probe.stderr || '').trim()
  };
}

function version(command, args = ['--version']) {
  const probe = run(command, args);
  return {
    present: probe.present,
    status: probe.ok ? 'OK' : probe.present ? 'VERSION_FAILED' : 'MISSING',
    version: probe.ok ? probe.stdout.split(/\r?\n/)[0] : null
  };
}

function parseJsonFile(path) {
  try {
    const value = JSON.parse(readFileSync(path, 'utf8'));
    return { status: 'VALID', value };
  } catch (error) {
    return { status: 'INVALID', error: error.message };
  }
}

function inspectMcp() {
  const candidates = [
    join(ROOT, '.vscode', 'mcp.json'),
    join(ROOT, '.mcp.json'),
    join(ROOT, '.copilot', 'mcp-config.json')
  ];
  return candidates.filter(existsSync).map((path) => {
    const parsed = parseJsonFile(path);
    if (parsed.status !== 'VALID') return { path: path.slice(ROOT.length + 1), status: 'INVALID_JSON', error: parsed.error };
    const serialized = JSON.stringify(parsed.value);
    return {
      path: path.slice(ROOT.length + 1),
      status: 'VALID_JSON',
      foundryRemoteConfigured: serialized.includes('https://mcp.ai.azure.com'),
      unsafeAutoInstall: serialized.includes('"npx"') && serialized.includes('"-y"'),
      auth: serialized.includes('https://mcp.ai.azure.com') ? 'CONFIGURED_NOT_AUTH_PROBED' : 'NOT_APPLICABLE_OR_UNKNOWN'
    };
  });
}

function repoIntent() {
  const signals = [];
  for (const name of ['azure.yaml', 'infra', 'apphost.cs', 'apphost.ts', 'package.json', '.squad']) {
    if (existsSync(join(ROOT, name))) signals.push(name);
  }
  const files = readdirSync(ROOT);
  if (files.some((name) => name.endsWith('.sln') || name.endsWith('.csproj'))) signals.push('.NET project');
  return { status: signals.length ? 'DETECTED' : 'UNKNOWN', signals };
}

function azureCliAuth() {
  const probe = run('az', ['account', 'show', '--output', 'json']);
  if (!probe.present) return { status: 'TOOL_MISSING', authenticated: false };
  if (!probe.ok) return { status: 'NOT_AUTHENTICATED_OR_UNAVAILABLE', authenticated: false };
  let account = null;
  try {
    account = JSON.parse(probe.stdout);
  } catch {
    return { status: 'INVALID_RESPONSE', authenticated: false };
  }
  return {
    status: 'AUTHENTICATED',
    authenticated: true,
    tenantPresent: Boolean(account.tenantId),
    subscriptionPresent: Boolean(account.id),
    subscriptionSelectionWasNotChanged: true
  };
}

function azdAuth() {
  const probe = run('azd', ['auth', 'login', '--check-status']);
  if (!probe.present) return { status: 'TOOL_MISSING', authenticated: false };
  return {
    status: probe.ok ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED_OR_UNAVAILABLE',
    authenticated: probe.ok,
    checkWasNonInteractive: true
  };
}

function foundryTooling() {
  const azdExtensions = run('azd', ['ext', 'list', '--output', 'json']);
  let extensions = [];
  if (azdExtensions.ok) {
    try {
      const parsed = JSON.parse(azdExtensions.stdout);
      extensions = Array.isArray(parsed) ? parsed.map((item) => item.id || item.name).filter(Boolean) : [];
    } catch {
      extensions = [];
    }
  }
  return {
    foundryAzdExtension: extensions.some((name) => String(name).includes('microsoft.foundry')),
    azdExtensionQuery: azdExtensions.present ? (azdExtensions.ok ? 'OK' : 'FAILED') : 'TOOL_MISSING',
    foundryLocal: version('foundry', ['--version']),
    notes: [
      'Foundry DevPack and Microsoft Foundry Toolkit for VS Code are recommended supported entry points.',
      'Foundry Canvas and Foundry MCP are preview; verify current limitations before production use.',
      'Install guidance is reported only. This doctor never installs tooling.'
    ]
  };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const tools = {
    node: version(process.execPath, ['--version']),
    npm: version('npm'),
    dotnet: version('dotnet'),
    azureCli: version('az'),
    azd: version('azd'),
    git: version('git'),
    vscode: version('code')
  };
  const report = {
    tool: 'foundry-doctor',
    mode: 'read-only',
    timestamp: new Date().toISOString(),
    root: '.',
    detectionOrder: [
      'repo-intent',
      'executable-presence',
      'version-status',
      'foundry-tooling',
      'mcp-config-validation',
      'separate-auth-state',
      'explicit-live-discovery',
      'documentation-fallback'
    ],
    repoIntent: repoIntent(),
    tools,
    foundryTooling: foundryTooling(),
    mcp: inspectMcp(),
    auth: {
      azureCli: azureCliAuth(),
      azd: azdAuth(),
      mcp: 'CONFIG_ONLY_NOT_AUTHENTICATED'
    },
    liveDiscovery: args.has('--live')
      ? {
          status: 'NOT_RUN_WITHOUT_OPERATION_CONTEXT',
          command: 'node scripts/foundry-availability.js <operation> --subscription <id> --location <region> ...'
        }
      : { status: 'OPT_IN', reason: 'Pass explicit context to the availability tool; doctor does not infer or select a subscription.' },
    setupBoundaries: {
      allowed: ['inspect files', 'validate JSON', 'locate executables', 'query versions', 'check existing auth status', 'perform explicit read-only GET discovery'],
      prohibited: ['install', 'login', 'select subscription', 'provision', 'assign RBAC', 'start authentication', 'npx -y'],
      identity: {
        local: 'DefaultAzureCredential with an existing developer login; do not store credentials in the repository.',
        production: 'Choose a deterministic managed identity and grant least privilege at the narrowest practical scope.',
        ci: 'Use federated OIDC/workload identity; do not use long-lived client secrets.'
      },
      delivery: '`azd` plus Bicep is the default. Portal-only operations require a documented exception.'
    },
    documentationFallback: [
      'https://learn.microsoft.com/azure/foundry/',
      'https://learn.microsoft.com/azure/foundry/how-to/develop/install-cli-sdk',
      'https://learn.microsoft.com/azure/foundry/mcp/get-started'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
  if (report.mcp.some((entry) => entry.status !== 'VALID_JSON' || entry.unsafeAutoInstall)) process.exitCode = 1;
}

main();
