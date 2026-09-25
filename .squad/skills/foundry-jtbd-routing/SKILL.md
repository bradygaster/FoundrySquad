# Foundry JTBD Routing

## Purpose

Route a stated customer goal to the smallest sufficient Foundry capability set, fast, using pre-baked evidence instead of re-deriving it in every session. This skill is decision support, not a substitute for `.squad/skills/foundry-availability/SKILL.md` — a routing match tells you *what kind* of Foundry surface fits a job; it never tells you whether a specific model/region/quota is actually deployable today.

Backing evidence: `.squad/artifacts/jtbd-catalog.md` (83 cited jobs across 6 domains, confidence-rated). Re-read the catalog entry before quoting a specific statistic or customer name to a customer; this skill only carries the routing conclusion, not full citations.

## When to use this

Architect uses this first, during requirements framing, to recognize which of the six domains a stated goal belongs to and jump straight to the matching Foundry surface(s) instead of starting from a blank page. Agent Engineer, Integration Engineer, and Knowledge Engineer use the same table to sanity-check that the surface Architect assigned them actually matches known market pattern for that job type.

## Decision Table — Job Pattern → Foundry Surface → Owner

| Customer says roughly... | Job pattern (catalog domain) | Primary Foundry surface | Owning role | Evidence strength |
|---|---|---|---|---|
| "Let customers self-serve support without waiting for an agent" | Self-service virtual agent / tier-1 deflection (A) | Hosted Agent / Foundry Agent Service + Foundry IQ + Model Router | Agent Engineer + Knowledge Engineer | High |
| "Help our live agents work faster / know what to say" | Agent-assist, real-time transcription/sentiment (A) | Foundry Tools (Speech/Language) + Foundry IQ | Integration Engineer + Knowledge Engineer | High–Medium |
| "Summarize every call/chat and score QA automatically" | Post-interaction summarization/QA (A) | Prompt Agent + Azure AI Language | Agent Engineer | Medium |
| "Our IVR is old and customers hate it" | IVR modernization (A) | Foundry Tools (Speech) + Hosted Agent + Model Router | Integration Engineer + Agent Engineer | Low–Medium (verify demand locally) |
| "Employees/customers can't find answers across our scattered docs/systems" | Permission-aware unified retrieval (A, B) | Foundry IQ (agentic retrieval) | Knowledge Engineer | High |
| "We want a Q&A bot over our internal policies/handbooks/HR docs" | Internal knowledge Q&A (B) | Foundry IQ + Prompt Agent, Entra permission enforcement | Knowledge Engineer + Platform Engineer | Medium |
| "Speed up legal/contract review" | Contract review/CLM/risk-scoring (B, D) | Azure AI Search RAG / Foundry IQ + Content Understanding contract schema + Prompt/Hosted Agent | Knowledge Engineer + Integration Engineer | Medium |
| "Help our developers find answers/docs faster" | Internal engineering knowledge assistant (B, C) | Foundry IQ + Prompt/Hosted Agent via Microsoft Agent Framework | Knowledge Engineer + Agent Engineer | Medium |
| "We want AI woven into our coding/dev workflow" | AI coding assistant, PR review, test generation (C) | Direct model call / Responses API ephemeral agents + Hosted Agent (code exec/MCP tools) | Agent Engineer + Integration Engineer | High |
| "Reduce our technical debt / modernize legacy code (incl. mainframe)" | Tech-debt reduction, COBOL/mainframe migration (C) | Microsoft Agent Framework multi-agent (scan→prioritize→propose PR→test) | Agent Engineer | Medium–Low |
| "Give our platform team AI-assisted self-service provisioning" | Internal developer platform (C) | Hosted Agent embedded in IDP + MCP provisioning tools, Toolbox | Integration Engineer + Platform Engineer | Medium |
| "Automate incident response / reduce MTTR" | SRE/AIOps root-cause and triage (C) | Microsoft Agent Framework + Azure Monitor MCP/tool integration, human-in-the-loop gates | Agent Engineer + Integration Engineer | High (product) / Medium-Low (market size) |
| "We want a full agentic SDLC (plan→code→review→test→ship→operate)" | Agentic DevOps (C) | Microsoft Agent Framework multi-agent + Hosted Agents + Foundry Tools + Foundry IQ | Agent Engineer + Integration Engineer + Knowledge Engineer | High |
| "Pull structured data out of invoices/forms/scanned documents" | Document/data extraction (D) | Foundry Tools (Document Intelligence / Content Understanding) + Hosted Agent | Integration Engineer + Agent Engineer | High |
| "Automate insurance claims or healthcare prior-authorization review" | Regulated claims/PA multi-step pipelines (D, F) | Microsoft Agent Framework multi-agent pipeline + Document Intelligence/Content Understanding + Foundry IQ | Agent Engineer + Knowledge Engineer | High–Medium |
| "Let business users ask questions over our structured/BI data" | Conversational BI (D) | Foundry IQ over Fabric/OneLake + Hosted/Prompt Agent via MCP to Fabric Data Agents | Knowledge Engineer + Integration Engineer | Medium-High |
| "Turn our unstructured content into something queryable" | Unstructured-to-structured conversion (D) | Content Understanding (multimodal doc/image/video → schema) feeding Foundry IQ | Integration Engineer + Knowledge Engineer | Medium |
| "Generate product descriptions / marketing copy / images / video at scale" | Content generation, personalization (E) | Direct model call + Model Router (cost) + Prompt Agent (grounded briefs); multimodal (Sora/GPT-image) for video/image | Agent Engineer | High |
| "Localize content into many languages/markets" | Localization (E) | Foundry Tools (Azure AI Translator, Custom/Adaptive Translation, Speech dubbing) | Integration Engineer | High (demand) / Medium (mapping) |
| "Automate multi-step marketing campaigns (brief→draft→review→publish)" | Agentic marketing workflows (E) | Hosted Agents / Foundry Agent Service multi-agent via Microsoft Agent Framework | Agent Engineer | High |
| "Audit/govern AI-generated content for brand and compliance" | Content governance (E) | Foundry Agent Service multi-agent (Researcher/Auditor/Briefer) + Purview governance | Agent Engineer + Platform Engineer | Low-Medium |
| "We're a regulated bank/insurer/health plan and need compliant conversational or case-processing AI" | Regulated-industry conversational + case automation (F) | Foundry Agent Service / Hosted Agent + Microsoft Agent Framework + Content Safety | Agent Engineer + Platform Engineer | High |
| "We need predictive maintenance / anomaly detection on industrial or financial data" | Predictive/anomaly detection copilots (D, F) | Hosted Agent explaining Azure ML/Fabric-detected anomalies | Agent Engineer + Knowledge Engineer | High–Medium |
| "We must run fully offline/on-device (sovereignty, air-gapped, edge QC)" | Sovereign / disconnected / edge inference (F) | Foundry Local (+ Azure Local for sovereign/Arc-managed clusters) | Platform Engineer + Agent Engineer | Low–Medium (capability proven, demand thin) |
| "We want multiple agents collaborating on one task (research, review, audit, incident response)" | Multi-agent orchestration patterns: sequential, fan-out/fan-in, manager+worker (C, F) | Microsoft Agent Framework orchestration | Agent Engineer | Medium (real reference patterns, most lack quantified customer outcomes) |
| "Is agentic AI actually happening in our industry, or are we ahead of the market?" | Adoption/whitespace framing (F, cross-cutting) | Not a capability question — use catalog entry #83 (Gartner <5%→40% by 2026; McKinsey scaled-adoption rates by industry) to set expectations | Architect | High |

## How to use this during requirements framing

1. Match the customer's stated goal to the closest row above by pattern, not by exact wording — jobs rarely arrive pre-labeled.
2. Treat the "Owning role" column as a *starting* handoff, not a final answer — Architect still makes the direct/Router/agent/Framework call per its own charter.
3. Check "Evidence strength": High/Medium-High rows can anchor a customer-facing business case citing the named proof point in the catalog; Low/Low-Medium rows are directionally useful for architecture but should not be quoted as proven market demand without saying so.
4. Never treat a routing match as a deployability claim — confirm actual model/region/quota/tool availability via `.squad/skills/foundry-availability/SKILL.md` before committing to an architecture.
5. If a stated goal doesn't match any row, that's a genuine gap: route it through normal requirements/architecture work and consider recording the new pattern back into the catalog via the decision inbox (`.squad/decisions/inbox/`).

## Freshness

The catalog was compiled 2026-09-24/25 from public sources; re-verify any specific statistic or customer name before repeating it externally. This table itself should be revisited whenever Foundry ships a new surface (e.g., a new Tool or orchestration primitive) or when the catalog is refreshed.
