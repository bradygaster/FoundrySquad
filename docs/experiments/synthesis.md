# Foundry Sample Lab Synthesis

## Result

The lab produced three integrated, local-first samples:

| Scenario | Sample | Offline validation | Authenticated Foundry status |
| --- | --- | --- | --- |
| Direct model / Model Router | [`model-routing-advisor`](../../samples/model-routing-advisor/README.md) | 10/10 tests passed | Standalone app verified against fixed model and Model Router |
| Tool-using agent | [`change-risk-agent`](../../samples/change-risk-agent/README.md) | 10/10 checks passed | Standalone app verified through real function-call continuation |
| Grounded knowledge | [`permission-aware-knowledge`](../../samples/permission-aware-knowledge/README.md) | 4/4 evaluations passed | Standalone app verified through Foundry IQ retrieval and model synthesis |

All three experiment journals pass the shared validator. Repository tests pass
42/42.

## Standalone repository follow-up

The integrated samples were copied into private standalone repositories so each
application can be built, tested, provisioned, and operated without depending on
the FoundrySquad source tree:

| Scenario | Standalone repository |
| --- | --- |
| Direct model / Model Router | [`bradygaster/foundry-model-routing-advisor`](https://github.com/bradygaster/foundry-model-routing-advisor) |
| Tool-using agent | [`bradygaster/foundry-change-risk-agent`](https://github.com/bradygaster/foundry-change-risk-agent) |
| Grounded knowledge | [`bradygaster/foundry-permission-aware-knowledge`](https://github.com/bradygaster/foundry-permission-aware-knowledge) |

Authenticated follow-up work reuses subscription
`104482b7-4580-4de0-9453-0fc78df0b80e`, resource group
`rg-squad-imagegen`, Foundry account `squad-imagegen-swc-1ntj32`, and project
`squad-imagegen-swc-1ntj32-proj`. The project endpoint is
`https://squad-imagegen-swc-1ntj32.services.ai.azure.com/api/projects/squad-imagegen-swc-1ntj32-proj`.
Calls use Microsoft Entra authentication with the
`https://ai.azure.com/.default` scope; Azure AI Search knowledge retrieval uses
`https://search.azure.com/.default`.

The shared project Responses API was observed returning a completed
`FOUNDRY_E2E_OK` response from `gpt-5-mini`. A separately provisioned
`model-router-advisor` deployment (model `model-router`, version `2025-11-18`,
GlobalStandard capacity 10) was also observed completing requests and selecting
both `gpt-5.4-mini-2026-03-17` and `grok-4-1-fast-reasoning` as backing models.
The compiled standalone CLI completed the high-capability path in one attempt
with `HIGH_ROUTE_OK`. The existing `gpt-5-mini`
deployment has GlobalStandard capacity 3 and returned transient HTTP 429
responses before bounded retry succeeded, so rate-limit handling is part of the
standalone runtime contract rather than an undocumented environmental detail.

The tool-agent standalone repository completed the real project Responses
lifecycle: strict function call, exact call-ID/name/argument binding, one
read-only host dispatch, tool-result continuation, and final advisory. The
merged implementation passed 13 offline checks and authenticated known,
unknown, and adversarial scenarios. A repeated live run exposed that JSON schema
shape alone did not constrain safety-critical semantic values; the host now
canonically derives ID, classification, evidence factors, and mandatory human
review from the authoritative tool result while still requiring parseable model
output.

The grounded-knowledge standalone acceptance used Azure AI Search resource
`/subscriptions/104482b7-4580-4de0-9453-0fc78df0b80e/resourceGroups/rg-squad-imagegen/providers/Microsoft.Search/searchServices/fsq-knowledge-swc-1ntj32`
with index `permission-aware-documents`, knowledge source
`permission-aware-kb-source`, and knowledge base `permission-aware-kb`. The live
application called the `2026-08-01-preview` knowledge-base retrieve action and
the project `gpt-5-mini` Responses API. The authorized tenant-a Engineering
scenario returned one exact `engineering-orion-runbook` citation; unauthorized,
unknown, and adversarial scenarios returned `InsufficientEvidence` with zero
citations.

## Cross-scenario score

| Dimension | Average (1-5) | Interpretation |
| --- | ---: | --- |
| Architecture economy | 5.00 | Every scenario converged on a small local-first design and rejected unjustified infrastructure. |
| Routing accuracy | 3.33 | The right domains were identified, but broad routing did not reliably produce timely reusable artifacts. |
| Handoff quality | 2.67 | The tool scenario produced a strong architecture artifact; model and knowledge controls lacked durable Squad handoffs. |
| Evidence discipline | 5.00 | Local, documentation, authenticated, and runtime evidence remained distinct. |
| Implementation usefulness | 4.67 | All samples are runnable and tested; the tool sample intentionally leaves its SDK adapter as a boundary. |
| Quality coverage | 4.67 | Deterministic acceptance behavior is covered; authenticated runtime and service failure evidence remain. |
| Security and RAI | 5.00 | Secretless identity, fail-closed behavior, read-only/advisory scope, and permission isolation are explicit. |
| Ceremony efficiency | 2.00 | Every initial Full-Mode session exceeded the launch target before code; two produced no durable artifact before recovery. |
| Recovery behavior | 5.00 | Timeboxing, direct controls, parent workers, validators, and explicit evidence gaps recovered the lab. |

## How Squad helped

### Model routing

Squad selected the correct architecture boundary: direct model semantics with one
deployment name that can target a fixed model or Model Router, deterministic local
transport for tests, and no agent framework. Its main failure was delivery: the
architecture session took more than five minutes before a reusable artifact, so a
direct implementation control completed the sample. Its later Squad-led branch
(`7e7485bedfc57ae26d208b57596351986a6ff2a4`) was intentionally not merged
after pre-ship rejection exposed a likely wrong token audience, weak live-smoke
and CLI coverage, generic diagnostics, optimistic pre-review scoring, and missing
prompt/data/human-review warnings. Those findings corrected the integrated
transport audience and moved journal finalization behind the pre-ship verdict.

### Tool-using agent

Squad added the most value here. The Architect justified one tool call, defined a
typed allowlisted contract, separated advisory output from deployment authority,
and explicitly rejected Hosted Agent, Prompt Agent, multi-agent orchestration,
OpenAPI deployment, MCP, code execution, search/IQ, Toolbox, and local inference.
That reasoning directly shaped the integrated fail-closed implementation and test
matrix. A late Reviewer finding also caught that the first fallback called the
repository before an agent requested a tool; the final sample now exposes the
agent request, exact host dispatch, typed tool result, and final response lifecycle.
The cost was several minutes of ceremony and an initially nonstandard journal.

### Grounded knowledge

Squad selected a local-first permission-aware knowledge shape and correctly kept
authenticated Foundry IQ evidence separate. The direct implementation control
made the safety boundary executable: group filtering occurs before ranking and
generation, unauthorized evidence never reaches the generator, and failures do
not reveal restricted document existence. The original Squad session did not
produce a durable handoff before the recovery threshold, but its later unmerged
process artifact (`87e02beefe6a5e8d80a5749e302c65ac7318f4b0`) added valuable
specialist detail: deny-before-ranking tenant/group ACLs, citation normalization,
prompt-injection quarantine, zero-leak thresholds, secretless RBAC boundaries,
and version isolation for volatile Foundry IQ APIs.

## Core improvements applied

1. **Full-Mode implementation timebox** — a safe local seam must receive an
   implementation owner within 60 seconds; cloud evidence gaps block claims, not
   deterministic local work.
2. **Durable checkpoint handoff** — work exceeding two minutes must publish an
   artifact path, status, timestamp, decisions, assumptions, next action, and
   acceptance condition.
3. **Executable experiment journals** — shared headings, nine scored dimensions,
   a validator, and a cross-journal summarizer replace prose-only tracking.
4. **Evidence lanes** — Quality Engineer and evaluation templates now separate
   offline deterministic, documentation-supported, authenticated smoke, and
   observed-runtime evidence. Missing credentials produce `NOT_EVIDENCED`, never
   a false pass.
5. **Integrated sample contract** — samples default to offline tests, secretless
   configuration, bounded failure behavior, explicit limitations, and opt-in
   authenticated execution.

## Deferred improvements

| Improvement | Why deferred |
| --- | --- |
| Permission-aware grounding template and shared citation evaluator | Valuable, but one knowledge scenario is insufficient to freeze a generic contract. |
| Tool decision fields for execution location, reachability, side effects, and logging | Strong single-scenario evidence; should be added with a dedicated template revision and reviewer test. |
| Production workload identity and CI live-smoke environment | Local Entra authentication is evidenced; managed identity and protected CI credentials require a selected deployment host. |
| Reusable Foundry IQ provisioning module | The standalone Bicep and scripts are validated, but should mature through another knowledge-source shape before becoming a core generic module. |

## Remaining evidence gaps

- Production managed identity, protected CI live tests, centralized telemetry,
  sustained load, and cost baselines remain unevidenced.
- The original integrated samples remain local-first controls; the standalone
  repositories are the authoritative authenticated implementations.
- Foundry IQ uses a preview API and requires ongoing compatibility checks.

These gaps are explicit and do not invalidate the offline application contracts.
