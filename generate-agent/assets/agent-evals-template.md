# Agent invocation evals template

`<destination>/evals/<agent-name>.json` holds the invocation eval suite for one agent. It is written BEFORE the agent file (strict TDD per A5) and versioned alongside the agent (A6), so it can be re-run at any time (modify flow, audits).

Each scenario is a **parent-task situation**: a prompt the main conversation receives, for which the parent must decide whether to delegate to this agent. Scenarios are judged against the agent's `description` only — that is all the parent sees when routing.

## Schema

```json
[
  {
    "type": "should_delegate",
    "prompt": "A parent task for which this agent MUST be chosen",
    "note": "Optional rationale"
  },
  {
    "type": "should_not_delegate",
    "prompt": "A near-miss task that MUST NOT route to this agent",
    "competing_agent": "name-of-the-agent-that-should-handle-it-instead",
    "note": "Optional rationale; use 'none' if no competing agent exists"
  },
  {
    "type": "ambiguous",
    "prompt": "A borderline task where the parent should clarify before delegating",
    "note": "What the parent should clarify"
  }
]
```

## Rules

- ≥ 3 `should_delegate`, ≥ 3 `should_not_delegate`, ≥ 1 `ambiguous`.
- Prompts must be realistic — phrasings the user would actually type, in their natural language.
- No trivial variations of the same prompt. Each scenario exercises a distinct routing decision.
- `note` is required on `ambiguous` scenarios (it states the expected clarification).

## Concrete example (hypothetical `hooks-auditor` agent)

```json
[
  {
    "type": "should_delegate",
    "prompt": "Liste tous les hooks du projet et ce qu'ils déclenchent avant que je touche à la config"
  },
  {
    "type": "should_delegate",
    "prompt": "Quels scripts tournent en PreToolUse ici ?"
  },
  {
    "type": "should_delegate",
    "prompt": "Fais l'inventaire des settings.json globaux et projet, avec les permissions"
  },
  {
    "type": "should_not_delegate",
    "prompt": "Ajoute un hook PostToolUse qui lance prettier",
    "competing_agent": "none",
    "note": "A write on settings — handled by the update-config skill, not an agent"
  },
  {
    "type": "should_not_delegate",
    "prompt": "Pourquoi mon hook PreToolUse fait planter Bash ?",
    "competing_agent": "investigator",
    "note": "Root-cause analysis, not inventory"
  },
  {
    "type": "should_not_delegate",
    "prompt": "Cartographie le code qui gère l'upload de fichiers",
    "competing_agent": "codebase-explorer",
    "note": "Application code mapping, not harness configuration"
  },
  {
    "type": "ambiguous",
    "prompt": "Regarde ce qui se passe avec les hooks",
    "note": "Clarify: inventory them (delegate) or debug a specific failure (investigator)?"
  }
]
```
