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
4. Collect and confirm **app access**: base URL, API base URL, and any seed data. If the scout could not launch the app or a URL does not respond, ask the user for the correct command / URL and re-verify before proceeding.
5. **Authentication.** If the scout reports the surface needs a logged-in state, ASK the user which method to use (do not guess — the wrong choice was a real defect). Offer exactly:
   - **`cookie`** — reuse the session cookie of the default browser (automatic). One-shot, read-only export of the user's running Chrome: `agent-browser --auto-connect state save <state_path>`. If Chrome is not discoverable, surface it as a blocker and offer another method — never fall back to driving the user's live browser.
   - **`credentials`** — login/password. Collect the login URL + test account, then `echo "<pass>" | agent-browser --session deep-test-auth auth save deep-test --url <login_url> --username <user> --password-stdin` → `agent-browser --session deep-test-auth auth login deep-test` → `agent-browser --session deep-test-auth state save <state_path>`.
   - **`magic_link`** — a pre-authenticated login URL (contains a token). `agent-browser --session deep-test-auth open "<magic_link_url>"`, wait for the post-login landing, then `agent-browser --session deep-test-auth state save <state_path>`. Magic links are often single-use — capture state immediately and reuse it; never re-open the link during the run.

   `<state_path>` is an absolute path under the session scratch dir (e.g. `<scratch>/deep-test-auth-state.json`). Whatever the method, produce the SAME shared state file **once**, then **verify** it: `agent-browser --session deep-test-auth-verify --state <state_path> open <ui_base_url>` + `snapshot` must show a logged-in marker. All setup runs in isolated `--session …` instances — never `--profile`, `--cdp`, or a bare `--auto-connect` beyond the single `cookie` export. If no auth is needed, set `auth.required: false`.
6. GATE: do not continue to `map` until (a) the feature scope is confirmed in writing AND (b) both the UI base URL and API base URL respond to a reachability probe AND (c) if auth is required, the verify step above reached a logged-in state. If any fails, stay here.
7. Emit the `scoped_features` + `app_access` record (including the `auth` block) and hand off to `map`.

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
    "seed_data": "seeded via `npm run seed:test`",
    "auth": {
      "required": true,
      "method": "cookie",
      "state_path": "/…/scratchpad/deep-test-auth-state.json",
      "login_url": null,
      "verified": "logged-in marker present in snapshot"
    }
  },
  "reachability": { "ui": "200 OK", "api": "200 OK" }
}
```

`auth.method` ∈ `cookie | credentials | magic_link | none`. When `required` is `true`, `state_path` MUST point at a file produced and verified in step 5; QA agents load it into their own isolated sessions and never authenticate themselves.

## Test

LLM assertion: the record names ≥ 1 concrete feature, `app_access` has non-empty `ui_base_url` and `api_base_url`, and `reachability` shows both surfaces responded. If the surface needs login, `auth.required` is `true`, `auth.method` is one the **user was asked to choose** (not guessed), and `auth.state_path` points at a state file whose verify probe reached a logged-in state. A record with an unverified URL, an empty scope, a "test the app"-style prompt accepted without a clarifying question, or an auth method chosen without asking the user, fails.
