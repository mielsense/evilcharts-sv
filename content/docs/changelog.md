---
title: Changelog
description: Changes to EvilCharts for Svelte, its registry, and its documentation.
---

This page records changes to the Svelte port, its registry, and its documentation.

## Unreleased

### Fixed

- Loading states now match the original chart geometry, including cartesian category spacing,
  Area chart domain headroom, Radial chart ring placement, and Pie chart legend clearance.
- Tooltips now escape cards with `overflow: hidden` while keeping chart-scoped series colors.
