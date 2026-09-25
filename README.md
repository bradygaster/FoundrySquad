# Microsoft Foundry Squad

This repository is a Squad configuration for turning application intent into the smallest production-capable Microsoft Foundry architecture. It reuses Squad's roster, routing, charters, skills, ceremonies, decisions, and handoffs; it is not a separate agent framework or a deployable availability service.

## Start

1. Open the repository with GitHub Copilot CLI or another Squad-compatible host.
2. Invoke the Squad coordinator and describe the application outcome and constraints.
3. Follow the requirements → architecture → current evidence → implementation/infrastructure/evaluation → pre-ship review workflow.

Read [the developer guide](docs/foundry-squad.md) for prerequisites, commands, authentication boundaries, current terminology, live discovery, and limitations.

## Read-only checks

```sh
node scripts/foundry-doctor.js
node scripts/foundry-availability.js explain_deployment_options --requirements "low-latency internal assistant"
```

Authenticated discovery is explicit:

```sh
node scripts/foundry-availability.js find_models \
  --subscription "<subscription-id>" \
  --location "<region>"
```

The tools never install, log in, select a subscription, provision, assign RBAC, or deploy.

## Validate

Configure the required package proxy before any npm command:

```sh
npm config set registry "https://packagefeedproxy.microsoft.io/npm/"
npm test
npm run eval
```

There are no npm dependencies.
