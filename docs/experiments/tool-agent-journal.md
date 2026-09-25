# Scenario Journal: Change Risk Advisor

> **Sanitized public record — NOT LIVE.** Azure resource, account, tenant,
> identity, endpoint, and request/response identifiers are fictional placeholders
> and do not identify real Azure resources. Validation outcomes are anonymized.

## Outcome and acceptance criteria

- **Outcome:** Produce a human-reviewed change-risk advisory grounded only in a
  typed, read-only change-record tool.
- **Acceptance:** Known records are classified from retrieved fields; malformed,
  missing, failed, or cancelled lookups fail closed; no tool can mutate or deploy;
  default tests require no credentials or network.
- **Non-goals:** Automated approval, deployment, persistent agent state, hosted
  agent infrastructure, production change-system access, or authenticated cloud
  validation.

## Architecture decision

The Squad architecture gate selected one in-process advisory host and one local
function tool. It rejected Hosted Agent, Prompt Agent, multi-agent orchestration,
OpenAPI deployment, MCP, code execution, search/IQ, Toolbox, and local inference
because none earned its lifecycle or safety cost for one synthetic lookup.

The integrated sample uses a deterministic `IAdvisoryModel` so it remains runnable
without external packages or credentials. The standalone repository implements
the same contract through the current Foundry project Responses API while
preserving the deterministic host as the safety authority.

## Squad activity

| Time | Member | Artifact or action | Handoff / decision | Result |
| --- | --- | --- | --- | --- |
| 2026-09-25 | Squad coordinator | Routed the full scenario to the Foundry team. | Required code, tests, evidence boundaries, and a process journal. | Full-Mode fan-out started. |
| 2026-09-25 | Architect | Wrote the Change Risk Advisor requirements, tool contract, rejected alternatives, evidence, and downstream handoffs. | Approved one ephemeral/in-process agent plus one read-only tool. | Prevented unjustified hosted and multi-agent infrastructure. |
| 2026-09-25 | Parent coordinator | Inspected the first journal and applied the shared schema. | Required scored evidence and moved work from ceremony to code. | Journal validator and summarizer became core lab tooling. |
| 2026-09-25 | Parent implementation | Added the local-first BCL implementation and five offline checks. | Left cloud SDK/runtime integration explicitly unvalidated. | Runnable sample available independently of child-session completion. |

## Evidence and assumptions

| Claim | Evidence timestamp | Authenticated scope | Status | Remaining gap |
| --- | --- | --- | --- | --- |
| A single typed local tool is sufficient for the sample behavior. | 2026-09-25 | Local repository | EVIDENCED | None for local behavior. |
| Malformed, missing, failed-test, and cancelled paths fail safely. | 2026-09-25 | Local repository | EVIDENCED | Model-service failure needs an authenticated adapter test. |
| Current Foundry Responses API can host the same contract. | 2026-09-25 | Anonymized project and fixed-model deployment; public identifiers are intentionally omitted | EVIDENCED | Production load and managed-identity hosting remain. |
| Runtime identity is secretless. | 2026-09-25 | Microsoft Entra scope `https://ai.azure.com/.default` | EVIDENCED | Production workload identity remains host-specific. |

## Validation log

| Command or check | Result | What it proves | What it does not prove |
| --- | --- | --- | --- |
| `dotnet run --project samples/change-risk-agent/tests/ChangeRiskAgent.Tests` | PASS: 10 checks | Observable agent/tool lifecycle, allowlist and binding enforcement, one-call limit, input validation, exact lookup, conservative policy, missing evidence, human ownership, and cancellation. | Foundry SDK/API compatibility or cloud runtime behavior. |
| `dotnet run --project samples/change-risk-agent/src/ChangeRiskAgent -- CHG-1001` | PASS; low-risk advisory emitted | The documented happy path is runnable. | Model quality, latency, cost, quota, or capacity. |
| Standalone `RUN_FOUNDRY_LIVE_TESTS=1 ... -- --live` | PASS: 13 offline checks plus authenticated CHG-1001, CHG-9999, and adversarial CHG-1003 | Real function request, exact host dispatch, tool-result continuation, bounded 429 recovery, and mandatory human review. | Production backend and managed-identity hosting. |

