# Plan 005: Add dither rendering variants to existing charts

> **Executor instructions**: This is an independent Svelte/LayerChart implementation inspired by
> dither-kit, not a copy of its React chart system. Keep one EvilCharts API, registry, docs tree, and
> package. Commit implementation and docs/licensing as separate logical commits if useful.
>
> **Drift check**: `rtk git diff --stat cc1ab81..HEAD -- .gitignore README.md LICENSE src/lib/registry content/docs`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: Plans 002, 003, 004
- **Category**: direction, feature, docs, tests
- **Planned at**: commit `cc1ab81`, 2026-08-24

## Why this matters

The user wants dither-kit’s ordered-dither chart language available inside EvilCharts SV, without a
second library or documentation hierarchy. The feature must preserve EvilCharts data, tooltip,
legend, selection, brush, loading, responsiveness, accessibility, and motion behavior.

## Design

- Add a shared renderer under `src/lib/registry/ui/layerchart-dither/` and register it as an internal
  dependency of existing chart items.
- Support the families dither-kit actually covers: area and line, bar, pie/donut, radar, and composed
  charts using area/line/bar marks. Do not add radial or Sankey dither modes.
- Expose dither as an orthogonal rendering option such as `renderStyle=\"dither\"` plus focused
  options (`ditherVariant`, `bloom`) so existing `variant` meanings remain compatible.
- Use a bounded 4x4 Bayer texture at an effective 2px cell size. Reuse ChartConfig CSS colors. Keep
  SVG marks as transparent interaction/accessibility targets if canvas is used.
- Invalidate rendering on data, size, selection, hover, theme, and animation changes. RAF may run
  only while an entrance/hover transition is active. Stop when idle, hidden, offscreen, destroyed,
  or reduced motion is requested.
- Preserve current family-specific intros, bar stacking/grouping, pie hover pop, radar vertex focus,
  selection dimming, and both themes.
- Add a dither example and API rows inside each existing supported chart page. No new docs section.

## Attribution and source boundary

- Add `/dither-kit` to `.gitignore`.
- Credit [Dither Kit](https://github.com/Boring-Software-Inc/dither-kit) by Boring Software in README,
  the relevant docs examples, and the root license/third-party notice. State that the upstream
  project declares MIT licensing in package metadata.
- Do not copy its CLI, generated registry, React roots/contexts/scales, UI controls, avatar, button,
  gradient, or pixel utility. Do not claim affiliation.

## Steps

1. Write pure tests for Bayer thresholding, backing-size bounds, invalidation, and reduced-motion
   state. Implement the shared paint helpers independently in TypeScript.
2. Add the responsive Svelte renderer with ResizeObserver cleanup, theme/color resolution, hidden
   pausing, and event-driven animation scheduling.
3. Integrate supported marks one family at a time, keeping existing interaction marks authoritative.
   Add unit/E2E coverage after each family.
4. Add existing-page examples and API docs with clear Dither Kit inspiration credit. Update registry
   dependencies and regenerate artifacts.
5. Add root README/LICENSE attribution and ignore the local reference checkout.
6. Compare light/dark at 1280 and 480, then hover, select, resize, loading, replay, and reduced-motion.
   Record no idle RAF activity after the chart settles.

## Done criteria

- [ ] Dither styles work in area, line, bar, pie/donut, radar, and composed charts.
- [ ] Existing tooltip, legend, selection, brush, loading, and accessible SVG semantics still work.
- [ ] No idle animation loop, resize leak, or console warning.
- [ ] Both themes and reduced motion are correct at wide and narrow sizes.
- [ ] Existing docs pages show installable dither examples and credit the original project.
- [ ] `dither-kit/` is ignored and absent from git status.
- [ ] Registry build, check, lint, unit, build, and E2E pass.

## STOP conditions

Stop if preserving existing interaction semantics requires a second chart root or if the intended
implementation would copy substantial upstream source without an authoritative license notice.
Prefer a smaller independent ordered-dither renderer over API duplication.
