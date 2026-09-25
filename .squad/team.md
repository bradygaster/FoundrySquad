# Microsoft Foundry Application Development Squad

> Turns application intent into the smallest correct, production-capable Microsoft Foundry architecture, then builds, provisions, evaluates, deploys, observes, and validates it.

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | Routes work, enforces handoffs and reviewer gates. |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Architect | Foundry Architect | .squad/agents/architect/charter.md | 🏗️ Active |
| Model Strategist | Model Strategist | .squad/agents/model-strategist/charter.md | 📊 Active |
| Agent Engineer | Agent Engineer | .squad/agents/agent-engineer/charter.md | 🔧 Active |
| Integration Engineer | Integration Engineer | .squad/agents/integration-engineer/charter.md | 🧩 Active |
| Knowledge Engineer | Knowledge Engineer | .squad/agents/knowledge-engineer/charter.md | 📚 Active |
| Platform Engineer | Foundry Platform Engineer | .squad/agents/platform-engineer/charter.md | ⚙️ Active |
| Quality Engineer | Foundry Quality Engineer | .squad/agents/quality-engineer/charter.md | 🧪 Active |
| Reviewer | Foundry Reviewer | .squad/agents/reviewer/charter.md | 🔍 Active |
| Scribe | Session Logger | .squad/agents/scribe/charter.md | 📋 Silent |
| Ralph | Work Monitor | .squad/agents/ralph/charter.md | 🔄 Monitor |
| Rai | RAI Reviewer | .squad/agents/Rai/charter.md | 🛡️ Active |
| Fact Checker | Verification & Devil's Advocate | .squad/agents/fact-checker/charter.md | 🔍 Active |

## Coding Agent

<!-- copilot-auto-assign: false -->

| Name | Role | Charter | Status |
|------|------|---------|--------|
| @copilot | Coding Agent | — | 🤖 Coding Agent |

### Capabilities

**🟢 Good fit — auto-route when enabled:**
- Bug fixes with clear reproduction steps
- Test coverage (adding missing tests, fixing flaky tests)
- Lint/format fixes and code style cleanup
- Dependency updates and version bumps
- Small isolated features with clear specs
- Boilerplate/scaffolding generation
- Documentation fixes and README updates

**🟡 Needs review — route to @copilot but flag for squad member PR review:**
- Medium features with clear specs and acceptance criteria
- Refactoring with existing test coverage
- API endpoint additions following established patterns
- Migration scripts with well-defined schemas

**🔴 Not suitable — route to squad member instead:**
- Architecture decisions and system design
- Multi-system integration requiring coordination
- Ambiguous requirements needing clarification
- Security-critical changes (auth, encryption, access control)
- Performance-critical paths requiring benchmarking
- Changes requiring cross-team discussion

## Project Context

- **Project:** FoundrySquad
- **User:** Brady Gaster
- **Created:** 2026-09-25
- **Mission:** Choose, build, provision, evaluate, deploy, and operate the smallest sufficient Microsoft Foundry application architecture.
- **Defaults:** Discover rather than assume; prefer supported first-party Foundry mechanisms; prefer C#/.NET when support is equivalent; prefer managed identity, official SDKs, `azd`, repeatable evaluation, and useful observability.
- **Architecture rule:** Direct model invocation, Model Router, Prompt Agents, Hosted Agents, Microsoft Agent Framework, Foundry IQ, Toolboxes, Skills, Tools, and Foundry Local are options to evaluate, not defaults.