## Friction and recovery

| Problem | Effect | Recovery | Root cause | Preventive improvement |
| --- | --- | --- | --- | --- |
| Full Squad work began with several minutes of architecture ceremony. | No application files appeared during the initial target window. | Parent issued an implementation timebox and created a local-first fallback seam. | Full Mode had a 40-60 second target but no first-artifact rule. | Added a 60-second implementation-artifact requirement to response mode and routing. |
| The first journal used custom headings and no comparison scores. | Cross-scenario analysis was not mechanically reliable. | Added validator, summarizer, exact headings, and scored evidence. | Handoff depended on prose rather than an executable schema. | Keep journal validation in repository tests and run it before integration. |
| The local machine only had the .NET 10 SDK template. | A requested .NET 8 scaffold failed. | Used .NET 10, which satisfies the repository's .NET 8-or-later requirement. | Installed SDK/template availability differed from the initial assumption. | Discover SDKs before selecting an exact target framework. |
| Initial fallback called the repository before the agent requested a tool. | The code demonstrated a safe tool contract but not an agent/tool-call lifecycle. | Added explicit request, allowlisted host dispatch, typed tool-result continuation, and final response turns. | The architecture contract did not make lifecycle evidence an implementation gate. | Reviewer now rejects direct repository calls presented as agent evidence. |
| Strict JSON schema constrained shape but not policy semantics. | A live run could return parseable JSON that failed the host safety policy. | The host now derives ID, classification, evidence factors, and human-review action solely from the authoritative tool result; a malicious-output regression verifies normalization. | Model-authored policy fields were incorrectly treated as trustworthy. | Require host-owned derivation for safety-critical decisions even when structured output is enabled. |

## What Squad did well

- The architecture sequence forced an explicit AI/agent/tool justification.
- The Architect rejected nine larger alternatives and defined a narrow typed tool.
- Evidence discipline prevented local tests from becoming cloud-availability claims.
- The handoff exposed safety requirements that became deterministic tests.

## Core FoundrySquad improvements

| Improvement | Core surface | Evidence | Impact (1-5) | Effort (1-5) | Confidence (1-3) |
| --- | --- | --- | --- | --- | --- |
| Timebox Full Mode to a first implementation artifact within 60 seconds. | coordinator response mode and routing | All initial sample sessions exceeded the target before code; the tool session produced architecture first. | 5 | 2 | 3 |
| Enforce experiment journals with an executable schema and summarizer. | templates and validation tooling | The first journal omitted shared headings and scores. | 4 | 2 | 3 |
| Add tool execution location, side effects, reachability, timeout, and logging fields. | architecture decision and reviewer gate | The scenario rejected OpenAPI because Foundry cannot safely assume developer localhost reachability. | 4 | 2 | 3 |
| Separate offline contract tests from opt-in authenticated smoke tests. | quality charter and sample template | Five useful checks ran without credentials while cloud runtime remained unknown. | 5 | 2 | 3 |
| Require observable request-dispatch-result-final lifecycle evidence. | reviewer gate | The first fallback was a rules engine with a model-shaped interface, not an agent-requested tool call. | 5 | 2 | 3 |

## Comparison score

| Dimension | Score (1-5) | Evidence |
| --- | --- | --- |
| Architecture economy | 5 | One host and one read-only tool; larger Foundry surfaces were explicitly rejected. |
| Routing accuracy | 4 | The right specialists were selected, but broad fan-out delayed implementation. |
| Handoff quality | 4 | Architecture handoffs were detailed; the initial journal schema required correction. |
| Evidence discipline | 5 | Local, documentation, authenticated, and runtime evidence stayed separate. |
| Implementation usefulness | 5 | The local control and standalone authenticated implementation both run end to end. |
| Quality coverage | 5 | Offline checks plus repeated authenticated known, unknown, adversarial, rate-limit, and malicious-model-output paths pass. |
| Security and RAI | 5 | Read-only synthetic data, strict IDs, fail-closed output, no secrets, and human ownership. |
| Ceremony efficiency | 2 | Architecture quality was high, but implementation started well after the Full-Mode target. |
| Recovery behavior | 5 | The coordinator timeboxed work, added tooling, adapted the SDK target, and produced a runnable fallback. |
