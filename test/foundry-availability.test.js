'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  armGet,
  checkCapacity,
  checkQuota,
  findModels,
  findRegions
} = require('../scripts/foundry-availability');

const authenticated = () => ({
  token: 'test-token',
  auth: { attempted: true, outcome: 'AUTHENTICATED' }
});

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload)
  };
}

function pagedFetch(pages) {
  const requests = [];
  const fetch = async (url) => {
    requests.push(url);
    assert.ok(pages[url], `unexpected request ${url}`);
    return pages[url];
  };
  fetch.requests = requests;
  return fetch;
}

test('find_models follows nextLink and applies explicit capability, tool, and deployment constraints', async () => {
  const subscription = 'sub-models';
  const first = `https://management.azure.com/subscriptions/${subscription}/providers/Microsoft.CognitiveServices/locations/eastus/models?api-version=2024-10-01`;
  const second = `https://management.azure.com/subscriptions/${subscription}/providers/Microsoft.CognitiveServices/locations/eastus/models?api-version=2024-10-01&$skiptoken=next`;
  const fetch = pagedFetch({
    [first]: jsonResponse({
      value: [{
        model: { name: 'candidate', version: '1', format: 'OpenAI' },
        capabilities: { vision: false },
        tools: ['function-calling'],
        deploymentTypes: ['GlobalStandard']
      }],
      nextLink: second
    }),
    [second]: jsonResponse({
      value: [{
        model: { name: 'candidate', version: '1', format: 'OpenAI' },
        capabilities: { vision: true },
        tools: ['function-calling'],
        deploymentTypes: ['GlobalStandard']
      }]
    })
  });

  const output = await findModels('find_models', {
    subscription,
    location: 'eastus',
    model: 'candidate',
    capabilities: 'vision',
    tools: 'function-calling',
    'deployment-type': 'GlobalStandard'
  }, { getArmToken: authenticated, fetch });

  assert.equal(output.status, 'OK');
  assert.equal(output.evidence.length, 1);
  assert.equal(output.constraintEvaluation.matchedCount, 1);
  assert.equal(output.constraintEvaluation.unsupportedCount, 1);
  assert.equal(output.pageEvidence.length, 2);
  assert.deepEqual(fetch.requests, [first, second]);
  assert.equal(output.dimensions.compatibility, 'CHECKED_SUPPORTED');
  assert.equal(output.dimensions.entitlement, 'UNKNOWN');
  assert.equal(output.dimensions.deployability, 'UNKNOWN');
  assert.equal(output.dimensions.runtimeHealth, 'NOT_CHECKED');
});

test('find_models excludes candidates whose requested constraints cannot be verified', async () => {
  const output = await findModels('find_models', {
    subscription: 'sub-unknown',
    location: 'eastus',
    model: 'candidate',
    capabilities: 'vision',
    tools: 'function-calling',
    'deployment-type': 'GlobalStandard'
  }, {
    getArmToken: authenticated,
    fetch: async () => jsonResponse({
      value: [{ model: { name: 'candidate', version: '1', format: 'OpenAI' } }]
    })
  });

  assert.equal(output.status, 'CONSTRAINTS_UNVERIFIED');
  assert.deepEqual(output.evidence, []);
  assert.equal(output.constraintEvaluation.unknownCount, 1);
  assert.equal(output.dimensions.compatibility, 'INDETERMINATE_METADATA');
});

test('check_quota follows all Account Usages pages', async () => {
  const subscription = 'sub-quota';
  const first = `https://management.azure.com/subscriptions/${subscription}/providers/Microsoft.CognitiveServices/locations/eastus/usages?api-version=2024-10-01`;
  const second = `https://management.azure.com/subscriptions/${subscription}/providers/Microsoft.CognitiveServices/locations/eastus/usages?api-version=2024-10-01&$skiptoken=next`;
  const fetch = pagedFetch({
    [first]: jsonResponse({ value: [{ name: { value: 'family-a' } }], nextLink: second }),
    [second]: jsonResponse({ value: [{ name: { value: 'family-b' } }] })
  });

  const output = await checkQuota({ subscription, location: 'eastus' }, {
    getArmToken: authenticated,
    fetch
  });

  assert.equal(output.status, 'OK');
  assert.equal(output.evidence.length, 2);
  assert.equal(output.pageEvidence.length, 2);
  assert.deepEqual(fetch.requests, [first, second]);
  assert.equal(output.dimensions.quota, 'CHECKED');
  assert.equal(output.dimensions.capacity, 'UNKNOWN');
});

