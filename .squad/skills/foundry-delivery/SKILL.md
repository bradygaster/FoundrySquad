# Foundry Delivery

## Use When

Preparing, deploying, evaluating, or operating an approved Foundry architecture.

## Procedure

1. Run the read-only doctor. Detect repo intent, executables, versions, Foundry tooling, MCP syntax, Azure CLI auth, `azd` auth, and MCP auth separately.
2. Prefer Foundry DevPack and Microsoft Foundry Toolkit for VS Code for supported local workflows; Foundry Canvas is preview.
3. Prefer `azd` with `azd ext install microsoft.foundry` and Bicep for repeatable delivery. Portal operations require an explicit exception.
4. Use `DefaultAzureCredential` for local developer chains without embedding secrets. Select deterministic managed identity in production and federated OIDC/workload identity in CI.
5. Apply least privilege at the narrowest practical scope. Never broaden RBAC to silence an error.
6. Implement application, infrastructure, evaluation, and OpenTelemetry/Application Insights observability together.
7. Verify deployment and runtime health; record rollback, failure triage, and promotion evidence.

The doctor never installs, logs in, selects a subscription, provisions, assigns RBAC, starts authentication, or invokes `npx -y`.

## Authoritative Entry Points

- Environment: `https://learn.microsoft.com/azure/foundry/how-to/develop/install-cli-sdk`
- Foundry MCP preview: `https://learn.microsoft.com/azure/foundry/mcp/get-started`
- Foundry `azd` extensions: `https://learn.microsoft.com/azure/foundry/agents/how-to/install-cli-foundry-extensions`
- Evaluation/observability: `https://learn.microsoft.com/azure/foundry/observability/`

## Completion Evidence

Repeatable deployment, identity/RBAC, evaluation thresholds, telemetry, runtime verification, and rollback evidence are present.
