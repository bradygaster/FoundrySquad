#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const API_VERSION = '2024-10-01';
const ARM = 'https://management.azure.com';
const OPERATIONS = new Set([
  'find_models',
  'inspect_model',
  'find_regions',
  'check_quota',
  'check_capacity',
  'explain_deployment_options'
]);

const DOCS = {
  models: 'https://learn.microsoft.com/rest/api/aiservices/accountmanagement/models/list?view=rest-aiservices-accountmanagement-2024-10-01',
  capacity: 'https://learn.microsoft.com/rest/api/aiservices/accountmanagement/location-based-model-capacities/list?view=rest-aiservices-accountmanagement-2024-10-01',
  quota: 'https://learn.microsoft.com/rest/api/aiservices/accountmanagement/usages/list?view=rest-aiservices-accountmanagement-2024-10-01',
  deployments: 'https://learn.microsoft.com/azure/foundry/foundry-models/how-to/deploy-foundry-models'
};
const MAX_ARM_PAGES = 100;
const SUCCESS_STATUSES = new Set(['OK', 'EMPTY_RESULT']);
const OPTIONAL_RESULT_FIELDS = ['pageEvidence', 'constraintEvaluation', 'statusSummary'];

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) {
      parsed._.push(value);
      continue;
    }
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

function dimensions(overrides = {}) {
  return {
    catalogPresence: 'UNKNOWN',
    compatibility: 'UNKNOWN',
    regionalAvailability: 'UNKNOWN',
    entitlement: 'UNKNOWN',
    quota: 'UNKNOWN',
    capacity: 'UNKNOWN',
    deployability: 'UNKNOWN',
    runtimeHealth: 'NOT_CHECKED',
    ...overrides
  };
}

