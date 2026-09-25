# Grounded knowledge experiment journal

## Outcome and acceptance criteria

Implemented `samples/permission-aware-knowledge/` as a compact .NET 8 console
application with checked-in synthetic documents, deterministic local retrieval,
permission filtering before ranking and generation, exact citations, and
closed failure for unauthorized or insufficient evidence. Offline evaluation
must pass without Azure credentials. Foundry IQ/model runtime use must remain
opt-in, secretless, and separately validated in an authenticated environment.

## Architecture decision

The control implementation uses a small retrieval pipeline rather than an
agent: document source -> authorization filter -> deterministic ranker ->
evidence threshold -> answer generator -> citation validation. The local
fixture source and deterministic generator are the default. The optional
Foundry adapter uses `DefaultAzureCredential`, sends caller groups to the
knowledge endpoint, reapplies permissions locally, and validates that model
citations refer only to selected authorized evidence.

This separates stable, offline-verifiable invariants from volatile tenant,
endpoint, SDK, deployment, quota, RBAC, and runtime-health evidence.

## Squad activity

A separate Squad architecture session exceeded four minutes without producing
a durable artifact. That triggered implementation-owner recovery: this narrow
owner proceeded directly from the supplied acceptance contract, implemented
the control, added deterministic evaluations, and recorded the architecture
and evidence here.

The narrow owner could cover the executable pipeline, fixtures, permission and
citation tests, setup documentation, and local validation. It could not replace
parallel specialist evidence for tenant-specific Foundry IQ availability,
current API shape, deployed-model compatibility, identity/RBAC review,
production observability, or independent architecture and Responsible AI gates.

## Evidence and assumptions

- All fixture content is synthetic and checked in.
- `Everyone` is the only public ACL marker; every other group requires an
  ordinal-ignore-case match with a caller group.
- Authorization happens before ranking; the generator receives only ranked
  authorized evidence.
- Unknown and unauthorized-only questions intentionally share a generic
  insufficient-evidence response to avoid existence disclosure.
- Citations include the document ID, title, URI, and exact selected passage.
- The optional authenticated endpoint contract is an adapter boundary, not a
  claim that every Foundry tenant exposes those routes unchanged.
- `DefaultAzureCredential` is used only in the opt-in provider. No credential
  values or local Azure state are committed.

## Validation log

- `dotnet build samples/permission-aware-knowledge/PermissionAwareKnowledge.slnx
  --configuration Release`: passed with 0 warnings and 0 errors.
- `DOTNET_ROLL_FORWARD=Major dotnet run --project
  samples/permission-aware-knowledge/tests/PermissionAwareKnowledge.Evaluation
  --configuration Release --no-build`: 4/4 evaluations passed. Roll-forward
  was required only because the validation host had the .NET 10 runtime but not
  the .NET 8 runtime; the projects remain targeted at .NET 8.
- Authorized CLI scenario returned the rollback sentence with the
  `engineering-orion-runbook` citation.
- The same question with only the `Everyone` caller group returned generic
  insufficient evidence, zero citations, and no restricted content.
- `npm test`: 38/38 repository tests passed, including the new sample structure
  and required-journal-heading check.
- Authenticated Foundry IQ/runtime validation intentionally not run without a
  configured tenant, endpoints, identity, and authorization scope.

## Friction and recovery

The architecture workstream did not produce a durable artifact within the
four-minute coordination budget. Recovery favored a minimal direct
implementation with explicit seams and documented assumptions instead of
waiting indefinitely or inventing tenant-specific evidence. The volatile
Foundry surface was isolated behind an environment-configured adapter so local
acceptance could be completed without weakening authentication or committing
secrets.

## What Squad did well

- The routing model correctly identifies permission-aware grounding as a
  knowledge-engineering concern.
- Existing guidance strongly separates documentation claims from authenticated
  subscription and runtime evidence.
- Identity guidance favors `DefaultAzureCredential`, managed identity, and
  least privilege.
- The experiment contract made offline determinism and fail-closed behavior
  measurable.

## Core FoundrySquad improvements

| Surface | Evidence | Impact | Effort | Confidence |
|---|---|---:|---:|---:|
| Durable architecture timeout | The parallel architecture session exceeded four minutes without an artifact. | Add a timed fallback that writes a minimal decision stub before handing ownership back. | Medium | High |
| Knowledge sample template | This implementation had to define ACL, evidence, and citation contracts from scratch. | Ship a reusable permission-aware grounding artifact template and evaluation checklist. | Medium | High |
| Runtime contract verification | Foundry IQ and model endpoint shapes are volatile and tenant-dependent. | Add an authenticated probe that records API version, identity scope, RBAC result, and sanitized response schema. | High | Medium |
| Cross-session handoff | The control owner received intent but no durable architecture artifact. | Require handoffs to name artifact path, status, timestamp, assumptions, and exact acceptance condition. | Low | High |
| Citation evaluator | Local tests validate exact citations, but no shared evaluator exists. | Add a standard evaluator for citation presence, source authorization, quote support, and citation closure. | Medium | High |

## Comparison score

| Dimension | Score (1-5) | Evidence |
|---|---:|---|
| Acceptance coverage | 5 | The sample, fixtures, evaluation executable, setup guide, and journal cover every supplied deliverable. |
| Permission isolation | 5 | Authorization precedes ranking, tests prove restricted evidence never reaches generation, and failures do not disclose document existence. |
| Grounding and citations | 5 | Answers require sufficient evidence and citations constrained to selected authorized passages. |
| Offline determinism | 5 | Checked-in fixtures, ordinal tie-breaking, deterministic passage selection, and no model call on the default path. |
| Foundry integration readiness | 3 | Secretless opt-in adapter and contracts exist, but no tenant-specific authenticated runtime evidence was available. |
| Identity and secret hygiene | 5 | `DefaultAzureCredential` is isolated to opt-in runtime; no secrets or local Azure state are committed. |
| Evaluation quality | 4 | Core authorization, citation, unknown-question, and generator-boundary cases are covered; live failure-mode and load tests remain. |
| Documentation and operability | 4 | Setup and validation boundaries are explicit; production telemetry and deployment automation are intentionally out of scope. |
| Squad coordination resilience | 3 | Implementation-owner recovery succeeded, but the parallel architecture session produced no durable artifact before timeout. |
