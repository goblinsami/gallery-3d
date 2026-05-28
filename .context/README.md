# Context System

## Folder Purpose
- `.context/`
  - Retrieval policy, context loading strategy, dependency maps, low-token operating notes.
- `agents/`
  - Role-based agent contracts (scope, guardrails, file load sets).
- `skills/`
  - Reusable implementation pattern cards (short, retrieval-friendly).
- `patterns/`
  - Concrete architecture templates and anti-pattern checklists.
- `summaries/`
  - Compressed repository knowledge for fast warm-start context.

## Recommended Load Order
1. `AGENTS.md`
2. `AI_RULES.md`
3. `summaries/architecture_summary.md`
4. `REPO_MAP.md`
5. conditional files from `.context/retrieval_optimization.md`
