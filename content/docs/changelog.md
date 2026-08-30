---
title: Changelog
description: Changes to EvilCharts for Svelte, its registry, and its documentation.
---

This page records changes to the Svelte port, its registry, and its documentation.

## 2026-08-30

- Added Apache ECharts as a complete second rendering provider for all eight chart families, with
  Canvas rendering by default and optional SVG output.
- Added provider-specific ECharts tooltips, legends, dots, brushes, loading states, examples,
  dashboard blocks, registry items, documentation, and agent-readable pages.
- Added ordered-dither treatments for the ECharts area, line, bar, composed, pie, and radar charts,
  preserving the Dither Kit attribution and licence boundary.
- Added a provider switcher so readers can move between matching LayerChart and ECharts pages.
- Fixed production renderer registration so Canvas and SVG charts still initialize after
  tree-shaking.
- Aligned ECharts legends, area-brush gradients, and radial chart clearance with the original
  provider layouts.
- Kept the LayerChart area loading curve fixed while one shared shimmer mask animates its
  Line-style top stroke and the gradient fill beneath it as a single unit.
- Synchronized Area loading with Line loading so its data changes only after the shimmer has left
  the plot, keeping both the top stroke and gradient fill continuous.

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
