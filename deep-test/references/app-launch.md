# App launch & reachability (for `app-scout`)

How the `app-scout` agent detects, launches, and verifies the app under test so QA agents hit a live target. Non-interactive: the scout does the mechanical detection and returns findings; the main loop (action `01-intake`) owns any question to the user.

## Goal

Produce a verified `app_access` record: the UI base URL and the API base URL are both reachable, and the test account + seed data are known. QA agents must never guess a URL.

## Detection order

1. **Already running?** Probe the likely local ports before starting anything — a dev server is often already up.
   - `curl -sS -o /dev/null -w "%{http_code}" <url>` for candidate UI/API URLs.
   - Inspect listening ports: `lsof -iTCP -sTCP:LISTEN -P -n` (or `ss -ltnp` on Linux).
2. **How is it started?** Read the project manifest to learn the run command — do not assume.
   - Node: `package.json` scripts (`dev`, `start`, `serve`). PHP: `artisan serve`, `symfony server:start`, a `Makefile`, or `docker-compose.yml`. Python: `manage.py runserver`, `uvicorn`, a `Procfile`.
   - Prefer an existing `docker-compose up` when the repo ships one — it usually wires the DB + seed too.
3. **Config & ports.** Read `.env` / `.env.example` / framework config for the actual host, port, and API prefix. Report the resolved URLs, never hardcoded defaults, when the config disagrees.

## Launch

- Start the app **in the background** so it keeps running while QA proceeds (the harness backgrounds long-lived processes; do not block on a server that never exits).
- Capture the launch command, the process/log location, and the port actually bound.
- If the app needs a build or migrate/seed step first, surface that as a prerequisite rather than silently running destructive commands.

## Verify reachability (the gate)

Before declaring success, confirm **both** targets respond:

- UI: `curl -sS -o /dev/null -w "%{http_code}" <ui_base_url>` returns a 2xx/3xx.
- API: hit a known-cheap endpoint (health check, or a documented public route) and confirm a sane status + shape.
- If auth is required to reach anything, confirm the **test account** actually logs in (obtain a token/session) — an app you can't authenticate against is not reachable for QA.

## What to return

A structured record for the main loop:

- `app_access`: `{ ui_base_url, api_base_url, test_account, seed_data, launch_command, health: reachable|unreachable }`.
- `scope_proposal`: the feature slices the running app actually exposes (so intake can reconcile with the user's prompt).
- `blockers`: anything that stops reachability — missing creds, failing build, unknown port, empty seed — each with the evidence (command + output) and what the user must provide.

## Discipline

- Read-only on source. You may start processes, run health checks, and read config; you may not edit application code.
- Never run destructive data commands (drop/reset) without surfacing them as a blocker first.
- Report facts with evidence. "App reachable" must be backed by an actual HTTP status, not an assumption.
