# Plan 004: Remove Svelte runtime and accessibility defects

> **Executor instructions**: Follow svelte-edge and current humanspeak/svelte-motion guidance. Do
> not hide warnings. Add browser regressions, commit logically, and update the index.
>
> **Drift check**: `rtk git diff --stat cc1ab81..HEAD -- src package.json playwright.config.ts`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plan 003
- **Category**: bug, accessibility, tech-debt, tests
- **Planned at**: commit `cc1ab81`, 2026-08-24

## Why this matters

The browser has emitted repeated Svelte `derived_inert` warnings during motion-heavy route changes
and one ResizeObserver-loop error. Reduced-motion support is incomplete, interrupted brush drags can
remain stuck, production MDX compilation emits accessibility warnings, and legacy declaration syntax
remains in rune-mode components. Static `svelte-check` alone does not catch these defects.

## Current state

- A fresh development load of `/`, observed for 14 seconds, emits exactly 48 `derived_inert`
  warnings after the first 4.6-second focus hop. The expanded stack is Svelte `get` ->
  svelte-motion `runAnimation` -> deferred `runEnterAnimation`. All 22 cards are `<motion.div>` at
  `src/site/components/landing/chart-stage.svelte:184-223`, receiving new reactive `animate` and
  `transition` objects on each focus change. Replace those wrappers with native divs and CSS
  opacity/transform transitions while retaining the existing imperative camera `animate()`.
- `use-brush-drag.svelte.ts` lacks pointercancel/lostpointercapture cleanup.
- Only 8 of 28 motion-importing Svelte files use `useReducedMotion`; indefinite shimmer/pulse/spin
  effects must stop under reduce.
- MDX Shiki output carries focusable pre elements and invalid figcaption placement (Plan 001 may
  already fix these; add coverage here if absent).
- 18 `{@const}` declarations remain across 10 rune-mode files. Convert to current declaration syntax
  or script derivations without changing behavior.
- `package.json` installs Playwright browsers on every E2E run; separate provisioning from the test
  command.

## Scope

In scope: all first-party Svelte motion call sites, loading/reveal components, brush lifecycle,
legacy declaration sites, test scripts/config, runtime console tests. Out of scope: modifying
node_modules or suppressing Svelte warnings globally.

## Steps

1. Add a development-server Playwright console collector that registers `console.warn`,
   `console.error`, `pageerror`, and window `error` before navigation, then waits longer than one
   `FOCUS_INTERVAL_MS`. The production Playwright build strips this dev warning, so this regression
   requires a dev-server configuration. Extend it to docs route navigation, viewport resize, and
   chart preview unmount. Reproduce 48 `derived_inert` warnings before fixing.
2. Isolate the lifecycle source. Move animation ownership above keyed/unmounted children or replace
   affected declarative motion tags with imperative `animate()` and native SVG/HTML elements. Stop
   every animation in effect cleanup. Do not patch node_modules.
3. Use `useReducedMotion` consistently. Under reduce, render final static geometry and disable
   indefinite shimmer, pulse, spin, dash, and decorative stage motion while keeping interactions.
4. Handle pointercancel and lostpointercapture through the same brush teardown as pointerup. Test
   cancel, lost capture, and a subsequent successful drag.
5. Replace legacy declaration tags and remove dead imports/comments uncovered in touched files.
6. Change E2E script to run tests only; document a separate browser-install command.
7. Run check, lint, unit, all E2E, build, and the runtime collector twice to catch teardown leaks.

## Done criteria

- [ ] Zero console errors and warnings in the runtime matrix.
- [ ] Reduced-motion matrix has no ongoing decorative animations.
- [ ] Brush always exits dragging after up, cancel, or lost capture.
- [ ] Production build emits no Svelte accessibility warnings.
- [ ] No first-party `{@const}` remains.
- [ ] Check, lint, unit, build, and 470+ E2E tests pass.

## STOP conditions

Stop if the warning is proven to originate inside an unavoidable current svelte-motion release and
cannot be avoided by first-party lifecycle changes. Report a minimal reproduction and upstream issue
path; do not disable dev warnings or pin Svelte backward without approval.
