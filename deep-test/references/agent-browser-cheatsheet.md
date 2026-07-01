# agent-browser cheatsheet (for `qa-ui`)

How the `qa-ui` agent drives a real browser to run end-to-end checks. `agent-browser` is a local Rust CLI that controls Chrome over the DevTools protocol and returns the **accessibility tree** (not screenshots) with stable element refs (`@e1`, `@e2`, …) — ~82% fewer tokens than pixel tools.

Install (once): `npm i -g agent-browser && agent-browser install`.

## Core loop

1. **Navigate** to a page under the verified `ui_base_url`.
2. **Snapshot** to get the accessibility tree + element refs.
3. **Act** on a ref (click, type, select).
4. **Snapshot again** to observe the result — the ref set changes after navigation/DOM updates, so never reuse refs across a snapshot.

## Commands

| goal                   | command                                                      |
| ---------------------- | ----------------------------------------------------------- |
| open a URL             | `agent-browser navigate "<url>"`                            |
| get AX tree + refs     | `agent-browser snapshot`                                    |
| click an element       | `agent-browser click <ref>`                                 |
| type into a field      | `agent-browser type <ref> "<text>"`                        |
| select an option       | `agent-browser select <ref> "<value>"`                     |
| press a key            | `agent-browser press "<key>"` (e.g. `Enter`)               |
| read console errors    | `agent-browser console`                                     |
| read network failures  | `agent-browser network`                                     |
| wait for state         | `agent-browser wait "<text-or-selector>"`                  |

> Confirm exact flags with `agent-browser --help` and `agent-browser <cmd> --help` at run start — treat this table as the shape, not the contract.

## Evidence to capture per problem

- The **step sequence** (navigate → click @e4 → type @e7 …) so it reproduces deterministically.
- The **snapshot excerpt** showing the wrong state (missing element, wrong text, error banner).
- The **console** and **network** output when the failure involves a JS error or a failed request — this is what distinguishes a UI `bug` from an underlying `error`.

## Stability rule

Re-run any failing flow 2–3× from a clean navigation. A failure that reproduces every time is a `bug`/`error`; one that appears intermittently is `instability` (stability axis down) — record how many of N attempts failed as evidence.

## Discipline

- Authenticate with the provided test account; never register throwaway data outside the seed set.
- Test against the verified `ui_base_url` only. If a page 404s or the app is down mid-run, that is an `instability` finding with evidence, not an assumption.
- Observe, don't fix. No source edits — root cause is a later stage.
