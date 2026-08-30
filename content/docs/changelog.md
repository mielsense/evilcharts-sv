---
title: Changelog
description: Changes to the installable EvilCharts for Svelte library and source registry.
---

This page records changes to the installable Svelte port, its source registry, and its agent skill.
Docs-only, test-only, CI, and contributor-workflow changes are recorded in their pull requests.

## 2026-08-30

- Preserved null and non-finite data as real gaps across ECharts Area, Line, and Composed charts,
  including their brushes, reveal layers, buffer lines, hit targets, and tooltips.
- Gave both Sankey providers the same guarded data contract and expanded ECharts keyboard and
  controlled-selection coverage across chart families.
- Unified registry source rewriting and consumer dependency versions across generated installs.
- Added the installable `evilcharts-svelte` agent skill, with skills.sh-compatible and HTTP discovery, a
  complete chart and compound-component catalog, implementation workflows, example and block
  guidance, plus links to the Markdown docs, Context7 library, and MCP endpoint.
- Added controlled selection to LayerChart Area and Pie roots without remounting chart state, and
  made ECharts resolve chart-local color changes after mount.
- Hardened LayerChart Sankey layout for invalid endpoints, cycles, zero-flow graphs, and numeric
  edge cases while preserving valid Recharts-compatible geometry.
- Added Apache ECharts as a complete second rendering provider for all eight chart families, with
  Canvas rendering by default and optional SVG output.
- Added provider-specific ECharts tooltips, legends, dots, brushes, loading states, examples,
  dashboard blocks, registry items, documentation, and agent-readable pages.
- Added ordered-dither treatments for the ECharts area, line, bar, composed, pie, and radar charts,
  preserving the Dither Kit attribution and licence boundary.
- Added a provider switcher so readers can move between matching LayerChart and ECharts pages.
- Fixed production renderer registration so Canvas and SVG charts still initialize after
  tree-shaking.
- Aligned ECharts legends, brushes, basic Area geometry, loading states, and radial chart clearance
  with the original provider layouts.
- Kept Area loading geometry fixed while its Line-style top stroke and translucent fill use the same
  travelling shimmer mask; loading data changes only after that mask leaves the plot.
- Matched the data and chart configuration of all 113 upstream LayerChart examples and mirrored
  the same examples in the ECharts provider, apart from the six documented dither additions.
- Preserved chart-owned animation lifecycles when consumer ECharts options are merged and made
  loading, dashed-stroke, hover, and landing motion respect reduced-motion preferences.
- Made LayerChart Cartesian entrances use one uninterrupted chart-owned timeline, preventing
  scale remounts from shortening or restarting reveals, and matched Area and Line wipe speed to
  the ECharts provider.
- Added keyboard controls for clickable series and ECharts brush ranges without duplicating an
  existing clickable legend.
- Aligned shared theme tokens and legend spacing with the original, and made generated chart CSS
  safe for arbitrary chart IDs and data keys.

## 2026-08-27

- Loading states now match the original chart geometry, including cartesian category spacing,
  Area chart domain headroom, Radial chart ring placement, and Pie chart legend clearance.
- Area loading curves now remain static while the shimmer crosses the plot, matching the original.
- Area loading now renders its moving top stroke with the same masked spline as Line loading,
  while the shimmer continues through the gradient fill beneath it.
- Radial loading bars now tween between values with the original 1.5-second ease-in-out motion.
- Radial plots now reserve the full edge-legend band so outer rings cannot overlap the legend.

## 2026-08-25

- Tooltips now escape cards with `overflow: hidden` while keeping chart-scoped series colors.
