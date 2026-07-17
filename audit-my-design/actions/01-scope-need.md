# 01 — Scope the need

Interview the user before any audit or proposal. The quality of the spec is capped by the quality of this scoping. Never assume the brief.

## Inputs

- `request` (required) — string. The user's free-form design/redesign ask.
- `target` (optional) — string. Path, URL, route, or screen name of the UI in scope, if already given.

## Outputs

A scope brief held in conversation context and passed to actions 02–05. Shape:

```text
mode             = creation | redesign
subject          = <what the product/page is, its domain>
audience         = <who uses it, their context and constraints>
job_to_be_done   = <the single primary job of the screen/flow>
goals            = <business + user goals, ranked>
success_criteria = <how we will know the design works (measurable when possible)>
scope_in         = <pages/screens/flows in scope>
scope_out        = <explicitly excluded>
constraints      = <brand, design system, tech stack, i18n, perf, deadlines>
target_paths     = <file paths / routes / URLs to audit, if redesign>
```

## Process

1. Read `references/interview-guide.md`. Pull the shared questions plus the branch for the detected mode.
2. Detect `mode`:
   - Existing UI to improve, words like "refonte", "améliore", "datée", a real path/URL given → `redesign`.
   - "crée", "nouvelle page", "from scratch", no existing UI → `creation`.
   - Unclear → ask the user explicitly which one (this is the ambiguous case in evals).
3. Ask the questions in batches (use `AskUserQuestion` for choices, plain prose for open answers). Never dump the whole bank at once — ask what is missing, prioritizing `job_to_be_done`, `goals`, and `success_criteria`.
4. If `redesign`: confirm and record `target_paths` (files, routes, or a running URL). If the codebase is reachable, do a quick `Glob`/`Grep` to confirm the target exists before promising an audit.
5. Restate the scope brief back to the user in 5–8 lines and get explicit confirmation before fanning out the agents.
6. Hand off: `creation` → actions 03, 04 (propose-only). `redesign` → actions 02, 03, 04 (critique-then-propose, in parallel).

## Test

**Pattern C — LLM assertion with example:**
Assert: "The scope brief sets all of `mode`, `subject`, `audience`, `job_to_be_done`, `goals`, `success_criteria`, `scope_in`; for `redesign` it also sets `target_paths`; and the user confirmed the restated brief in writing."

Example of a correct (confirmed) brief:
```text
mode             = redesign
subject          = SaaS dashboard for property-management (gestion de copropriété)
audience         = property managers, 35–55, desktop-first, time-pressured
job_to_be_done   = let a manager see the day's urgent items in under 10s
goals            = 1) cut time-to-first-action 2) modernize a dated look 3) keep data density
success_criteria = task time -30%, SUS score > 75, no drop in records shown per screen
scope_in         = /dashboard main view + its 3 widgets
scope_out        = settings, billing, auth
constraints      = React + Tailwind, existing design tokens, FR/EN i18n, must stay AA
target_paths     = src/pages/Dashboard.tsx, src/components/widgets/*
```
