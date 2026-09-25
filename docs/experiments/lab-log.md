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
