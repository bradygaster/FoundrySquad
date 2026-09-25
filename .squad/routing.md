# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Requirements and architecture | Architect | Smallest sufficient architecture, direct model vs agent, Prompt vs Hosted Agent |
| Models and availability | Model Strategist | Model Router, capabilities, regions, quota, capacity, deployment types |
| Model/agent orchestration | Agent Engineer | Direct model calls, Model Router integration, Responses API agents, Prompt Agents, Hosted Agents, Agent Framework, application tests |
| Tools, Toolbox, and Skills | Integration Engineer | Toolbox, Foundry Tools (search, code execution, OpenAPI, MCP, agent-to-agent), Foundry Skills |
| Knowledge and grounding | Knowledge Engineer | Foundry IQ, governed knowledge retrieval, permission-aware grounding, RAG evaluation |
| Environment and deployment | Platform Engineer | DevPack, `azd`, IaC, Entra ID, managed identity, RBAC, CI/CD |
| AI quality and observability | Quality Engineer | Evaluation datasets, rubrics, evaluators, tracing, acceptance thresholds |
| Architecture and implementation review | Reviewer | Complexity challenge, supportability, security defaults, eval and operations gates |
| Current external claim verification | Fact Checker | Microsoft documentation, SDK/API/CLI existence, volatile capability verification |
| Responsible AI review | Rai | Safety, fairness, privacy, harmful-content and high-impact use review |

Preset installation adds concrete routes for the configured team. Add or edit rows
here only when their agent names also exist in the casting registry.

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Architect |
| `squad:{name}` | Pick up issue and complete the work | Named member |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, the **Architect** triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the "inbox" — untriaged issues waiting for Architect review.

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn the tester to write test cases from requirements simultaneously.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. The Architect handles all `squad` (base label) triage.

## Foundry Delivery Route

1. **Requirements before selection** — Architect produces a requirements artifact before model, agent, region, or hosting choices, consulting `.squad/skills/foundry-jtbd-routing/SKILL.md` for a fast first pass from stated customer goal to Foundry capability.
2. **Current evidence before commitment** — Model Strategist and Fact Checker verify volatile claims. Documentation can establish capability, but authenticated environment evidence is required for subscription-specific deployability.
3. **Architecture gate before build** — Reviewer challenges no-AI/direct invocation, Model Router, Responses API ephemeral agent, Prompt Agent, Hosted Agent, Agent Framework, IQ, Toolbox, Skills, Tools, and local alternatives as applicable.
4. **Parallel implementation after contracts** — Agent Engineer, Integration Engineer, Knowledge Engineer, Platform Engineer, and Quality Engineer may proceed in parallel only after inputs, outputs, and acceptance thresholds are explicit.
5. **No false unavailable** — authorization, not-found, throttling, service failures, and empty discovery results route back to evidence gathering; they are not availability conclusions.
6. **Pre-ship gate** — completion requires application tests, infrastructure evidence, evaluation thresholds, operations evidence, secretless identity review, and Reviewer approval.

## Handoff Contract

Every handoff identifies the durable artifact, owner, status, evidence timestamp, authenticated scope, unresolved assumptions, and the exact acceptance condition for the receiving owner.
