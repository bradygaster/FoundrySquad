# Foundry Sample Lab

This lab exercises FoundrySquad by building real applications in isolated local
worktrees. Each scenario is owned by a separate Squad session so the application,
team interactions, evidence, and failures can be reviewed independently.

The parent coordinator's chronological activity and early observations are in
[the lab log](lab-log.md).

## Active scenarios

| Scenario | Session | Scope | Required result |
| --- | --- | --- | --- |
| Direct model and Model Router | Model routing sample | Test the smallest bounded model architecture and justify when routing earns its complexity. | Runnable sample, tests, setup guide, evidence boundaries, and Squad journal. |
| Tool-using agent | Tool agent sample | Test agent-surface selection and one meaningful Foundry tool integration. | Runnable sample, tests, safe tool contract, setup guide, and Squad journal. |
| Grounded knowledge | Grounded knowledge sample | Test permission-aware grounding and Foundry IQ versus a smaller supported alternative. | Runnable sample, fixtures, evaluation checks, setup guide, and Squad journal. |

Each child session starts from the repository default branch in a fresh local
worktree. The sample branches remain independent so their implementation choices
and Squad behavior can be compared without cross-contamination.

## Journal contract

Every scenario journal must record:

1. The user outcome, constraints, explicit non-goals, and measurable acceptance
   criteria.
2. The selected architecture and the smaller alternatives considered.
3. Squad participants, artifacts, handoffs, reviewer decisions, and revision
   ownership.
4. Evidence timestamps, authenticated scope, unresolved assumptions, and a clear
   distinction between local validation and cloud validation.
5. Commands and checks that were actually run, including failures and recoveries.
6. Where Squad reduced work, caught an issue, added ceremony without value, routed
   incorrectly, or lacked a needed template/check.
7. Concrete FoundrySquad improvements with an owner surface: coordinator prompt,
   routing, charter, skill, template, tooling, evaluation, or documentation.

Validate completed journals with:

```sh
npm run validate:experiments
npm run summarize:experiments
```

The validator requires every comparison dimension to include a 1-5 score and
specific supporting evidence. The summarizer calculates cross-scenario averages
and ranks identically named core improvements using the lab priority formula.

## Comparison rubric

Score each dimension from 1 (poor) to 5 (excellent), and support the score with a
specific journal reference.

| Dimension | What to measure |
| --- | --- |
| Architecture economy | Squad selected the smallest sufficient design and rejected unjustified components. |
| Routing accuracy | Work reached the right specialist without avoidable reassignment or duplication. |
| Handoff quality | Artifacts contained owner, status, evidence, assumptions, and acceptance condition. |
| Evidence discipline | Volatile and subscription-specific claims were verified or explicitly left unverified. |
| Implementation usefulness | The output is runnable, understandable, tested, and reusable as a sample. |
| Quality coverage | Tests and evaluations measure scenario acceptance criteria rather than proxies. |
| Security and RAI | Identity, secrets, permissions, data handling, and applicable safety risks were addressed. |
| Ceremony efficiency | Reviews and gates caught meaningful issues without creating disproportionate overhead. |
| Recovery behavior | Failures led to useful diagnosis, adaptation, and durable learning. |

## Core improvement triage

Consolidated improvements will be ranked with:

`priority = impact x recurrence x confidence / effort`

- **Impact:** 1-5 effect on correctness, safety, delivery speed, or usability.
- **Recurrence:** 1-3 number of scenarios that exposed the issue.
- **Confidence:** 1-3 strength of direct evidence in the scenario journals.
- **Effort:** 1-5 estimated implementation cost.

Only improvements backed by journal evidence should change the core Squad. A
scenario-specific preference stays in that sample unless it recurs or fixes a
clear correctness gap.

## Final synthesis

When all scenarios finish, this branch will add a synthesis covering:

- comparison scores and recurring workflow patterns;
- the highest-priority core changes;
- changes applied immediately versus deferred proposals;
- sample branch paths, commit SHAs, and validation status;
- gaps requiring authenticated Foundry environment evidence.
