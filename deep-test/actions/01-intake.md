# 01 — Intake

Scope the feature set to test, get the app running, and verify it is reachable. Nothing downstream runs until both are settled. Runs in the main loop (it talks to the user) but delegates all non-interactive work to the `app-scout` agent.

## Inputs

- `prompt` (required) — the raw `<prompt>` describing the feature(s) to deep-test.

## Depends on

_None — entry action._

## Process

1. Read the `prompt` and extract the candidate feature set (one or more user-facing capabilities). If it names no concrete feature ("test the app", "make sure everything works"), STOP and ask which features to scope — never guess the surface.
2. Spawn the **`app-scout`** subagent (Agent tool, `subagent_type: app-scout`, model `sonnet`). Pass the repo path and `references/app-launch.md`. It must: detect the app type (framework, package scripts), find and launch the dev server (UI) and API process, verify both respond, and probe the codebase to propose the testable surface + the credentials / seed data QA will need. It returns a structured `app_access` + `scope_proposal` record.
3. Present the scout's `scope_proposal` to the user and confirm the exact feature set + acceptance intent. Ask clarifying questions until unambiguous.
4. Collect and confirm **app access**: base URL, API base URL, test credentials / test account, and any seed data. If the scout could not launch the app or a URL does not respond, ask the user for the correct command / URL and re-verify before proceeding.
5. GATE: do not continue to `map` until (a) the feature scope is confirmed in writing AND (b) both the UI base URL and API base URL respond to a reachability probe. If either fails, stay here.
6. Emit the `scoped_features` + `app_access` record and hand off to `map`.

## Outputs

The scoped record consumed by `map`, `run-tests`, and `report`.

```json
{
  "slug": "checkout-payment-flow",
  "scoped_features": ["cart to checkout transition", "payment authorization", "order confirmation"],
  "app_access": {
    "ui_base_url": "http://localhost:3000",
    "api_base_url": "http://localhost:3000/api",
    "test_account": { "email": "qa@example.test", "password": "<from user>" },
    "seed_data": "seeded via `npm run seed:test`"
  },
  "reachability": { "ui": "200 OK", "api": "200 OK" }
}
```

## Test

LLM assertion: the record names ≥ 1 concrete feature, `app_access` has non-empty `ui_base_url` and `api_base_url`, and `reachability` shows both surfaces responded. A record with an unverified URL, an empty scope, or a "test the app"-style prompt accepted without a clarifying question fails.
