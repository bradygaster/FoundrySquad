# Foundry Sample Lab Synthesis

## Result

The lab produced three integrated, local-first samples:

| Scenario | Sample | Offline validation | Authenticated Foundry status |
| --- | --- | --- | --- |
| Direct model / Model Router | [`model-routing-advisor`](../../samples/model-routing-advisor/README.md) | 8/8 tests passed | Adapter included; target environment not evidenced |
| Tool-using agent | [`change-risk-agent`](../../samples/change-risk-agent/README.md) | 5/5 checks passed | Adapter boundary documented; runtime not evidenced |
| Grounded knowledge | [`permission-aware-knowledge`](../../samples/permission-aware-knowledge/README.md) | 4/4 evaluations passed | Adapter included; Foundry IQ/model runtime not evidenced |

All three experiment journals pass the shared validator. Repository tests pass
42/42.

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
direct implementation control completed the sample.

### Tool-using agent

Squad added the most value here. The Architect justified one tool call, defined a
typed allowlisted contract, separated advisory output from deployment authority,
and explicitly rejected Hosted Agent, Prompt Agent, multi-agent orchestration,
OpenAPI deployment, MCP, code execution, search/IQ, Toolbox, and local inference.
That reasoning directly shaped the integrated fail-closed implementation and test
matrix. The cost was several minutes of ceremony and an initially nonstandard
journal.

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
| Authenticated Foundry runtime contract probes | Require a selected tenant/project, identity scope, endpoints, and safe evidence storage. |
| Tool decision fields for execution location, reachability, side effects, and logging | Strong single-scenario evidence; should be added with a dedicated template revision and reviewer test. |
| Maintained SDK-backed tool-agent adapter | Package/API compatibility must be verified against a current authenticated environment rather than guessed from local tests. |

## Remaining evidence gaps

- No target Foundry project, deployment, tenant, region, quota, or capacity was
  supplied.
- No authenticated model, Model Router, function-tool, Foundry IQ, or runtime
  latency/cost evidence was collected.
- Production RBAC, observability export, deployment automation, rollback, and
  service-backed evaluations remain scenario-specific follow-up work.

These gaps are explicit and do not invalidate the offline application contracts.
