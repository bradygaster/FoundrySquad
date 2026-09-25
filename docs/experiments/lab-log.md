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

### Completion conditions

The lab is complete only when:

- all three sample branches contain committed application code and passing tests;
- their journals pass the shared validator;
- their commits are integrated or otherwise referenced durably;
- recurring improvements are ranked from journal evidence;
- justified core FoundrySquad changes are implemented and tested;
- remaining authenticated Foundry evidence gaps are explicit.
