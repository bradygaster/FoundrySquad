# Foundry Availability

## Purpose

Read-only discovery that prevents remembered model facts from becoming deployment claims.

## Conceptual Operations

- `find_models`
- `inspect_model`
- `find_regions`
- `check_quota`
- `check_capacity`
- `explain_deployment_options`

Use `node scripts/foundry-availability.js --help` for the repository implementation.

## Authority Order

1. Successful live operation
2. Authenticated ARM Location Models, Location Based Model Capacities, and Account Usages
3. Project-aware Foundry MCP/SDK/`azd`
4. Current Microsoft Learn
5. Official REST/SDK documentation
6. Official Microsoft samples
7. Marked-stale replay/cache

Foundry MCP is preferred when project-aware and convenient, but it is preview. ARM is the durable subscription verification layer.

## Result Contract

Every result includes `status`, `source`, `timestamp`, `freshness`, `scope`, `auth`, `evidence`, and `warnings`. Keep these dimensions separate:

- catalog presence
- compatibility
- regional availability
- entitlement
- quota
- capacity
- deployability
- runtime health

401, 403, 404, 429, 5xx, timeouts, malformed payloads, and empty results are not proof of unavailability.

Requested capability, tool, and deployment-type constraints require explicit structured metadata. Exclude unknown candidates conservatively and report `CONSTRAINTS_UNVERIFIED`; do not infer support from model names or unstructured JSON text. Follow only safe ARM `nextLink` values on the same management origin and subscription scope, retain page-level evidence, and preserve per-region authentication, permission, transient, unsupported, and freshness states in composite results.

## Stable ARM Entry Points

- Location Models: `https://learn.microsoft.com/rest/api/aiservices/accountmanagement/models/list?view=rest-aiservices-accountmanagement-2024-10-01`
- Location Model Capacities: `https://learn.microsoft.com/rest/api/aiservices/accountmanagement/location-based-model-capacities/list?view=rest-aiservices-accountmanagement-2024-10-01`
- Account Usages: `https://learn.microsoft.com/rest/api/aiservices/accountmanagement/usages/list?view=rest-aiservices-accountmanagement-2024-10-01`

Use API version `2024-10-01` for these operations where applicable. Do not create a static model-region matrix.
