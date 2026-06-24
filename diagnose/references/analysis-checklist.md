# Analysis checklist

What `investigate` (the `investigator` subagent) must inspect before a report is written. Read this in full before tracing. The goal is not just to find the bug — it is to map everything the bug, *and any fix to it*, can disturb.

## Ground rules

- **Evidence or it didn't happen.** Every finding cites `path/to/file.ext:line`. A claim without a reference is a guess, not a finding.
- **Read, don't run blind.** This is read-only analysis. Trace call paths, data flow, and contracts. Do not edit code or run mutating commands.
- **State the negative.** If a dimension is clean, write "none found" with what you checked — not silence. A blank dimension reads as "not analyzed".
- **Proximate vs. underlying.** Separate the immediate trigger from the root mechanism. Fixing only the proximate cause often leaves the underlying one.
- **Resolve, don't guess.** Map callers and blast radius with the knowledge graph (`graphify affected`/`query`/`path`, when `graphify-out/graph.json` exists) and LSP (`findReferences`, `incomingCalls`, `goToDefinition` for TS/JS + PHP) before falling back to text search. The full tool ladder lives in the `investigator` agent's *Tooling* section.

## The four impact dimensions

### 1. Side effects

Reachable mutations and emissions from the affected code.

- Shared/global state, singletons, module-level mutable values.
- Caches (in-memory, HTTP, query, CDN) the change reads or invalidates.
- Emitted events, queue messages, webhooks, logs other systems consume.
- I/O and external calls (DB writes, network, filesystem) on the path.

### 2. Regressions

What a fix could break.

- Direct callers and transitive dependents of the code you'd change (`graphify affected`, LSP `findReferences` / `incomingCalls` — not text search alone).
- Existing tests covering the path — and gaps where none exist.
- Public contracts: exported signatures, API responses, serialized formats, DB schema.
- Behavior other features rely on implicitly (ordering, default values, timing).

### 3. Undesirable behaviors

What the problem exposes beyond the headline symptom.

- Edge cases: empty/null, boundary values, large inputs, unusual locales/timezones.
- Error paths: swallowed exceptions, missing handling, partial failure / non-atomic writes.
- Concurrency & ordering: races, re-entrancy, retries, idempotency.
- Silent failures: wrong-but-no-error results, data corruption, drift.

### 4. Inconsistencies

Where sources of truth disagree.

- Contract mismatches between modules (caller expects X, callee returns Y).
- Divergent data shapes across boundaries — classic: API vs UI, backend vs client model.
- Duplicated logic that drifted (two validators, two formatters, two rounding rules).
- Config/env divergence (dev vs prod, flag on vs off).

## Output expected from the investigator

A structured findings object the `report` action can drop into `assets/report-template.md`:

- `root_cause`: proximate + underlying, each with `file:line`.
- `side_effects` / `regressions` / `undesirable_behaviors` / `inconsistencies`: lists of `{ finding, evidence: "file:line", severity }`, or an explicit "none found".
- `reproduction`: steps or "static only".
- `solution_seeds`: candidate fix directions with rough blast radius (the `report` action ranks them into options).