function result(operation, fields = {}) {
  const output = {
    operation,
    status: fields.status || 'NEEDS_CONTEXT',
    source: fields.source || {
      kind: 'repository-guidance',
      authority: 'Microsoft Learn',
      uri: DOCS.deployments
    },
    timestamp: fields.timestamp || new Date().toISOString(),
    freshness: fields.freshness || { classification: 'current-guidance', ageSeconds: null },
    scope: fields.scope || {},
    auth: fields.auth || { attempted: false, outcome: 'NOT_ATTEMPTED' },
    dimensions: fields.dimensions || dimensions(),
    evidence: fields.evidence || null,
    warnings: fields.warnings || []
  };
  for (const field of OPTIONAL_RESULT_FIELDS) {
    if (fields[field] !== undefined) output[field] = fields[field];
  }
  return output;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getArmToken() {
  const probe = spawnSync('az', [
    'account',
    'get-access-token',
    '--resource-type',
    'arm',
    '--output',
    'json'
  ], { encoding: 'utf8', timeout: 15000, windowsHide: true });
  if (probe.error || probe.status !== 0) {
    return {
      token: null,
      auth: {
        attempted: true,
        outcome: 'AZURE_CLI_TOKEN_UNAVAILABLE',
        detail: (probe.error && probe.error.code) || String(probe.status)
      }
    };
  }
  const payload = safeJson(probe.stdout);
  return {
    token: payload && payload.accessToken,
    auth: {
      attempted: true,
      outcome: payload && payload.accessToken ? 'AUTHENTICATED' : 'INVALID_TOKEN_RESPONSE'
    }
  };
}

function statusForHttp(status) {
  if (status === 401) return 'AUTH_REQUIRED';
  if (status === 403) return 'FORBIDDEN_OR_ENTITLEMENT_UNKNOWN';
  if (status === 404) return 'SCOPE_NOT_FOUND_OR_API_MISMATCH';
  if (status === 429) return 'THROTTLED';
  if (status >= 500) return 'SERVICE_ERROR';
  if ([400, 405, 422].includes(status)) return 'UNSUPPORTED_OR_INVALID_REQUEST';
  if (status === 408) return 'REQUEST_TIMEOUT';
  if (status >= 300 && status < 500) return 'HTTP_ERROR';
  return 'INVALID_RESPONSE';
}

function freshness(classification, extra = {}) {
  return { classification, ageSeconds: classification === 'live' ? 0 : null, ...extra };
}

function dimensionStateForStatus(status) {
  if (status === 'AUTH_REQUIRED') return 'INDETERMINATE_AUTH';
  if (status === 'FORBIDDEN_OR_ENTITLEMENT_UNKNOWN') return 'INDETERMINATE_PERMISSION';
  if (['THROTTLED', 'SERVICE_ERROR', 'NETWORK_ERROR', 'REQUEST_TIMEOUT'].includes(status)) return 'INDETERMINATE_TRANSIENT';
  if (['UNSAFE_NEXT_LINK', 'PAGINATION_LIMIT_EXCEEDED', 'PAGINATION_LOOP_DETECTED', 'UNSUPPORTED_OR_INVALID_REQUEST'].includes(status)) {
    return 'INDETERMINATE_UNSUPPORTED';
  }
  return 'INDETERMINATE_RESPONSE';
}

function dimensionHintsForStatus(dimensionHints, status) {
  const value = dimensionStateForStatus(status);
  return Object.fromEntries(Object.keys(dimensionHints || {}).map((key) => [key, value]));
}

function safeArmNextLink(nextLink, currentUrl, initialUrl) {
  let candidate;
  try {
    candidate = new URL(nextLink, currentUrl);
    const initial = new URL(initialUrl);
    if (candidate.protocol !== 'https:' ||
        candidate.origin !== new URL(ARM).origin ||
        candidate.username ||
        candidate.password ||
        candidate.pathname.toLowerCase() !== initial.pathname.toLowerCase()) return null;
  } catch {
    return null;
  }
  return candidate.toString();
}

async function armGet(operation, url, scope, dimensionHints, dependencies = {}) {
  const tokenProvider = dependencies.getArmToken || getArmToken;
  const fetchImpl = dependencies.fetch || globalThis.fetch;
  const maxPages = dependencies.maxPages || MAX_ARM_PAGES;
  const credential = tokenProvider();
  if (!credential.token) {
    return result(operation, {
      status: 'AUTH_REQUIRED',
      source: { kind: 'arm-authentication-attempt', authority: 'Azure Resource Manager', uri: url },
      scope,
      auth: credential.auth,
      freshness: freshness('not-live'),
      dimensions: dimensions(dimensionHintsForStatus(dimensionHints, 'AUTH_REQUIRED')),
      evidence: { authentication: credential.auth },
      warnings: ['No ARM token was available. This is not evidence that the model or region is unavailable.']
    });
  }

  const values = [];
  const pageEvidence = [];
  const seenUrls = new Set();
  let nextUrl = url;
  for (let page = 1; nextUrl; page += 1) {
    if (page > maxPages) {
      const status = 'PAGINATION_LIMIT_EXCEEDED';
      return result(operation, {
        status,
        source: { kind: 'authenticated-arm', authority: 'Azure Resource Manager', uri: url },
        scope,
        auth: { attempted: true, outcome: 'AUTHENTICATED' },
        freshness: freshness('live-error'),
        dimensions: dimensions(dimensionHintsForStatus(dimensionHints, status)),
        evidence: { items: values, error: { page, code: status } },
        pageEvidence,
        warnings: [`ARM pagination exceeded the safety limit of ${maxPages} pages; partial results are not conclusive.`]
      });
    }
    if (seenUrls.has(nextUrl)) {
      const status = 'PAGINATION_LOOP_DETECTED';
      pageEvidence.push({ page, uri: nextUrl, status, timestamp: new Date().toISOString() });
      return result(operation, {
        status,
        source: { kind: 'authenticated-arm', authority: 'Azure Resource Manager', uri: url },
        scope,
        auth: { attempted: true, outcome: 'AUTHENTICATED' },
        freshness: freshness('live-error'),
        dimensions: dimensions(dimensionHintsForStatus(dimensionHints, status)),
        evidence: { items: values, error: { page, code: status } },
        pageEvidence,
        warnings: ['ARM returned a repeated nextLink; pagination stopped and partial results are not conclusive.']
      });
    }
    seenUrls.add(nextUrl);

    let response;
    try {
      response = await fetchImpl(nextUrl, {
        headers: { authorization: `Bearer ${credential.token}` },
        redirect: 'manual',
        signal: AbortSignal.timeout(20000)
      });
    } catch (error) {
      const status = 'NETWORK_ERROR';
      pageEvidence.push({ page, uri: nextUrl, status, error: error.name, timestamp: new Date().toISOString() });
      return result(operation, {
        status,
        source: { kind: 'authenticated-arm-attempt', authority: 'Azure Resource Manager', uri: url },
        scope,
        auth: { attempted: true, outcome: 'AUTHENTICATED_TOKEN_OBTAINED' },
        freshness: freshness('request-failed'),
        dimensions: dimensions(dimensionHintsForStatus(dimensionHints, status)),
        evidence: { items: values, error: { page, name: error.name } },
        pageEvidence,
        warnings: ['The ARM request failed before a conclusive service response; partial results are not availability evidence.']
      });
    }

    const text = await response.text();
    const payload = safeJson(text);
    if (!response.ok) {
      const status = statusForHttp(response.status);
      const errorEvidence = payload && payload.error ? {
        code: payload.error.code || null,
        message: payload.error.message || null
      } : { httpStatus: response.status };
      pageEvidence.push({
        page,
        uri: nextUrl,
        httpStatus: response.status,
        status,
        error: errorEvidence,
        timestamp: new Date().toISOString()
      });
      return result(operation, {
        status,
        source: { kind: 'authenticated-arm', authority: 'Azure Resource Manager', uri: url },
        scope,
        auth: { attempted: true, outcome: `HTTP_${response.status}` },
        freshness: freshness('live-error'),
        dimensions: dimensions(dimensionHintsForStatus(dimensionHints, status)),
        evidence: { items: values, error: errorEvidence },
        pageEvidence,
        warnings: [`HTTP ${response.status} is not proof of unavailability; partial results are not conclusive.`]
      });
    }
    if (!payload || !Array.isArray(payload.value)) {
      const status = 'INVALID_RESPONSE';
      pageEvidence.push({ page, uri: nextUrl, httpStatus: response.status, status, timestamp: new Date().toISOString() });
      return result(operation, {
        status,
        source: { kind: 'authenticated-arm', authority: 'Azure Resource Manager', uri: url },
        scope,
        auth: { attempted: true, outcome: 'AUTHENTICATED' },
        freshness: freshness('live-error'),
        dimensions: dimensions(dimensionHintsForStatus(dimensionHints, status)),
        evidence: { items: values, error: { page, message: 'ARM response did not contain a value array.' } },
        pageEvidence,
        warnings: ['ARM returned an unexpected response shape; partial results are not conclusive.']
      });
    }

    values.push(...payload.value);
    pageEvidence.push({
      page,
      uri: nextUrl,
      httpStatus: response.status,
      status: 'OK',
      itemCount: payload.value.length,
      timestamp: new Date().toISOString()
    });
    if (!payload.nextLink) {
      nextUrl = null;
      continue;
    }
    const safeNext = safeArmNextLink(payload.nextLink, nextUrl, url);
    if (!safeNext) {
      const status = 'UNSAFE_NEXT_LINK';
      pageEvidence.push({ page: page + 1, uri: String(payload.nextLink), status, timestamp: new Date().toISOString() });
      return result(operation, {
        status,
        source: { kind: 'authenticated-arm', authority: 'Azure Resource Manager', uri: url },
        scope,
        auth: { attempted: true, outcome: 'AUTHENTICATED' },
        freshness: freshness('live-error'),
        dimensions: dimensions(dimensionHintsForStatus(dimensionHints, status)),
        evidence: { items: values, error: { page: page + 1, code: status } },
        pageEvidence,
        warnings: ['ARM returned an unsafe or out-of-scope nextLink; it was not followed and partial results are not conclusive.']
      });
    }
    nextUrl = safeNext;
  }

  const empty = values.length === 0;
  return result(operation, {
    status: empty ? 'EMPTY_RESULT' : 'OK',
    source: { kind: 'authenticated-arm', authority: 'Azure Resource Manager', uri: url },
    scope,
    auth: { attempted: true, outcome: 'AUTHENTICATED' },
    freshness: freshness('live'),
    dimensions: dimensions(dimensionHints),
    evidence: values,
    pageEvidence,
    warnings: empty ? ['An empty successful response is not proof of unavailability; verify scope, filters, entitlement, and service behavior.'] : []
  });
}

function required(args, names) {
  return names.filter((name) => !args[name]);
}

function listArgument(...values) {
  return [...new Set(values
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter(Boolean))];
}

function normalizeRequirement(value) {
  return String(value).trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function requirementsFromArgs(args) {
  return {
    capabilities: listArgument(args.capability, args.capabilities, args['required-capabilities']),
    tools: listArgument(args.tool, args.tools, args['required-tools']),
    deploymentTypes: listArgument(args['deployment-type'], args['deployment-types'])
  };
}

function supportState(value) {
  if (value === true) return 'SUPPORTED';
  if (value === false) return 'UNSUPPORTED';
  if (typeof value === 'string') {
    const normalized = normalizeRequirement(value);
    if (['true', 'supported', 'enabled', 'available'].includes(normalized)) return 'SUPPORTED';
    if (['false', 'unsupported', 'disabled', 'unavailable'].includes(normalized)) return 'UNSUPPORTED';
  }
  if (value && typeof value === 'object') {
    if ('supported' in value) return supportState(value.supported);
    if ('enabled' in value) return supportState(value.enabled);
  }
  return 'UNKNOWN';
}

function namedSupport(metadata, requirement) {
  if (!metadata) return 'UNKNOWN';
  const expected = normalizeRequirement(requirement);
  if (Array.isArray(metadata)) {
    const names = metadata.map((entry) => normalizeRequirement(
      typeof entry === 'string' ? entry : entry && (entry.name || entry.type || entry.id)
    ));
    return names.includes(expected) ? 'SUPPORTED' : 'UNKNOWN';
  }
  if (typeof metadata === 'object') {
    for (const [name, value] of Object.entries(metadata)) {
      if (normalizeRequirement(name) === expected) return supportState(value);
    }
  }
  return 'UNKNOWN';
}

function deploymentTypeSupport(item, requirement) {
  const model = item && item.model ? item.model : {};
  const sources = [
    item && item.deploymentType,
    item && item.deploymentTypes,
    item && item.skuName,
    item && item.skus,
    model && model.deploymentType,
    model && model.deploymentTypes,
    model && model.skuName,
    model && model.skus
  ];
  const expected = normalizeRequirement(requirement);
  let metadataSeen = false;
  for (const source of sources) {
    if (source === undefined || source === null) continue;
    metadataSeen = true;
    const entries = Array.isArray(source) ? source : [source];
    for (const entry of entries) {
      const name = typeof entry === 'string' ? entry : entry && (entry.name || entry.type || entry.skuName);
      if (name && normalizeRequirement(name) === expected) return 'SUPPORTED';
    }
  }
  return metadataSeen ? 'UNSUPPORTED' : 'UNKNOWN';
}

function evaluateRequirements(item, requested) {
  const model = item && item.model ? item.model : {};
  const capabilityMetadata = [item && item.capabilities, model && model.capabilities];
  const toolMetadata = [
    item && item.tools,
    model && model.tools,
    item && item.toolCapabilities,
    model && model.toolCapabilities,
    ...capabilityMetadata
  ];
  const evaluateNamed = (requirement, sources) => {
    const states = sources.map((source) => namedSupport(source, requirement));
    if (states.includes('SUPPORTED') && states.includes('UNSUPPORTED')) return 'UNKNOWN';
    if (states.includes('SUPPORTED')) return 'SUPPORTED';
    if (states.includes('UNSUPPORTED')) return 'UNSUPPORTED';
    return 'UNKNOWN';
  };
  const capabilities = Object.fromEntries(requested.capabilities.map((requirement) => [
    requirement,
    evaluateNamed(requirement, capabilityMetadata)
  ]));
  const tools = Object.fromEntries(requested.tools.map((requirement) => [
    requirement,
    evaluateNamed(requirement, toolMetadata)
  ]));
  const deploymentTypes = Object.fromEntries(requested.deploymentTypes.map((requirement) => [
    requirement,
    deploymentTypeSupport(item, requirement)
  ]));
  const states = [...Object.values(capabilities), ...Object.values(tools), ...Object.values(deploymentTypes)];
  return {
    model: {
      name: model && model.name || null,
      version: model && model.version || null,
      format: model && model.format || null
    },
    capabilities,
    tools,
    deploymentTypes,
    outcome: states.includes('UNSUPPORTED') ? 'UNSUPPORTED' :
      states.includes('UNKNOWN') ? 'UNKNOWN' : 'SUPPORTED'
  };
}

function modelMatches(item, args) {
  const model = item && item.model ? item.model : item;
  const same = (actual, expected) => !expected || String(actual || '').toLowerCase() === String(expected).toLowerCase();
  return same(model && model.name, args.model) &&
    same(model && model.version, args.version) &&
    same(model && model.format, args.format || args.provider);
}

function applyModelConstraints(response, args) {
  if (response.status !== 'OK' || !Array.isArray(response.evidence)) return response;
  const requested = requirementsFromArgs(args);
  const hasConstraints = Object.values(requested).some((values) => values.length > 0);
  const candidates = response.evidence.filter((item) => modelMatches(item, args));
  if (!hasConstraints) {
    response.evidence = candidates;
    if (!candidates.length) {
      response.status = 'EMPTY_RESULT';
      response.warnings.push('No matching catalog entries were returned; this does not establish entitlement, quota, capacity, or deployability.');
    }
    return response;
  }

  const evaluations = candidates.map((item) => evaluateRequirements(item, requested));
  response.evidence = candidates.filter((item, index) => evaluations[index].outcome === 'SUPPORTED');
  const unknownCount = evaluations.filter((evaluation) => evaluation.outcome === 'UNKNOWN').length;
  const unsupportedCount = evaluations.filter((evaluation) => evaluation.outcome === 'UNSUPPORTED').length;
  response.constraintEvaluation = {
    requested,
    matchedCount: response.evidence.length,
    unknownCount,
    unsupportedCount,
    candidates: evaluations
  };
  response.scope.requirements = requested;
  if (!candidates.length) {
    response.status = 'EMPTY_RESULT';
    response.dimensions.compatibility = 'NOT_EVALUATED_NO_CATALOG_MATCH';
    response.warnings.push('No catalog entry matched the requested model identity; compatibility constraints could not be evaluated.');
    return response;
  }
  response.dimensions.compatibility = response.evidence.length ? 'CHECKED_SUPPORTED' :
    unknownCount ? 'INDETERMINATE_METADATA' : 'CHECKED_NOT_SUPPORTED';
  if (!response.evidence.length) {
    response.status = unknownCount ? 'CONSTRAINTS_UNVERIFIED' : 'EMPTY_RESULT';
    response.warnings.push(unknownCount
      ? 'Catalog metadata did not explicitly establish every requested capability, tool, and deployment type; unknown candidates were excluded conservatively.'
      : 'Catalog entries explicitly evaluated did not support every requested capability, tool, and deployment type.');
  }
  return response;
}

async function findModels(operation, args, dependencies = {}) {
  const missing = required(args, ['subscription', 'location']);
  if (missing.length) return result(operation, { warnings: [`Missing explicit live context: ${missing.join(', ')}.`] });
  const scope = {
    subscription: args.subscription,
    location: args.location,
    model: args.model || null,
    version: args.version || null,
    format: args.format || args.provider || null,
    requirements: requirementsFromArgs(args)
  };
  const url = `${ARM}/subscriptions/${encodeURIComponent(args.subscription)}/providers/Microsoft.CognitiveServices/locations/${encodeURIComponent(args.location)}/models?api-version=${API_VERSION}`;
  const response = await armGet(operation, url, scope, {
    catalogPresence: 'CHECKED',
    regionalAvailability: 'CHECKED'
  }, dependencies);
  return applyModelConstraints(response, args);
}

async function inspectModel(args, dependencies = {}) {
  const response = await findModels('inspect_model', args, dependencies);
  if (response.status === 'OK' && Array.isArray(response.evidence) && response.evidence.length > 1) {
    response.warnings.push('Multiple entries matched; provide --version and --format for a narrower inspection.');
  }
  return response;
}

function statusCategory(status) {
  if (status === 'AUTH_REQUIRED') return 'authentication';
  if (status === 'FORBIDDEN_OR_ENTITLEMENT_UNKNOWN') return 'permission';
  if (['THROTTLED', 'SERVICE_ERROR', 'NETWORK_ERROR', 'REQUEST_TIMEOUT'].includes(status)) return 'transient';
  if (['UNSAFE_NEXT_LINK', 'PAGINATION_LIMIT_EXCEEDED', 'PAGINATION_LOOP_DETECTED', 'UNSUPPORTED_OR_INVALID_REQUEST'].includes(status)) {
    return 'unsupported';
  }
  if (status === 'CONSTRAINTS_UNVERIFIED') return 'unknown';
  if (status === 'SCOPE_NOT_FOUND_OR_API_MISMATCH') return 'scope';
  if (status === 'INVALID_RESPONSE') return 'response';
  return status.toLowerCase();
}

function summarizeStatuses(checks) {
  const byStatus = {};
  const byCategory = {};
  for (const check of checks) {
    byStatus[check.status] = (byStatus[check.status] || 0) + 1;
    const category = statusCategory(check.status);
    byCategory[category] = (byCategory[category] || 0) + 1;
  }
  return { byStatus, byCategory };
}

function aggregateRegionStatus(checks, confirmedCount) {
  const failures = checks.filter((check) => !SUCCESS_STATUSES.has(check.status));
  if (!failures.length) return confirmedCount ? 'OK' : 'EMPTY_RESULT';
  const statuses = new Set(failures.map((check) => check.status));
  const hasConclusiveCheck = checks.some((check) => SUCCESS_STATUSES.has(check.status));
  return !hasConclusiveCheck && statuses.size === 1 ? failures[0].status : 'PARTIAL_FAILURE';
}

function aggregateFreshness(checks) {
  if (!checks.length) return freshness('not-live', { sources: [] });
  const sources = checks.map((check) => ({
    location: check.scope.location || null,
    classification: check.freshness.classification,
    ageSeconds: check.freshness.ageSeconds
  }));
  const classifications = new Set(sources.map((source) => source.classification));
  const allConclusive = checks.every((check) => SUCCESS_STATUSES.has(check.status));
  const classification = classifications.size === 1
    ? (allConclusive || sources[0].classification !== 'live' ? sources[0].classification : 'live-error')
    : 'mixed';
  return freshness(classification, { sources });
}

function aggregateDimension(checks, name) {
  const states = checks.map((check) => check.dimensions[name]);
  if (states.every((state) => state === 'UNKNOWN')) return 'UNKNOWN';
  if (states.every((state) => state === 'CHECKED')) return 'CHECKED';
  if (states.every((state) => String(state).startsWith('CHECKED'))) return 'CHECKED_BY_REGION';
  if (states.some((state) => String(state).startsWith('CHECKED'))) return 'PARTIALLY_CHECKED_OR_INDETERMINATE';
  return new Set(states).size === 1 ? states[0] : 'INDETERMINATE_MIXED';
}

function aggregateAuth(checks) {
  const outcomes = [...new Set(checks.map((check) => check.auth.outcome))];
  return {
    attempted: checks.some((check) => check.auth.attempted),
    outcome: outcomes.length === 1 ? outcomes[0] : 'MIXED',
    outcomes
  };
}

async function findRegions(args, dependencies = {}) {
  const missing = required(args, ['subscription', 'model', 'regions']);
  if (missing.length) {
    return result('find_regions', {
      warnings: [
        `Missing explicit context: ${missing.join(', ')}.`,
        'Provide --regions as a comma-separated, policy-approved candidate set; this tool does not embed a static region matrix.'
      ]
    });
  }
  const regions = String(args.regions).split(',').map((value) => value.trim()).filter(Boolean);
  if (!regions.length) {
    return result('find_regions', {
      scope: { subscription: args.subscription, candidateRegions: [], model: args.model },
      warnings: ['Provide at least one non-empty, policy-approved candidate region.']
    });
  }
  const checks = [];
  for (const location of regions) {
    checks.push(await findModels('find_regions', { ...args, location }, dependencies));
  }
  const confirmed = checks.filter((check) => check.status === 'OK' && Array.isArray(check.evidence) && check.evidence.length > 0)
    .map((check) => check.scope.location);
  const aggregateStatus = aggregateRegionStatus(checks, confirmed.length);
  const hasConstraintRequest = Object.values(requirementsFromArgs(args)).some((values) => values.length > 0);
  return result('find_regions', {
    status: aggregateStatus,
    source: { kind: 'arm-composite', authority: 'Azure Resource Manager', uri: DOCS.models },
    freshness: aggregateFreshness(checks),
    scope: {
      subscription: args.subscription,
      candidateRegions: regions,
      model: args.model,
      version: args.version || null,
      requirements: requirementsFromArgs(args)
    },
    auth: aggregateAuth(checks),
    dimensions: dimensions({
      catalogPresence: aggregateDimension(checks, 'catalogPresence'),
      compatibility: hasConstraintRequest
        ? aggregateDimension(checks, 'compatibility')
        : 'UNKNOWN',
      regionalAvailability: aggregateDimension(checks, 'regionalAvailability')
    }),
    evidence: { confirmedCatalogRegions: confirmed, checks },
    statusSummary: summarizeStatuses(checks),
    warnings: [
      'Catalog-region results do not prove entitlement, quota, capacity, deployability, or runtime health.',
      ...(checks.some((check) => !SUCCESS_STATUSES.has(check.status))
        ? ['One or more region checks were inconclusive; inspect each check and its freshness/auth/error evidence.']
        : [])
    ]
  });
}

async function checkQuota(args, dependencies = {}) {
  const missing = required(args, ['subscription', 'location']);
  if (missing.length) return result('check_quota', { warnings: [`Missing explicit live context: ${missing.join(', ')}.`] });
  const scope = { subscription: args.subscription, location: args.location, modelOrFamily: args.model || args.family || null };
  const url = `${ARM}/subscriptions/${encodeURIComponent(args.subscription)}/providers/Microsoft.CognitiveServices/locations/${encodeURIComponent(args.location)}/usages?api-version=${API_VERSION}`;
  const response = await armGet('check_quota', url, scope, { quota: 'CHECKED' }, dependencies);
  if (response.status === 'OK' && Array.isArray(response.evidence) && (args.model || args.family)) {
    const term = String(args.model || args.family).toLowerCase();
    response.evidence = response.evidence.filter((item) => JSON.stringify(item.name || item).toLowerCase().includes(term));
    if (!response.evidence.length) {
      response.status = 'EMPTY_RESULT';
      response.warnings.push('No matching usage record was found; naming may be family/SKU based, so this is not proof of zero quota.');
    }
  }
  return response;
}

async function checkCapacity(args, dependencies = {}) {
  const missing = required(args, ['subscription', 'location', 'format', 'model', 'version']);
  if (missing.length) return result('check_capacity', { warnings: [`Missing explicit live context: ${missing.join(', ')}.`] });
  const query = new URLSearchParams({
    'api-version': API_VERSION,
    modelFormat: args.format,
    modelName: args.model,
    modelVersion: args.version
  });
  const scope = {
    subscription: args.subscription,
    location: args.location,
    format: args.format,
    model: args.model,
    version: args.version,
    deploymentType: args['deployment-type'] || null
  };
  const url = `${ARM}/subscriptions/${encodeURIComponent(args.subscription)}/providers/Microsoft.CognitiveServices/locations/${encodeURIComponent(args.location)}/modelCapacities?${query}`;
  const response = await armGet('check_capacity', url, scope, { capacity: 'CHECKED' }, dependencies);
  if (response.status === 'OK' && args['deployment-type'] && Array.isArray(response.evidence)) {
    const requested = requirementsFromArgs(args);
    const evaluations = response.evidence.map((item) => ({
      deploymentType: args['deployment-type'],
      outcome: deploymentTypeSupport(item, args['deployment-type'])
    }));
    response.evidence = response.evidence.filter((item, index) => evaluations[index].outcome === 'SUPPORTED');
    const unknownCount = evaluations.filter((evaluation) => evaluation.outcome === 'UNKNOWN').length;
    const unsupportedCount = evaluations.filter((evaluation) => evaluation.outcome === 'UNSUPPORTED').length;
    response.constraintEvaluation = {
      requested,
      matchedCount: response.evidence.length,
      unknownCount,
      unsupportedCount,
      candidates: evaluations
    };
    if (!response.evidence.length) {
      response.status = unknownCount ? 'CONSTRAINTS_UNVERIFIED' : 'EMPTY_RESULT';
      response.dimensions.capacity = unknownCount ? 'INDETERMINATE_METADATA' : 'CHECKED_NOT_SUPPORTED';
      response.warnings.push(unknownCount
        ? 'Capacity records did not expose enough structured deployment-type metadata; unknown records were excluded conservatively.'
        : 'No capacity record explicitly supported the requested deployment type.');
    }
  }
  return response;
}

function explainDeploymentOptions(args) {
  return result('explain_deployment_options', {
    status: 'OK',
    scope: { requirements: args.requirements || null, subscription: args.subscription || null },
    dimensions: dimensions({ compatibility: 'REQUIRES_DISCOVERY', deployability: 'REQUIRES_LIVE_VERIFICATION' }),
    evidence: {
      guidance: [
        'Evaluate direct model invocation and Model Router before adding an agent runtime.',
        'For application-owned behavior, evaluate the Responses API ephemeral agent pattern.',
        'Evaluate Prompt Agent for declarative instructions and supported tools; Hosted Agent for custom code, dependencies, or runtime behavior.',
        'Use Microsoft Agent Framework only when custom orchestration earns its complexity.',
        'Evaluate Foundry IQ, the singular Toolbox, Foundry Skills preview, and current Foundry Tools before custom equivalents.',
        'Distinguish Foundry Local on a device from Foundry Local on Azure Local.',
        'Retrieve current deployment-family terminology from Microsoft Learn, then verify catalog, entitlement, quota, and capacity live.'
      ],
      authoritativeEntryPoints: [
        DOCS.deployments,
        'https://learn.microsoft.com/azure/foundry/openai/concepts/model-router',
        'https://learn.microsoft.com/azure/foundry/agents/quickstarts/responses-api',
        'https://learn.microsoft.com/azure/foundry/agents/'
      ]
    },
    warnings: ['This operation provides retrievable guidance, not a model-region availability fact.']
  });
}

function loadReplay(operation, file) {
  const payload = safeJson(readFileSync(resolve(file), 'utf8'));
  const entry = payload && (payload[operation] || payload);
  if (!entry) throw new Error(`Replay file has no ${operation} entry.`);
  return result(operation, {
    ...entry,
    status: 'STALE_REPLAY',
    freshness: { classification: 'stale-replay', ageSeconds: null },
    auth: { attempted: false, outcome: 'REPLAY_ONLY' },
    warnings: [...(entry.warnings || []), 'Replay/cache evidence is marked stale and cannot prove current deployability.']
  });
}

function printHelp() {
  console.log(`Read-only Microsoft Foundry availability discovery

Usage:
  node scripts/foundry-availability.js <operation> [options]

Operations:
  find_models, inspect_model, find_regions, check_quota, check_capacity,
  explain_deployment_options

Live ARM options:
  --subscription ID --location REGION --model NAME --version VERSION
  --format FORMAT --provider PROVIDER --deployment-type TYPE
  --capabilities CAPABILITY[,CAPABILITY] --tools TOOL[,TOOL]
  --regions eastus,westus2

Other:
  --replay FILE       Read marked-stale evidence without network/authentication
  --requirements TEXT Guidance context for explain_deployment_options

The tool is read-only. It never logs in, selects a subscription, deploys, or changes quota.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const operation = args._[0];
  if (!operation || args.help || !OPERATIONS.has(operation)) {
    printHelp();
    process.exitCode = operation && !args.help ? 2 : 0;
    return;
  }
  let output;
  if (args.replay) output = loadReplay(operation, args.replay);
  else if (operation === 'find_models') output = await findModels(operation, args);
  else if (operation === 'inspect_model') output = await inspectModel(args);
  else if (operation === 'find_regions') output = await findRegions(args);
  else if (operation === 'check_quota') output = await checkQuota(args);
  else if (operation === 'check_capacity') output = await checkCapacity(args);
  else output = explainDeploymentOptions(args);
  console.log(JSON.stringify(output, null, 2));
  if (!['OK', 'EMPTY_RESULT', 'STALE_REPLAY', 'NEEDS_CONTEXT'].includes(output.status)) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(JSON.stringify(result(process.argv[2] || 'unknown', {
      status: 'INVALID_RESPONSE',
      evidence: { error: error.message },
      warnings: ['The discovery command failed without establishing availability.']
    }), null, 2));
    process.exitCode = 1;
  });
}

module.exports = {
  aggregateRegionStatus,
  applyModelConstraints,
  armGet,
  checkCapacity,
  checkQuota,
  dimensions,
  evaluateRequirements,
  explainDeploymentOptions,
  findModels,
  findRegions,
  parseArgs,
  requirementsFromArgs,
  result,
  safeArmNextLink,
  statusForHttp
};
