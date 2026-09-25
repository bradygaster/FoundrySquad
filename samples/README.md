# Microsoft Foundry Samples

> **These examples are NOT LIVE.** Any resource names, GUIDs, endpoints, identity
> IDs, or request/response IDs are fictional placeholders and do not identify
> real Azure resources. Authenticated runs require caller-supplied configuration.

These samples are produced by the [Foundry Sample Lab](../docs/experiments/README.md).
They are local-first demonstrations: default builds and tests use deterministic
fixtures or fake transports, while authenticated Microsoft Foundry execution is
an explicit opt-in path.

## Sample contract

Every integrated sample must:

- run its default tests without Azure credentials or network access;
- keep secrets out of source, fixtures, logs, and documentation;
- use `DefaultAzureCredential` for optional authenticated execution;
- validate endpoints and configuration before a network call;
- bound retries, timeouts, agent/tool loops, and input sizes as applicable;
- distinguish local validation from documentation evidence and authenticated
  runtime evidence;
- include setup, run, test, expected failure, and limitation documentation;
- link to its experiment journal.

## Lab scenarios

| Scenario | Intended lesson | Integrated control | Authenticated standalone |
| --- | --- | --- | --- |
| Model routing | Start with direct invocation; add deterministic routing only when request variation earns it. | [`model-routing-advisor`](model-routing-advisor/README.md) | [`bradygaster/foundry-model-routing-advisor`](https://github.com/bradygaster/foundry-model-routing-advisor) |
| Tool-using agent | Use one read-only, typed tool and fail closed before adding hosted or multi-agent infrastructure. | [`change-risk-agent`](change-risk-agent/README.md) | [`bradygaster/foundry-change-risk-agent`](https://github.com/bradygaster/foundry-change-risk-agent) |
| Grounded knowledge | Enforce permission filtering before ranking or generation, and cite only retrieved evidence. | [`permission-aware-knowledge`](permission-aware-knowledge/README.md) | [`bradygaster/foundry-permission-aware-knowledge`](https://github.com/bradygaster/foundry-permission-aware-knowledge) |

Authenticated availability, quota, capacity, deployment, and runtime behavior are
never inferred from a passing local test suite.
