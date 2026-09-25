# Foundry Sample Lab Log

This log tracks the parent coordination session and the evidence used to improve
FoundrySquad. Scenario-specific implementation detail belongs in each child
journal.

## 2026-09-25

### Lab setup

- Created three isolated local worktree sessions from `main`, each using the
  repository's `Squad` coordinator:
  - `bradygaster-model-routing-sample`
  - `bradygaster-foundry-tool-agent-sample`
  - `bradygaster-grounded-knowledge-sample`
- Required every scenario to produce runnable code, offline tests, setup
  documentation, evidence boundaries, Squad contribution history, workflow
  friction, comparison scores, and core improvement proposals.
- Established the shared journal contract and comparison rubric in commit
  `561b7ba`.
- Added journal validation with tests in commit `aae7238`.
- Added cross-journal score and improvement summarization in commit `1b295d5`.
- Added structure guards for the lab infrastructure in commit `c67459a`.

### Early orchestration evidence

- All three child sessions remained busy for more than three minutes before any
  application code appeared in their worktrees.
- The tool-agent scenario created a detailed architecture journal first. It
  correctly reduced the design to one in-process agent and one read-only local
  tool, rejected unjustified Hosted Agent, MCP, OpenAPI service, retrieval, and
  multi-agent components, and separated documentation evidence from authenticated
  runtime evidence.
- The first journal used scenario-specific headings and omitted the shared
  comparison score table. The parent coordinator sent a corrective handoff
  requiring the exact journal sections and nine scored dimensions.
- The parent coordinator sent all three sessions an implementation timebox:
  choose a deterministic local-first seam, start code immediately, and document
  cloud validation as pending rather than blocking on credentials.
- The original grounded-knowledge Squad crossed its architecture gate after the
  timebox and selected a local-first .NET permission-aware knowledge sample.
- The original model-routing Squad remained busy for more than five minutes
  without a durable artifact, then approved a local-first .NET ticket-triage
  sample using a deterministic fake by default, optional Foundry transport, and
  no agent framework.
- Recovery launched two narrowly scoped implementation-owner worktrees for model
  routing and grounded knowledge. These are treated as direct-implementation
  controls, not replacement Squad sessions, so the lab can compare artifact
  quality and elapsed ceremony against the Squad-led branches.
- The grounded-knowledge direct control completed at commit
  `951984288b1aad5f80d9399c5717d29785b8b033` with a .NET 8 permission-aware
  retrieval sample, 4/4 offline evaluations, a clean release build, and an
  optional authenticated Foundry adapter boundary. It explicitly recorded the
  delayed Squad artifact as the recovery trigger.

### Preliminary core observations

These are hypotheses until the completed journals provide cross-scenario evidence.

1. **Architecture economy is strong.** The existing architecture skill prevented
   the first scenario from defaulting to a hosted or multi-agent design.
2. **Ceremony needs a timebox.** Full fan-out can delay the first implementation
   artifact even when the requested sample has a narrow local-first seam.
3. **Handoff schemas need executable enforcement.** A prose request for consistent
   journals was insufficient; the parent added a validator and summarizer.
4. **Cloud evidence should not block local implementation.** The coordinator
   needed to restate that authenticated Foundry gaps remain explicit follow-up
   evidence rather than prerequisites for deterministic code and tests.
5. **A direct implementation control is useful.** Comparing a tightly specified
   coding owner with Full-Mode Squad delivery can reveal whether extra ceremony
   changes architecture quality, safety, test coverage, or only elapsed time.

### Completion conditions

The lab is complete only when:

- all three sample branches contain committed application code and passing tests;
- their journals pass the shared validator;
- their commits are integrated or otherwise referenced durably;
- recurring improvements are ranked from journal evidence;
- justified core FoundrySquad changes are implemented and tested;
- remaining authenticated Foundry evidence gaps are explicit.

### Completion

- Integrated model-routing control commit
  `8cdd99cd1477ccf115b5fdf810d932e8b7d098ff`.
- Integrated grounded-knowledge control commit
  `951984288b1aad5f80d9399c5717d29785b8b033`.
- Integrated the parent tool-agent sample and its validated journal.
- Preserved the unmerged Squad-led grounded-knowledge process evidence at
  `87e02beefe6a5e8d80a5749e302c65ac7318f4b0`.
- Preserved the rejected, unmerged Squad-led model-routing experiment at
  `7e7485bedfc57ae26d208b57596351986a6ff2a4`; its pre-ship findings corrected
  token-audience guidance and score-finalization order.
- Final validation passed: repository 42/42, model routing 9/9, grounded
  knowledge 4/4, tool agent 10/10, and all three journals passed.
- Applied core fixes for implementation timeboxing, durable checkpoints,
  executable experiment tracking, and explicit evidence lanes.
- Authenticated Foundry runtime evidence remains `NOT_EVIDENCED` because no
  target tenant, project, deployment, identity scope, quota, or capacity was
  supplied.

### Standalone authenticated follow-up

- Created private standalone repositories for each sample:
  - `bradygaster/foundry-model-routing-advisor`
  - `bradygaster/foundry-change-risk-agent`
  - `bradygaster/foundry-permission-aware-knowledge`
- Reused the existing Foundry project
  `squad-imagegen-swc-1ntj32-proj` in resource group `rg-squad-imagegen`
  rather than creating duplicate accounts.
- Authenticated to the project Responses API with the
  `https://ai.azure.com/.default` scope and observed a completed
  `FOUNDRY_E2E_OK` response from the existing `gpt-5-mini` deployment.
- Provisioned `model-router-advisor` at GlobalStandard capacity 10 using
  `model-router` version `2025-11-18`. Live requests completed with backing
  models `gpt-5.4-mini-2026-03-17` and `grok-4-1-fast-reasoning`; the compiled
  CLI completed the high-capability route with `HIGH_ROUTE_OK`.
- Observed transient `rate_limit_exceeded` responses from the capacity-3
  `gpt-5-mini` deployment before bounded backoff succeeded. Standalone samples
  must preserve explicit retry limits and rate-limit diagnostics.
- Completed the tool-agent standalone matrix through the real project Responses
  API. Thirteen offline checks and authenticated known, unknown, and adversarial
  scenarios passed. A repeated run exposed nondeterministic model semantics;
  the host now derives all safety-critical advisory fields from the
  authoritative tool result while retaining strict model-output parsing.
- Completed the grounded-knowledge offline/live acceptance matrix against search
  service resource ID
  `/subscriptions/104482b7-4580-4de0-9453-0fc78df0b80e/resourceGroups/rg-squad-imagegen/providers/Microsoft.Search/searchServices/fsq-knowledge-swc-1ntj32`
  with index `permission-aware-documents`, knowledge source
  `permission-aware-kb-source`, and knowledge base `permission-aware-kb`.
  Authorized retrieval and model synthesis returned one exact citation;
  unauthorized, unknown, and adversarial scenarios returned zero citations.
