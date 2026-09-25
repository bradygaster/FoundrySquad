# Microsoft Foundry Squad Developer Guide

## What this repository provides

The Squad has eight specialists:

- **Architect** chooses the smallest sufficient architecture.
- **Model Strategist** gathers current, environment-aware model and deployment evidence.
- **Agent Engineer** implements direct model calls, Model Router, Responses API agents, Prompt/Hosted Agents, and Microsoft Agent Framework orchestration.
- **Integration Engineer** implements Toolbox, Foundry Tools, and Foundry Skills.
- **Knowledge Engineer** implements Foundry IQ and governed, permission-aware knowledge retrieval.
- **Platform Engineer** owns identity, infrastructure, deployment, and operations.
- **Quality Engineer** defines and runs repeatable AI evaluations and observability checks.
- **Reviewer** challenges complexity, stale assumptions, unsupported shortcuts, weak identity, and missing evidence.

Fact Checker and Rai provide current-claim and Responsible AI review. Existing Squad routing, ceremonies, decisions, memory, and casting remain the orchestration system.

## Invocation

Invoke the Squad coordinator from this repository and supply the application goal. Good initial context includes:

- user experience and desired outcome
- latency, throughput, traffic, and cost sensitivity
- data, privacy, residency, and enterprise permission needs
- required tools, modalities, state, human review, and offline behavior
- deployment environment and permitted Azure subscriptions/regions
- success criteria, evaluation, and operational requirements

The team writes durable artifacts from `.squad/artifacts/templates/`. It first decides whether AI or an agent is needed, then evaluates direct model invocation, Model Router, Responses API ephemeral agents, Prompt Agents, Hosted Agents, and Microsoft Agent Framework as warranted.

## Workflow and gates

1. **Requirements:** Architect records constraints and acceptance criteria, using `.squad/skills/foundry-jtbd-routing/SKILL.md` for a fast first pass from stated customer goal to Foundry capability.
2. **Architecture:** Architect identifies the smallest sufficient design. The architecture gate challenges unnecessary agents, RAG, tools, infrastructure, and custom orchestration.
3. **Current evidence:** Model Strategist uses `.squad/skills/foundry-availability/SKILL.md`. A documentation claim is not a subscription deployability claim.
4. **Build in parallel:** after contracts are stable, application, `azd`/Bicep infrastructure, and evaluation work may proceed together.
5. **Evaluate and observe:** tests, Foundry evaluations where appropriate, OpenTelemetry, and Application Insights evidence cover material behavior and failure paths.
6. **Pre-ship review:** Reviewer requires implementation, infrastructure, evaluation, identity, deployment, rollback, and runtime evidence.

## Developer environment

Run the zero-dependency read-only doctor:

```sh
node scripts/foundry-doctor.js
```

It checks, in order:

1. repository intent
2. executable presence
3. version status
4. Foundry tooling indicators
5. MCP configuration syntax
6. separate Azure CLI, `azd`, and MCP authentication state
7. live discovery only with explicit context
8. documentation fallback

The doctor may run non-mutating version, list, account-status, and token-status commands. It never installs tools, begins authentication, chooses a subscription, creates resources, changes RBAC, or invokes `npx -y`.

Current supported entry points include Microsoft Foundry DevPack, Microsoft Foundry Toolkit for VS Code, and `azd ext install microsoft.foundry`. Foundry Canvas and Foundry MCP are preview; confirm current limitations before depending on them.

## Authentication boundary

- **Local development:** application code may use `DefaultAzureCredential` with an existing developer login. The Squad may report that login is missing but does not start it.
- **Production:** select a deterministic managed identity and document whether it is user-assigned or system-assigned. Do not rely on an accidental local credential-chain choice.
- **CI:** use federated OIDC/workload identity rather than a long-lived client secret.
- **RBAC:** grant the smallest role at the narrowest practical scope. A 403 is an evidence gap, not permission to broaden access.
- **MCP:** the workspace includes the public Foundry MCP preview endpoint. Its interactive Entra authentication is host-owned and remains separate from Azure CLI and `azd` state.

Do not commit credentials or local Azure/Foundry state. Do not read `.env` files for discovery; use documented schemas and safe example files.

## Availability discovery

The read-only orchestrator implements:

```text
find_models
inspect_model
find_regions
check_quota
check_capacity
explain_deployment_options
```

Example:

```sh
node scripts/foundry-availability.js inspect_model \
  --subscription "<subscription-id>" \
  --location "<region>" \
  --format "<model-format>" \
  --model "<model-name>" \
  --version "<model-version>" \
  --capabilities "<capability-a>,<capability-b>" \
  --tools "<required-tool>" \
  --deployment-type "<deployment-type>"
```

For region discovery, provide a policy-approved candidate set rather than relying on an embedded matrix:

```sh
node scripts/foundry-availability.js find_regions \
  --subscription "<subscription-id>" \
  --model "<model-name>" \
  --regions "<region-a>,<region-b>"
```

Every result carries status, source, timestamp/freshness, scope, auth outcome, evidence, warnings, and separate dimensions for catalog presence, compatibility, regional availability, entitlement, quota, capacity, deployability, and runtime health. A 401, 403, 404, 429, 5xx, timeout, malformed payload, or empty list never becomes a false “unavailable.”

