# Microsoft Foundry Application-Development Squad

This repository configures a **Squad** of specialized AI agents for Microsoft Foundry application development. Give the Squad an application outcome and its constraints; it turns that intent into the smallest justified architecture, verifies volatile platform assumptions, builds and provisions the solution, evaluates it, and requires production-readiness evidence before approval.

This repository is **configuration, guidance, read-only discovery tooling, schemas, and evaluations**. It is not a deployable availability service, a replacement agent framework, or an application template.

For implementation detail behind the guidance here, see the [deeper Foundry Squad reference](docs/foundry-squad.md).

## Sample application lab

The [Foundry Sample Lab](docs/experiments/README.md) uses isolated local
worktrees and separate Squad sessions to build deep samples for model routing,
tool-using agents, and grounded knowledge. Each sample records which specialists
contributed, the evidence and validation produced, workflow friction, and
actionable improvements to the core FoundrySquad configuration. Integrated sample
applications live under [`samples/`](samples/README.md).

Authenticated, independently runnable versions are maintained in the private
standalone repositories
[`foundry-model-routing-advisor`](https://github.com/bradygaster/foundry-model-routing-advisor),
[`foundry-change-risk-agent`](https://github.com/bradygaster/foundry-change-risk-agent),
and
[`foundry-permission-aware-knowledge`](https://github.com/bradygaster/foundry-permission-aware-knowledge).

- [`samples/model-routing-advisor/`](samples/model-routing-advisor/) -
  local-first .NET 8 deterministic model routing with an opt-in Foundry transport.
- [`samples/change-risk-agent/`](samples/change-risk-agent/) -
  local-first typed, read-only tool orchestration with fail-closed advisories.
- [`samples/permission-aware-knowledge/`](samples/permission-aware-knowledge/) -
  local-first .NET 8 permission-aware grounded answers with deterministic
  citations and an opt-in `DefaultAzureCredential` Foundry runtime adapter.

## Mission and operating philosophy

The Squad asks, in order:

1. Does the problem need AI?
2. Is one direct model call enough?
3. Would Model Router provide a justified cost/quality tradeoff?
4. Does the application need agent behavior, and if so, is the lightest supported agent surface sufficient?
5. Do knowledge, tools, reusable procedures, local inference, custom orchestration, or extra infrastructure each earn their cost?

The result should be the **smallest sufficient, production-capable architecture**. “Agentic” is not a goal by itself. Every model, agent, runtime, data source, tool, resource, identity, and operational component must map to a requirement and a measurable acceptance condition.

Volatile facts are retrieved rather than remembered. In particular, the Squad keeps these claims separate:

- catalog presence
- capability and tool compatibility
- regional availability
- subscription entitlement
- quota
- current capacity
- deployability
- runtime health

A documentation page, catalog entry, empty result, or authorization error is not proof that a model can—or cannot—be deployed in a particular subscription.

## What the Squad understands

| Foundry surface | When the Squad considers it |
| --- | --- |
| **Direct model invocation** | Default starting point for bounded generation, extraction, classification, or summarization that does not need agent state or tool orchestration. |
| **Model Router** | When request complexity varies and dynamic model selection may improve the cost/quality balance. It still requires current compatibility, region, quota, and capacity evidence. |
| **Responses API ephemeral pattern** | For application-owned agent behavior using the Responses API without introducing a durable hosted-agent runtime unnecessarily. |
| **Prompt Agents** | For declarative instructions plus supported tools where a custom runtime is not justified. |
| **Hosted Agents** | For custom code, dependencies, lifecycle, or runtime behavior that requires a hosted agent. |
| **Microsoft Agent Framework** | For custom orchestration only when its flexibility earns the additional application and operations complexity. |
| **Toolbox** | The singular, reusable, versioned tool collection when agents share company capabilities. |
| **Foundry Skills** | Reusable behavioral procedures and instructions shared by agents. These are distinct from this repository's Squad skills. |
| **Foundry IQ** | Governed enterprise knowledge retrieval with permission-aware access, considered before bespoke RAG. |
| **Foundry Tools** | Current first-party tools—such as search, code execution, file/search integrations, OpenAPI, MCP, and agent-to-agent connections—considered before custom equivalents. Exact support is verified at design time. |
| **Foundry Local** | On-device/local inference for offline, privacy, or edge requirements. It is distinct from **Foundry Local on Azure Local**, which is Azure Arc/Kubernetes-operated local infrastructure. |
| **Evaluations** | Requirements-derived datasets, rubrics, deterministic checks, model/service-backed evaluators, safety checks, latency, tokens, and cost thresholds. |
| **Monitoring and tracing** | Useful OpenTelemetry/Application Insights signals across model, tool, and orchestration paths, including failure and throttling diagnosis. |
| **Identity and security** | Existing developer identity locally, deterministic managed identity in production, workload identity/OIDC in CI, least privilege at the narrowest practical scope, and no committed credentials. |
| **Deployment** | Repeatable `azd` plus Bicep by default, with explicit environment, promotion, verification, rollback, and operational evidence. Portal-only steps require a documented exception. |

## Team, handoffs, and gates

### Roster

| Member | Role | Owns and hands off |
| --- | --- | --- |
| **Squad** | Coordinator | Routes work, selects response mode, enforces contracts and gates, and assembles the final result. |
| **Architect** | Foundry Architect | Requirements and the smallest sufficient architecture. Hands model requirements to Model Strategist, agent/orchestration boundaries to Agent Engineer, tool/Toolbox/Skill boundaries to Integration Engineer, knowledge/grounding boundaries to Knowledge Engineer, platform constraints to Platform Engineer, and measurable behavior to Quality Engineer. |
| **Model Strategist** | Model and deployment strategist | Model/Router candidates, capabilities, regions, deployment types, quota, and capacity evidence. Recommends to Architect and supplies deployment facts to Platform Engineer. |
| **Agent Engineer** | Foundry agent engineer | Direct model calls, Model Router integration, Responses API ephemeral agents, Prompt Agents, Hosted Agents, Microsoft Agent Framework orchestration, application state, failure handling, and tests. Hands telemetry signals to Quality Engineer and runtime/configuration needs to Platform Engineer. |
| **Integration Engineer** | Foundry integration engineer | Toolbox, Foundry Tools (search, code execution, OpenAPI, MCP, agent-to-agent), and Foundry Skills. Hands telemetry signals to Quality Engineer and runtime/configuration needs to Platform Engineer. |
| **Knowledge Engineer** | Foundry knowledge engineer | Foundry IQ, governed knowledge retrieval, permission-aware grounding, and RAG-vs-bespoke-retrieval decisions. Hands telemetry signals to Quality Engineer and runtime/configuration needs to Platform Engineer. |
| **Platform Engineer** | Foundry platform engineer | Developer environment, Entra identity, least-privilege RBAC, networking, `azd`/Bicep, CI/CD, deployment, promotion, rollback, and observability plumbing. |
| **Quality Engineer** | Foundry quality engineer | Behavior specifications, datasets, rubrics, evaluators, thresholds, adversarial/failure testing, and tracing evidence. Reports acceptance status and defects to implementation owners and Reviewer. |
| **Reviewer** | Foundry reviewer | Challenges complexity, supportability, stale assumptions, weak security, missing evaluations, and operational gaps. Approves or rejects; a rejection names a different revision owner. |
| **Fact Checker** | Verification and devil's advocate | Verifies current external claims, package/API/URL existence, and counter-hypotheses. Documentation does not substitute for authenticated subscription evidence. |
| **Rai** | Responsible AI reviewer | Reviews safety, fairness, privacy, harmful content, credential exposure, and high-impact use. Critical findings block shipment; lesser findings are advisory. |
| **Scribe** | Session logger and memory manager | Silently maintains logs, merges decision inbox entries, and propagates durable team context through the configured state backend. |
| **Ralph** | Work monitor | Tracks ongoing work and continuity across sessions. |
| **@copilot** | Coding agent | Handles well-scoped implementation, tests, dependency updates, and documentation. Medium-risk work is flagged for Squad review; architecture and security-critical decisions stay with specialists. |

The authoritative roster and routing rules are in [`.squad/team.md`](.squad/team.md) and [`.squad/routing.md`](.squad/routing.md). Specialist charters live under [`.squad/agents/`](.squad/agents/).

### End-to-end workflow

1. **Requirements** — Architect records experience, constraints, risks, assumptions, and acceptance criteria.
2. **Architecture gate** — Architect, Model Strategist, Platform Engineer, Quality Engineer, Reviewer, and Fact Checker challenge unnecessary components and define evidence needs.
3. **Current evidence** — Model Strategist and Fact Checker verify volatile platform claims. Subscription-specific claims require authorized, authenticated scope.
4. **Contracted parallel delivery** — after inputs, outputs, and acceptance thresholds are explicit, Agent Engineer, Integration Engineer, Knowledge Engineer, Platform Engineer, and Quality Engineer may work in parallel.
5. **Implementation and infrastructure validation** — application tests, identity/RBAC evidence, deployment verification, and rollback procedures are produced.
6. **Evaluation and observation** — repeatable evaluation thresholds and diagnostic traces cover important behavior and failure paths.
7. **Responsible AI and pre-ship review** — Rai reviews applicable risks; Reviewer requires complete implementation, infrastructure, quality, identity, operations, and current-evidence artifacts.

Every handoff names the artifact, owner, status, evidence timestamp, authenticated scope, unresolved assumptions, and exact acceptance condition.

### Automatic ceremonies

| Gate | Trigger | Required outcome |
| --- | --- | --- |
| **Design Review** | Before multi-agent work that changes shared systems | Interfaces, risks, edge cases, and ownership agreed. |
| **Architecture Gate** | Before a new architecture or material Foundry capability choice | Smallest sufficient design, fresh evidence plan, separated availability dimensions, and owned security/evaluation/operations criteria. |
| **Pre-Ship Foundry Review** | After a deployment-ready application or architecture package | Tests and evaluations pass; identity is secretless and least-privilege; deployment, rollback, monitoring, runtime evidence, and Reviewer approval exist. |
| **Retrospective** | After build/test failure or reviewer rejection, plus the configured weekly enforcement | Root cause and corrective actions are captured. |

## Prerequisites

### Required for this repository

| Requirement | Expectation | Verify |
| --- | --- | --- |
| Git | Any supported current release | `git --version` |
| Node.js | **20 or later** for repository scripts (`package.json`); use **22.5 or later** if installing both current Copilot CLI and Squad CLI through npm | `node --version` |
| npm | Included with Node.js | `npm --version` |
| GitHub Copilot CLI | Active Copilot entitlement and an organization policy that permits CLI use | `copilot --version` |
| Squad CLI | Provides the `squad` command and local `squad state-mcp` server | `squad --version` |

Safe global npm installation commands—no auto-confirming package execution:

```sh
# Copilot CLI requires Node.js 22 or later when installed through npm.
npm install -g @github/copilot
copilot --version

# Squad CLI currently requires Node.js 22.5 or later.
npm install -g @bradygaster/squad-cli@latest
squad --version
```

This repository declares **zero npm runtime, development, or optional dependencies** and has no lockfile. Its scripts use Node.js built-ins such as `node:fs`, `node:path`, `node:child_process`, `node:test`, and the built-in `fetch`. You do not need `npm install` to run its tests or tools.

### Recommended for Foundry development

| Tool | Purpose | Install/verify |
| --- | --- | --- |
| Azure CLI (`az`) | Direct Azure Resource Manager discovery used by `foundry-availability.js` | Install from [Microsoft's Azure CLI guide](https://learn.microsoft.com/cli/azure/install-azure-cli); verify with `az version`. |
| Azure Developer CLI (`azd`) | Repeatable application provisioning/deployment and Foundry extension host | Install from [Microsoft's `azd` guide](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd); verify with `azd version`. |
| `microsoft.foundry` azd extension | Bundle for agent, connection, inspector, project, routine, skill, and toolbox commands | `azd ext install microsoft.foundry`, then `azd ext list`. Requires `azd` 1.25.2 or later according to the linked Foundry documentation. |
| Foundry DevPack | Recommended bundled setup for Foundry terminal, editor, and coding-agent tools | Windows: `winget install Microsoft.FoundryDevPack`; macOS: `brew install --cask microsoft/foundry/devpack && foundry-devpack install`; Linux: use the reviewed installer in the [environment guide](https://learn.microsoft.com/azure/foundry/how-to/develop/install-cli-sdk). |
| Visual Studio Code + Microsoft Foundry Toolkit | Editor workflow for Foundry resources and development | Install VS Code and the .NET Runtime required by the [official Foundry Toolkit instructions](https://learn.microsoft.com/azure/foundry/how-to/develop/install-foundry-toolkit-visual-studio-code), then install **Foundry Toolkit for VS Code** and verify its Activity Bar view. |

Update the Foundry extension explicitly when needed:

```sh
azd ext upgrade microsoft.foundry
azd ext list
```

### Scenario-specific

| Requirement | Needed when |
| --- | --- |
| **.NET SDK** | C#/.NET application, Agent Framework, SDK, or hosted-agent work. Use the latest supported LTS; the Foundry extension documentation currently requires .NET 8 or later for applicable agent frameworks. Verify with `dotnet --info`. |
| **Python 3.10+** | A selected sample, SDK, evaluator, or agent framework requires Python. The repository's own scripts do not. Use a virtual environment; do not install project packages globally. Verify with `python3 --version`. |
| **Docker** | The chosen application, emulator, container build, dev container, or deployment target requires it. Verify with `docker version`. |
| **Foundry Local** | Offline/on-device inference is selected. Install and hardware requirements are platform-specific; verify with `foundry --version` after installation. |
| **Azure subscription and Foundry project/account** | Authenticated discovery, provisioning, evaluations, or deployment. You need access only to the target scope and operation. |
| **Foundry MCP authentication** | Using the remote Foundry MCP tools in VS Code. The host performs interactive Entra authentication separately from `az` and `azd`. |

Do not grant blanket subscription roles to “make it work.” Determine the exact operation, use the narrowest practical resource/project scope, and grant only the role required there. A `403` is an evidence gap to diagnose, not permission to broaden access.

## Quick start

### 1. Clone and enter the repository

```sh
export REPOSITORY_URL="https://github.com/<owner>/<repository>.git"
git clone "$REPOSITORY_URL"
cd FoundrySquad
```

### 2. Install or verify Copilot CLI and Squad CLI

```sh
node --version
npm --version
copilot --version
squad --version
```

If either CLI was just installed or upgraded, close and restart Copilot CLI so it reloads the custom agent, skills, and MCP configuration.

### 3. Validate the repository

```sh
npm test
npm run doctor
```

No npm registry access or `npm install` is required: this repository has zero dependencies and no lockfile. `npm test` uses Node's built-in test runner. `npm run doctor` is read-only: it inspects repository intent, executable/version status, Foundry tooling indicators, MCP JSON, and separate Azure CLI/`azd` authentication states. It does not install, log in, select a subscription, provision, assign RBAC, or deploy.

### 4. Start Copilot CLI with the Squad coordinator

```sh
copilot --agent Squad
```

Alternatively, start `copilot`, use `/agent`, and select **Squad**. A good first prompt includes:

```text
Design the smallest production-capable Foundry architecture for <outcome>.
Users: <who>
Latency/traffic/cost: <constraints>
Data/privacy/residency: <constraints>
Knowledge/tools/modalities/state: <needs>
Deployment/offline requirements: <constraints>
Success criteria: <measurable outcomes>
```

Not sure where to start? Try one of these prompts — each maps to an evidence-backed job in [`.squad/artifacts/jtbd-catalog.md`](.squad/artifacts/jtbd-catalog.md):

```text
Design a Foundry architecture that automates insurance claims intake and
adjudication, cutting per-claim handling time and manual review load while
keeping a human in the loop for high-value or ambiguous claims.
```

```text
Design a Foundry architecture for a customer-facing banking agent that
resolves routine account and compliance questions autonomously, escalating
to a human for anything outside its confidence or policy bounds.
```

```text
Design a Foundry architecture that grounds a support/knowledge agent in our
internal documentation and policies so answers are accurate, cited, and
permission-aware, instead of relying on the model's general knowledge.
```

```text
Design a Foundry architecture for a multi-agent code-review or content-review
pipeline where one agent drafts and a second, independent agent critiques or
verifies before anything reaches a human.
```

```text
Design a Foundry architecture that extracts structured data (fields, tables,
line items) from scanned or photographed documents and turns it into
queryable records, with a confidence-scored human review step for
low-confidence extractions.
```

See the full catalog for more jobs, citations, and confidence ratings before committing to one.

### 5. Produce durable architecture artifacts

Ask the Squad to complete the relevant templates in [`.squad/artifacts/templates/`](.squad/artifacts/templates/):

| Template | Purpose |
| --- | --- |
| `requirements.md` | Problem, users, constraints, risks, assumptions, and acceptance criteria |
| `architecture-decision.md` | Smallest sufficient design, rejected alternatives, security, evaluation, operations, evidence, and handoffs |
| `model-evidence.md` | Separate catalog, compatibility, region, entitlement, quota, capacity, deployability, and runtime-health claims |
| `infrastructure.md` | `azd`/Bicep, resources, identity, RBAC, networking, deployment, promotion, rollback, and validation |
| `evaluation.md` | Datasets, tests/evaluators, thresholds, safety, latency/token/cost checks, results, and defects |
| `operations.md` | Topology, telemetry, alerts, failure triage, runtime verification, rollback, recovery, and owners |

### 6. Optionally check authenticated availability

Authentication is explicit and remains under your control:

```sh
az login
az account show

azd auth login
azd auth login --check-status
```

Then run only the read-only check for the authorized subscription and policy-approved region:

```sh
node scripts/foundry-availability.js find_models \
  --subscription "<subscription-id>" \
  --location "<region>"
```

The tool obtains an ARM token through the existing Azure CLI session. It does not change the selected subscription, create deployments, request quota, reserve capacity, or test inference.

## Commands

### Repository checks

```sh
npm test
npm run doctor
node scripts/foundry-doctor.js
node scripts/foundry-doctor.js --live
```

`--live` on the doctor does **not** choose or query a subscription. It reports that operation-specific context must be passed to the availability tool.

### Availability discovery

```sh
npm run availability -- --help
node scripts/foundry-availability.js --help
```

Operations and required context:

| Operation | Purpose | Required options |
| --- | --- | --- |
| `find_models` | List/filter catalog entries in one location | `--subscription`, `--location`; optional model/capability/tool/deployment constraints |
| `inspect_model` | Narrow model inspection | `--subscription`, `--location`; normally `--model`, `--version`, and `--format` |
| `find_regions` | Check a policy-approved candidate region set | `--subscription`, `--model`, `--regions` |
| `check_quota` | Query Cognitive Services account usage | `--subscription`, `--location`; optional `--model` or `--family` |
| `check_capacity` | Query location-based model capacity | `--subscription`, `--location`, `--format`, `--model`, `--version`; optional `--deployment-type` |
| `explain_deployment_options` | Return architecture guidance without claiming live availability | Optional `--requirements` |

Examples:

```sh
node scripts/foundry-availability.js explain_deployment_options \
  --requirements "low-latency internal assistant"

node scripts/foundry-availability.js inspect_model \
  --subscription "<subscription-id>" \
  --location "<region>" \
  --format "<model-format>" \
  --model "<model-name>" \
  --version "<model-version>" \
  --capabilities "<capability-a>,<capability-b>" \
  --tools "<required-tool>" \
  --deployment-type "<deployment-type>"

node scripts/foundry-availability.js find_regions \
  --subscription "<subscription-id>" \
  --model "<model-name>" \
  --regions "<region-a>,<region-b>"
```

Replay data is always marked stale:

```sh
OPERATION="find_models"
node scripts/foundry-availability.js "$OPERATION" --replay "<evidence-file.json>"
```

Outputs conform to [`schemas/foundry-availability-result.schema.json`](schemas/foundry-availability-result.schema.json) and carry source, timestamp/freshness, scope, authentication outcome, evidence, warnings, and all eight availability dimensions.

### Evaluations

Deterministic replay:

```sh
npm run eval

# Equivalent:
node scripts/run-foundry-squad-evals.js \
  --replay test/fixtures/eval-responses.json
```

Opt-in live Copilot CLI evaluation:

```sh
node scripts/run-foundry-squad-evals.js --live
```

Optional subscription-specific evidence for scenario H:

```sh
node scripts/run-foundry-squad-evals.js \
  --live \
  --evidence "<evidence-file.json>"
```

Choose either `--replay` or `--live`, never both. Live runs:

- copy only Squad configuration into `.artifacts/foundry-squad-evals/<timestamp>/workspace`;
- expose only the read-only `view`, `glob`, and `rg` tools;
- disable built-in MCP servers;
- pass a restricted environment allowlist rather than repository secrets;
- store per-scenario results and `summary.json` under the ignored `.artifacts/` directory;
- do not authenticate to Azure, provision, or deploy.

Scenario H returns `BLOCKED_AUTH` during a live run unless the evidence JSON supplies `subscriptionSpecific`, `availability`, `quota`, and `capacity` truth values for `H`.

## Evaluation scenarios A–J

| ID | Scenario | Expected Squad behavior |
| --- | --- | --- |
| **A** | Simple summarization service | Recommend direct model invocation and reject an unnecessary agent. |
| **B** | Variable-complexity chat where cost matters | Evaluate Model Router and the cost/quality tradeoff. |
| **C** | Declarative assistant with supported tools | Prefer/evaluate a Prompt Agent before a hosted custom runtime. |
| **D** | Custom code, dependencies, and orchestration | Evaluate Hosted Agent and Microsoft Agent Framework rather than forcing a declarative-only solution. |
| **E** | Enterprise knowledge with permissions | Evaluate Foundry IQ before bespoke RAG. |
| **F** | Shared company capabilities across agents | Recommend a reusable Toolbox instead of duplicated tools. |
| **G** | Shared specialized procedure | Recommend a reusable Foundry Skill instead of duplicated instructions. |
| **H** | Model X in an allowed US region | Require authenticated subscription discovery and keep availability, quota, and capacity separate; never rely on a static matrix. |
| **I** | Offline application | Evaluate Foundry Local and local inference constraints. |
| **J** | Five agents requested for paragraph summarization | Reject overengineering and recommend one direct model call. |

The evaluator checks semantic concepts, recommendation/rejection stance, negation, hard-failure phrases, and evidence thresholds—not exact response prose.

## Skills in this repository

There are two active skill categories. A third directory, `.squad/templates/skills/`, contains Squad scaffolding/reference templates and is not an installed skill set.

### Team-owned Foundry skills: `.squad/skills/`

These are application-domain skills owned by this team:

| Skill | Purpose |
| --- | --- |
| `foundry-architecture` | Requirements-first selection among direct calls, Router, agent surfaces, IQ, Toolbox, Skills, Tools, and local options. |
| `foundry-availability` | Read-only, evidence-shaped model/region/quota/capacity discovery with conservative failure semantics. |
| `foundry-delivery` | Environment readiness, `azd`/Bicep delivery, identity, evaluation, observability, deployment, and rollback gates. |

### Installed project Squad skills: `.github/skills/`

These operate the Squad framework rather than Microsoft Foundry itself:

| Skill | Purpose |
| --- | --- |
| `agent-collaboration` | Team-root awareness, decision inbox use, and cross-agent communication. |
| `coordinator-init-mode` | Two-phase team initialization and built-in agent scaffolding. |
| `coordinator-response-mode` | Direct/lightweight/standard/full response-mode selection. |
| `coordinator-source-of-truth` | Ownership and precedence for Squad state and generated files. |
| `cross-squad` | Discovery and coordination across independent Squad installations. |
| `cross-squad-communication` | Synchronous and asynchronous peer-Squad communication protocols. |
| `error-recovery` | Adaptation and recovery after failed operations. |
| `git-workflow` | Dev-first branch, PR, worktree, and promotion conventions. |
| `iterative-retrieval` | Bounded retrieval/revision cycles for delegated work. |
| `reflect` | Confidence-ranked learning capture after corrections, praise, or edge cases. |
| `reviewer-protocol` | Rejection workflow and revision-owner lockout semantics. |
| `secret-handling` | Prohibits live `.env` reads and secret/PII propagation into committed Squad state. |
| `session-recovery` | Discovery and resumption of interrupted Copilot CLI sessions. |
| `squad` | Categorized Squad command catalog and menu. |
| `squad-conventions` | Zero-dependency Node, file ownership, portability, and initialization conventions. |
| `squad-help` | Correct distinction among the Squad agent, skills, CLI commands, and initialization. |
| `squad-version-check` | Installed version stamping, upgrades, channels, and update checks. |
| `test-discipline` | Requires tests to change with APIs and filesystem expectations. |
| `tiered-memory` | Hot/cold/wiki memory tiers for smaller agent context. |

## Plugin and marketplace status

No repository plugin marketplace is configured: `.squad/plugins/` exists, but `.squad/plugins/marketplaces.json` does not. No marketplace plugin is declared as installed. The three `.squad/skills/foundry-*` skills are team-owned files, not marketplace plugins.

Copilot CLI supports `/plugin`, and Squad supports marketplace commands, but configuration is opt-in:

```sh
squad plugin marketplace list
squad plugin marketplace add "owner/repository"
squad plugin marketplace browse "marketplace-name"
squad plugin marketplace remove "marketplace-name"
```

Do not infer an installed repository plugin from host-level Copilot plugins or tools visible in a particular developer's session.

## MCP configuration and authentication boundaries

| File | Server | Purpose and boundary |
| --- | --- | --- |
| [`.mcp.json`](.mcp.json) | `squad_state` via `squad state-mcp` | Local Squad state bridge used by the coordinator/runtime for mutable team state. It does not authenticate to Azure. |
| [`.vscode/mcp.json`](.vscode/mcp.json) | `foundry-mcp-remote` at `https://mcp.ai.azure.com` | Remote Microsoft Foundry MCP Server. It is public preview and may expose read or write Foundry tools subject to explicit host approval and the signed-in user's Entra permissions. |
| [`.copilot/mcp-config.json`](.copilot/mcp-config.json) | None | Copilot-specific MCP configuration is intentionally empty in this repository. |

Restart Copilot CLI or VS Code after cloning or changing MCP configuration. In VS Code, use **MCP: List Servers**, start `foundry-mcp-remote`, complete the host-owned Entra prompt, and inspect/approve tools before use.

Azure CLI, `azd`, and Foundry MCP authentication are separate states. `az login` does not prove `azd` or MCP authentication, and the doctor reports them separately. The repository never embeds tokens or starts authentication automatically.

Foundry MCP is preview, has no production SLA, and should not be treated as the durable proof layer for subscription deployability. The repository's availability tool uses authenticated ARM GET operations for that evidence.

## Repository layout

```text
.
├── .github/
│   ├── agents/squad.agent.md       # generated/stamped Squad coordinator
│   ├── copilot-instructions.md     # coding-agent guidance
│   ├── skills/                     # installed Squad operating skills
│   └── workflows/                  # Squad issue/heartbeat/label automation
├── .squad/
│   ├── agents/                     # specialist charters and histories
│   ├── artifacts/templates/        # durable delivery artifact templates
│   ├── casting/                    # committed agent identity registry/policy
│   ├── skills/                     # team-owned Foundry domain skills
│   ├── templates/                  # Squad-owned upgrade/scaffolding templates
│   ├── team.md                     # authoritative roster
│   ├── routing.md                  # authoritative routing and delivery route
│   ├── ceremonies.md               # design, architecture, retrospective, ship gates
│   ├── decisions.md                # shared decisions
│   └── config.json                 # state backend (`local`)
├── .mcp.json                       # Squad state MCP
├── .vscode/mcp.json                # remote Foundry MCP preview
├── docs/foundry-squad.md           # deeper reference
├── schemas/                        # availability result contract
├── scripts/                        # doctor, availability, evaluator, eval runner
├── test/                           # node:test suites and A–J fixtures
└── package.json                    # scripts only; zero dependencies
```

### Generated, mutable, and local-only files

- `.github/agents/squad.agent.md` and `.squad/templates/` are Squad-generated/upgrade-managed surfaces; do not hand-edit generated capability blocks.
- `.squad/team.md`, routing, ceremonies, charters, domain skills, and artifact templates are repository-owned configuration.
- `.squad/decisions/inbox/`, logs, sessions, scratch/cache data, and orchestration logs are runtime state and ignored as configured.
- `.artifacts/` contains evaluation workspaces and results and is ignored.
- `.azure/`, `.azd/`, `.foundry/`, and `azure.local.yaml` are local cloud/tool state and are ignored.
- `.squad/casting/` is identity state and is intentionally committed.

## Security rules

- **Never read or commit live `.env` files.** Use safe `.env.example`, `.env.sample`, or `.env.template` files when a project provides them.
- Never embed API keys, tokens, passwords, connection strings, private keys, or personal data in prompts, artifacts, logs, decisions, fixtures, or MCP configuration.
- Local code may use `DefaultAzureCredential` with an existing developer login; production must select a deterministic system- or user-assigned managed identity.
- CI should use federated OIDC/workload identity, not long-lived client secrets.
- Grant least privilege at the narrowest practical scope. Diagnose `401`, `403`, `404`, `429`, `5xx`, timeout, and empty-result states independently.
- Review MCP tool permissions before execution. A configured remote endpoint is not blanket authorization for mutations.
- The availability script follows only same-origin, subscription-scoped ARM pagination links and never sends its bearer token cross-origin.
- Live evaluation runs strip common secret environment variables and disable built-in MCP servers.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `copilot`, `squad`, or another command is not found after installation | Restart the terminal and Copilot CLI/VS Code, then rerun the relevant `--version` command. |
| Doctor reports a missing tool | Install only the tool required for the selected scenario; the core repository requires only Node/npm, Git, Copilot CLI, and Squad CLI. |
| Doctor reports `NOT_AUTHENTICATED_OR_UNAVAILABLE` | Authenticate deliberately with the relevant tool. Azure CLI, `azd`, and MCP do not share a guaranteed login state. |
| Foundry MCP does not start or tools do not appear | Verify `.vscode/mcp.json`, restart VS Code, run **MCP: List Servers**, start the server, complete Entra sign-in, and check Agent Mode's tools list. |
| Availability returns `AUTH_REQUIRED` | Run `az login`, verify `az account show`, and retry with explicit subscription/location arguments. |
| Availability returns `FORBIDDEN_OR_ENTITLEMENT_UNKNOWN` | Verify target scope and the exact required role; do not broaden RBAC speculatively. |
| Availability returns `EMPTY_RESULT` or `CONSTRAINTS_UNVERIFIED` | Treat it as inconclusive. Check filters, structured metadata, entitlement, API behavior, and other evidence dimensions. |
| Region check returns `PARTIAL_FAILURE` | Inspect each region's authentication, permission, transient-error, and freshness evidence. |
| Live scenario H returns `BLOCKED_AUTH` | Supply explicit evidence JSON containing subscription-specific availability, quota, and capacity evidence. |
| `npm test` behaves differently across networks | Confirm the supported Node.js version is active. Tests require no npm registry access or package installation because the repository has zero dependencies and no lockfile. |

## Limitations

- Model catalogs, feature support, previews, regions, quota, and capacity change over time.
- The repository does not maintain a static model-region matrix.
- Documentation-only and replay results cannot prove subscription-specific deployability.
- The availability tool does not create or invoke a deployment, request quota, reserve capacity, or prove runtime health.
- The doctor cannot prove interactive Foundry MCP authentication from outside the host.
- Foundry MCP and Foundry Canvas are preview; confirm current limitations before production dependence.
- This repository does not install Foundry DevPack, Toolkit, Azure CLI, `azd`, extensions, SDK packages, Docker, .NET, Python, or Foundry Local.
- The test suite performs no authenticated external checks and provisions no Azure resources.

## Validate the repository

Keep changes surgical and update tests whenever public behavior, script flags, required files, schemas, or scenario expectations change. Preserve the zero-dependency constraint and use portable Node.js built-ins.

Before submitting a change, run these commands directly; no npm registry access or `npm install` is required because the repository has zero dependencies and no lockfile:

```sh
npm test
npm run doctor
npm run eval
git diff --check
```

Do not commit generated `.artifacts/`, local Azure/Foundry state, credentials, or live `.env*` files. Follow the repository's dev-first branch and review conventions when opening a PR.

## Authoritative Microsoft and GitHub documentation

These are the current entry points used by the repository. Re-check them when making a time-sensitive architecture or availability claim.

- [Microsoft Foundry documentation](https://learn.microsoft.com/azure/foundry/)
- [Foundry capabilities](https://learn.microsoft.com/azure/foundry/concepts/capabilities)
- [Foundry SDK overview](https://learn.microsoft.com/azure/foundry/how-to/develop/sdk-overview)
- [Prepare the Foundry developer environment and install DevPack](https://learn.microsoft.com/azure/foundry/how-to/develop/install-cli-sdk)
- [Install Microsoft Foundry Toolkit for Visual Studio Code](https://learn.microsoft.com/azure/foundry/how-to/develop/install-foundry-toolkit-visual-studio-code)
- [Use the Microsoft Foundry Skill](https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill)
- [Foundry MCP Server preview](https://learn.microsoft.com/azure/foundry/mcp/get-started)
- [Install the `azd` Foundry extensions](https://learn.microsoft.com/azure/foundry/agents/how-to/install-cli-foundry-extensions)
- [Deploy Foundry models](https://learn.microsoft.com/azure/foundry/foundry-models/how-to/deploy-foundry-models)
- [Model Router](https://learn.microsoft.com/azure/foundry/openai/concepts/model-router)
- [Responses API](https://learn.microsoft.com/azure/foundry/agents/quickstarts/responses-api)
- [Hosted agents](https://learn.microsoft.com/azure/foundry/how-to/develop/framework-hosted-agents)
- [Toolbox](https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox)
- [Foundry IQ](https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq)
- [Evaluation and observability](https://learn.microsoft.com/azure/foundry/concepts/observability)
- [Location Models REST](https://learn.microsoft.com/rest/api/aiservices/accountmanagement/models/list?view=rest-aiservices-accountmanagement-2024-10-01)
- [Location Model Capacities REST](https://learn.microsoft.com/rest/api/aiservices/accountmanagement/location-based-model-capacities/list?view=rest-aiservices-accountmanagement-2024-10-01)
- [Account Usages REST](https://learn.microsoft.com/rest/api/aiservices/accountmanagement/usages/list?view=rest-aiservices-accountmanagement-2024-10-01)
- [Install GitHub Copilot CLI](https://docs.github.com/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli)
