# agent-browser cheatsheet (for `qa-ui`)

How the `qa-ui` agent drives a real browser to run end-to-end checks. `agent-browser` is a local Rust CLI that controls Chrome over the DevTools protocol and returns the **accessibility tree** (not screenshots) with stable element refs (`@e1`, `@e2`, …) — ~82% fewer tokens than pixel tools.

Install (once): `npm i -g agent-browser && agent-browser install`.

## Isolation (hard rule)

The QA run drives a **dedicated, isolated, headless** browser instance — never the user's live browser. This is not optional: attaching to the user's Chrome pollutes their session, leaks their identity into the test, and is a defect (it is the exact failure this skill exists to prevent).

- **Always** pass `--session deep-test-<feature-slug>` so each parallel agent gets its own isolated browser context and they never collide on a shared tab.
- **Never** pass any of these — each attaches to or reuses the user's real Chrome:
  - `--profile <name|path>` (e.g. `--profile Default`) — reuses a real Chrome profile's login state.
  - `--cdp <port>` or `connect <port>` pointed at the user's running Chrome.
  - a bare `--auto-connect` used to *drive* the browser — it connects to the running Chrome.
- Default is headless. Only `--headed` shows a window; agents never add it (a human debugging by hand might).
- The single sanctioned touch of the user's Chrome is the one-shot, read-only state export in the `cookie` method (`--auto-connect state save <path>`), performed **once at intake** — never during the test run.

## Core loop

1. **Open** the target page under the verified `ui_base_url` with `agent-browser --session deep-test-<slug> open`, seeded with the auth state (see *Authentication*).
2. **Snapshot** to get the accessibility tree + element refs.
3. **Act** on a ref (click, type, select).
4. **Snapshot again** to observe the result — the ref set changes after navigation/DOM updates, so never reuse refs across a snapshot.

## Commands

| goal                   | command                                                      |
| ---------------------- | ----------------------------------------------------------- |
| open a URL             | `agent-browser open "<url>"` (`navigate`/`goto` are aliases)|
| get AX tree + refs     | `agent-browser snapshot`                                    |
| click an element       | `agent-browser click <ref>`                                 |
| type into a field      | `agent-browser type <ref> "<text>"`                        |
| select an option       | `agent-browser select <ref> "<value>"`                     |
| press a key            | `agent-browser press "<key>"` (e.g. `Enter`)               |
| read console errors    | `agent-browser console`                                     |
| read network failures  | `agent-browser network`                                     |
| wait for state         | `agent-browser wait "<text-or-selector>"`                  |

> Confirm exact flags with `agent-browser --help` and `agent-browser <cmd> --help` at run start — treat this table as the shape, not the contract.

## Authentication

The auth method is chosen **once at intake** and handed to you as `app_access.auth`. You do NOT pick the method or handle raw secrets — intake already produced a saved auth-state file. Your only job is to load it into your isolated session:

```
agent-browser --session deep-test-<slug> --state <app_access.auth.state_path> open <ui_base_url>
agent-browser --session deep-test-<slug> snapshot   # confirm a logged-in marker before testing gated features
```

- If `app_access.auth.required` is `false` (or there is no `state_path`), skip auth and test as an anonymous user.
- **Never** re-run a login or re-open a magic link yourself — the saved state is the single source of truth, and magic links are often single-use. Loading `state_path` is the only auth step you perform.

How intake built `state_path`, per the user-chosen method (context only — you never run these):

| `app_access.auth.method` | how intake produced the state file                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `cookie`                 | `agent-browser --auto-connect state save <state_path>` — one-shot read-only export of the user's running Chrome; isolated thereafter. |
| `credentials`            | `echo "<pass>" \| agent-browser --session <s> auth save deep-test --url <login_url> --username <user> --password-stdin` → `auth login deep-test` → `state save <state_path>`. |
| `magic_link`             | `agent-browser --session <s> open "<pre-authenticated-url>"` → `state save <state_path>`.                                             |

## Evidence to capture per problem

- The **step sequence** (navigate → click @e4 → type @e7 …) so it reproduces deterministically.
- The **snapshot excerpt** showing the wrong state (missing element, wrong text, error banner).
- The **console** and **network** output when the failure involves a JS error or a failed request — this is what distinguishes a UI `bug` from an underlying `error`.

## Stability rule

Re-run any failing flow 2–3× from a clean navigation. A failure that reproduces every time is a `bug`/`error`; one that appears intermittently is `instability` (stability axis down) — record how many of N attempts failed as evidence.

## Discipline

- Start from the auth state at `app_access.auth.state_path` (see *Authentication*); never register throwaway accounts or data outside the seed set.
- Drive an isolated `--session deep-test-<slug>` instance only — never `--profile`, `--cdp`, or a bare `--auto-connect` (see *Isolation*).
- Test against the verified `ui_base_url` only. If a page 404s or the app is down mid-run, that is an `instability` finding with evidence, not an assumption.
- Observe, don't fix. No source edits — root cause is a later stage.
