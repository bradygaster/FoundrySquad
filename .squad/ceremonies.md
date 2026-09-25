# Ceremonies

> Team meetings that happen before or after work. Each squad configures their own.

## Design Review

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | before |
| **Condition** | multi-agent task involving 2+ agents modifying shared systems |
| **Facilitator** | architect |
| **Participants** | architect, model-strategist, foundry-engineer, platform-engineer, quality-engineer, reviewer |
| **Time budget** | focused |
| **Enabled** | ✅ yes |

**Agenda:**
1. Review the task and requirements
2. Agree on interfaces and contracts between components
3. Identify risks and edge cases
4. Assign action items

---

## Retrospective

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | after |
| **Condition** | build failure, test failure, or reviewer rejection |
| **Facilitator** | reviewer |
| **Participants** | all-involved |
| **Time budget** | focused |
| **Enabled** | ✅ yes |

**Agenda:**
1. What happened? (facts only)
2. Root cause analysis
3. What should change?
4. Action items for next iteration


---

## Retrospective with Enforcement

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | weekly |
| **Condition** | No *retrospective* log in .squad/log/ within the last 7 days |
| **Facilitator** | reviewer |
| **Participants** | all |
| **Time budget** | focused |
| **Enabled** | yes |
| **Enforcement skill** | retro-enforcement |

**Agenda:**
1. What shipped this week? (closed issues, merged PRs)
2. What did not ship? (open issues, blockers)
3. Root cause on any failures
4. Action items -- each MUST become a GitHub Issue labeled retro-action

**Coordinator integration:**
At round start, call Test-RetroOverdue (see skill retro-enforcement). If overdue, run this ceremony before the work queue.

**Why GitHub Issues, not markdown:**
Production data: 0% completion across 6 retros using markdown checklists, 100% after switching to GitHub Issues.

---

## Architecture Gate

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | before |
| **Condition** | new application architecture or material Foundry capability selection |
| **Facilitator** | architect |
| **Participants** | architect, model-strategist, platform-engineer, quality-engineer, reviewer, fact-checker |
| **Time budget** | focused |
| **Enabled** | yes |

**Agenda:**
1. Confirm requirements and constraints
2. Identify the smallest sufficient architecture
3. Verify volatile Foundry assumptions through current authoritative sources or live discovery
4. Separate availability, compatibility, quota, and capacity
5. Define evaluation, security, deployment, and observability acceptance criteria
6. Record rejected alternatives and why

**Exit criteria:**
- Requirements artifact is complete enough to select an architecture.
- The smallest sufficient architecture is named, including why an agent or multi-agent system is or is not needed.
- Volatile claims include current sources and freshness; subscription claims include authenticated scope or are explicitly blocked.
- Catalog presence, compatibility, regional availability, entitlement, quota, capacity, deployability, and runtime health are separate.
- Security, evaluation, observability, deployment, and rollback acceptance criteria have owners.

---

## Pre-Ship Foundry Review

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | after |
| **Condition** | deployment-ready application or completed architecture package |
| **Facilitator** | reviewer |
| **Participants** | reviewer, quality-engineer, platform-engineer, rai, fact-checker |
| **Time budget** | focused |
| **Enabled** | yes |

**Agenda:**
1. Challenge unnecessary agents, models, infrastructure, tools, and abstractions
2. Verify supported SDK/tooling claims and live deployment assumptions
3. Confirm managed identity, least-privilege RBAC, and secret handling
4. Confirm repeatable evaluations meet explicit thresholds
5. Confirm traces and operational diagnostics exist

**Exit criteria:**
- Targeted application and infrastructure validation passed.
- Required AI evaluations meet recorded thresholds with reproducible artifacts.
- Managed identity/Entra/OIDC and least-privilege evidence is present; no committed credentials exist.
- Deployment, rollback, monitoring, alert/triage, and runtime verification are documented.
- Reviewer records approval, or rejects with material findings and a different revision owner.