test('check_capacity follows all Model Capacities pages and filters deployment type exactly', async () => {
  const subscription = 'sub-capacity';
  const query = 'api-version=2024-10-01&modelFormat=OpenAI&modelName=candidate&modelVersion=1';
  const first = `https://management.azure.com/subscriptions/${subscription}/providers/Microsoft.CognitiveServices/locations/eastus/modelCapacities?${query}`;
  const second = `${first}&$skiptoken=next`;
  const fetch = pagedFetch({
    [first]: jsonResponse({
      value: [{ skuName: 'RegionalStandard', availableCapacity: 10 }],
      nextLink: second
    }),
    [second]: jsonResponse({
      value: [{ skuName: 'GlobalStandard', availableCapacity: 20 }]
    })
  });

  const output = await checkCapacity({
    subscription,
    location: 'eastus',
    format: 'OpenAI',
    model: 'candidate',
    version: '1',
    'deployment-type': 'GlobalStandard'
  }, { getArmToken: authenticated, fetch });

  assert.equal(output.status, 'OK');
  assert.equal(output.evidence.length, 1);
  assert.equal(output.evidence[0].availableCapacity, 20);
  assert.equal(output.constraintEvaluation.unsupportedCount, 1);
  assert.equal(output.pageEvidence.length, 2);
  assert.deepEqual(fetch.requests, [first, second]);
  assert.equal(output.dimensions.capacity, 'CHECKED');
  assert.equal(output.dimensions.deployability, 'UNKNOWN');
});

test('pagination errors preserve partial items, page source, and transient category', async () => {
  const first = 'https://management.azure.com/subscriptions/sub-errors/providers/Microsoft.CognitiveServices/locations/eastus/models?api-version=2024-10-01';
  const second = `${first}&$skiptoken=next`;
  const output = await armGet('find_models', first, {
    subscription: 'sub-errors',
    location: 'eastus'
  }, {
    catalogPresence: 'CHECKED'
  }, {
    getArmToken: authenticated,
    fetch: pagedFetch({
      [first]: jsonResponse({ value: [{ model: { name: 'first' } }], nextLink: second }),
      [second]: jsonResponse({ error: { code: 'TooManyRequests', message: 'retry later' } }, 429)
    })
  });

  assert.equal(output.status, 'THROTTLED');
  assert.equal(output.freshness.classification, 'live-error');
  assert.equal(output.evidence.items.length, 1);
  assert.equal(output.evidence.error.code, 'TooManyRequests');
  assert.equal(output.pageEvidence[1].httpStatus, 429);
  assert.equal(output.dimensions.catalogPresence, 'INDETERMINATE_TRANSIENT');
});

test('unsafe cross-origin nextLink is rejected without sending the ARM token', async () => {
  const first = 'https://management.azure.com/subscriptions/sub-safe/providers/Microsoft.CognitiveServices/locations/eastus/models?api-version=2024-10-01';
  let requestCount = 0;
  const output = await armGet('find_models', first, {
    subscription: 'sub-safe',
    location: 'eastus'
  }, {
    catalogPresence: 'CHECKED'
  }, {
    getArmToken: authenticated,
    fetch: async () => {
      requestCount += 1;
      return jsonResponse({
        value: [{ model: { name: 'first' } }],
        nextLink: 'https://example.invalid/steal-token'
      });
    }
  });

  assert.equal(output.status, 'UNSAFE_NEXT_LINK');
  assert.equal(requestCount, 1);
  assert.equal(output.evidence.items.length, 1);
  assert.equal(output.dimensions.catalogPresence, 'INDETERMINATE_UNSUPPORTED');
});

test('find_regions preserves mixed success and permission failure evidence', async () => {
  const output = await findRegions({
    subscription: 'sub-regions',
    model: 'candidate',
    regions: 'eastus,westus'
  }, {
    getArmToken: authenticated,
    fetch: async (url) => url.includes('/eastus/')
      ? jsonResponse({ value: [{ model: { name: 'candidate' } }] })
      : jsonResponse({ error: { code: 'AuthorizationFailed', message: 'denied' } }, 403)
  });

  assert.equal(output.status, 'PARTIAL_FAILURE');
  assert.deepEqual(output.evidence.confirmedCatalogRegions, ['eastus']);
  assert.equal(output.evidence.checks[1].status, 'FORBIDDEN_OR_ENTITLEMENT_UNKNOWN');
  assert.equal(output.statusSummary.byCategory.permission, 1);
  assert.equal(output.freshness.classification, 'mixed');
  assert.notEqual(output.freshness.classification, 'live');
  assert.equal(output.auth.outcome, 'MIXED');
  assert.equal(output.dimensions.regionalAvailability, 'PARTIALLY_CHECKED_OR_INDETERMINATE');
  assert.equal(output.dimensions.entitlement, 'UNKNOWN');
});

test('find_regions does not label uniformly unverified constraint checks as live', async () => {
  const output = await findRegions({
    subscription: 'sub-unverified',
    model: 'candidate',
    regions: 'eastus,westus',
    capabilities: 'vision'
  }, {
    getArmToken: authenticated,
    fetch: async () => jsonResponse({
      value: [{ model: { name: 'candidate' } }]
    })
  });

  assert.equal(output.status, 'CONSTRAINTS_UNVERIFIED');
  assert.equal(output.freshness.classification, 'live-error');
  assert.deepEqual(
    output.freshness.sources.map((source) => source.classification),
    ['live', 'live']
  );
  assert.equal(output.statusSummary.byCategory.unknown, 2);
  assert.equal(output.dimensions.catalogPresence, 'CHECKED');
  assert.equal(output.dimensions.compatibility, 'INDETERMINATE_METADATA');
  assert.equal(output.dimensions.regionalAvailability, 'CHECKED');
});
