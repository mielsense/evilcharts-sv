# Plan 003: Restore chart API and runtime parity

> **Executor instructions**: Implement with tests first where practical. Use current LayerChart docs
> for Axis and responsive Chart behavior. Make two commits if needed: install/API parity, then visual
> and animation parity. Update the plan index.
>
> **Drift check**: `rtk git diff --stat cc1ab81..HEAD -- src/lib/registry content/docs/layerchart scripts`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: Plan 001
- **Category**: bug, tests, dependencies
- **Planned at**: commit `cc1ab81`, 2026-08-24

## Why this matters

The monorepo passes tests while clean registry installs omit direct dependencies. Several documented
public prop names do not work, dense axes overlap, formatter indices are always zero, middle legends
render at an edge, polar intro animations are consumed during loading, and initial dimensions are
ignored. These are user-visible parity failures and release blockers.

## Current state and required changes

- Add direct registry dependencies: `d3-shape` to layerchart-chart, Svelte Motion to layerchart-brush,
  `d3-scale` to area and line, and `d3-shape` to radar. Replace the registry test that forbids them
  with an import-to-manifest dependency audit and a clean generated consumer build.
- Restore canonical props, accepting current names as deprecated aliases only if needed:
  `pieProps` (not only `arcProps`), `labelListProps` (not only `labelProps`), `radialBarProps`, and
  `sankeyProps`. Canonical props win if both are supplied.
- Cartesian X axes must use collision-aware thinning. Numeric Y axes must not map Recharts'
  `minTickGap=8` to LayerChart `tickSpacing=8`; use a sane LayerChart default/explicit tick strategy.
  Every formatter must receive the real domain index. Add narrow long-label tests.
- Implement `verticalAlign=\"middle\"` as a centered overlay for all supported chart families while
  top/bottom reserve layout space.
- Reset pie, radar, and radial intro progress on loading `true -> false`, honoring reduced motion.
- Preserve area/line/composed reveal progress across LayerChart's keyed measurement remount so intro
  progress is monotonic and plays once.
- Make ChartContainer `initialDimension` provide first-render/zero-size fallback to every root and
  yield to real non-zero measurement after resize.

## Scope

In scope: registry manifests/tests/generation, cartesian axes/root layout, legend renderers, pie,
radar, radial, area/line/composed reveal state, ChartContainer context/roots, related docs and tests.
Out of scope: dither styles, new chart families, redesigning existing APIs.

## Steps

1. Fix manifest dependencies and add a temporary clean-consumer compile test using generated items.
2. Restore special-chart public prop names with compile/runtime tests and update docs only where the
   docs currently contradict implementation.
3. Fix axis tick generation, formatter index propagation, and axis-space measurement. Compare the
   curve-type examples at 1280 and 480 widths against the original; labels must not overlap.
4. Implement middle legend placement and screenshot top/middle/bottom in wide/narrow layouts.
5. Add stateful loading harnesses and fix polar transitions. Add monotonic single-run sampling for
   area, line, and composed reveals.
6. Wire initialDimension through context and all roots; test SSR, zero-size, custom fallback, and
   resize recovery.
7. Run registry build, check, unit, relevant E2E, lint, and browser comparisons.

## Done criteria

- [ ] Generated clean installs resolve every direct import.
- [ ] Canonical documented props compile and change rendered output.
- [ ] No overlapping axis labels in reported curve examples; formatter indices are correct.
- [ ] Middle legends are centered, not coerced to top/bottom.
- [ ] Loading-to-loaded polar charts animate once; reduced motion skips animation.
- [ ] Area-family intro progress never resets.
- [ ] initialDimension affects first render and zero-size fallback.
- [ ] Full checks pass.

## STOP conditions

Stop if a parity behavior is impossible with LayerChart's public API without forking LayerChart, or
if a canonical prop cannot be supported without a breaking conflict. Record the exact limitation and
closest behavior instead of inventing an undocumented API.