Capability, tool, and deployment-type constraints are matched only against explicit structured catalog metadata. Entries with missing metadata are excluded from matches and reported as `CONSTRAINTS_UNVERIFIED`, rather than having the constraint silently ignored. ARM collection follows same-origin, subscription-scoped `nextLink` pages with a safety limit and records evidence for each page. Composite region results retain each source status and freshness; mixed or failed checks are not labeled successful live evidence.

ARM API version `2024-10-01` is used for Location Models, Location Based Model Capacities, and Account Usages. Foundry MCP is a preferred project-aware interface when appropriate, but it is preview; ARM remains the durable subscription verification layer.

The tool is discovery only. It does not create a deployment, test runtime inference, request quota, reserve capacity, or prove end-to-end health.

## Application surfaces and terminology

Retrieve current feature details rather than pinning them into team prompts. Current architecture discussions distinguish:

- direct model calls and Model Router
- Responses API ephemeral agent pattern
- Prompt Agent and Hosted Agent
- Microsoft Agent Framework
- the singular Toolbox resource
- Foundry Skills preview and Foundry IQ
- Foundry Local versus Foundry Local on Azure Local
- evaluations, monitoring, OpenTelemetry, and Application Insights

For .NET, prefer current supported surfaces when selected: `Azure.AI.Projects`, `Azure.AI.Projects.Agents`, `Microsoft.Agents.AI.Foundry`, `Microsoft.Agents.AI.Foundry.Hosting`, `OpenAI` with `Azure.Identity`, `Azure.ResourceManager.CognitiveServices`, and `Microsoft.AI.Foundry.Local`. Durable guidance intentionally does not pin volatile package versions.

## Evaluations

Deterministic scenarios A–J live in `test/fixtures/scenarios.json`. The evaluator uses stance signals, negation handling, hard-failure signals, and optional evidence thresholds rather than exact response prose.

Replay:

```sh
node scripts/run-foundry-squad-evals.js \
  --replay test/fixtures/eval-responses.json
```

Opt-in live Copilot CLI run:

```sh
node scripts/run-foundry-squad-evals.js --live
```

Live runs copy only the Squad configuration into `.artifacts/foundry-squad-evals/<run>/workspace`, expose read-only search tools, and store responses/results under the ignored artifact directory. They do not authorize Azure changes.

Scenario H is intentionally `BLOCKED_AUTH` for authenticated live runs unless `--evidence <json>` supplies subscription-specific availability, quota, and capacity evidence. The runner does not infer that evidence from persuasive prose.

## Authoritative entry points

- Foundry documentation: `https://learn.microsoft.com/azure/foundry/`
- Capabilities: `https://learn.microsoft.com/azure/foundry/concepts/capabilities`
- SDK overview: `https://learn.microsoft.com/azure/foundry/how-to/develop/sdk-overview`
- Developer environment: `https://learn.microsoft.com/azure/foundry/how-to/develop/install-cli-sdk`
- Foundry Skill: `https://learn.microsoft.com/azure/foundry/how-to/develop/use-microsoft-foundry-skill`
- Foundry MCP preview: `https://learn.microsoft.com/azure/foundry/mcp/get-started`
- `azd` Foundry extensions: `https://learn.microsoft.com/azure/foundry/agents/how-to/install-cli-foundry-extensions`
- Models and deployment: `https://learn.microsoft.com/azure/foundry/foundry-models/how-to/deploy-foundry-models`
- Model Router: `https://learn.microsoft.com/azure/foundry/openai/concepts/model-router`
- Responses API: `https://learn.microsoft.com/azure/foundry/agents/quickstarts/responses-api`
- Hosted agents: `https://learn.microsoft.com/azure/foundry/how-to/develop/framework-hosted-agents`
- Toolbox: `https://learn.microsoft.com/azure/foundry/agents/how-to/tools/toolbox`
- Foundry IQ: `https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq`
- Evaluation and observability: `https://learn.microsoft.com/azure/foundry/concepts/observability`
- Location Models REST: `https://learn.microsoft.com/rest/api/aiservices/accountmanagement/models/list?view=rest-aiservices-accountmanagement-2024-10-01`
- Location Model Capacities REST: `https://learn.microsoft.com/rest/api/aiservices/accountmanagement/location-based-model-capacities/list?view=rest-aiservices-accountmanagement-2024-10-01`
- Account Usages REST: `https://learn.microsoft.com/rest/api/aiservices/accountmanagement/usages/list?view=rest-aiservices-accountmanagement-2024-10-01`

## Limitations

- Model catalogs, feature support, preview status, regions, quota, and capacity are volatile.
- Catalog presence does not prove compatibility, entitlement, quota, capacity, deployment success, or runtime health.
- Documentation-only results cannot prove subscription-specific deployability.
- The doctor cannot establish interactive MCP authentication without the host.
- The repository does not install DevPack, Toolkit, Azure CLI, `azd`, extensions, SDKs, or packages.
- No Azure resource is provisioned and no authenticated external check is performed by the test suite.
