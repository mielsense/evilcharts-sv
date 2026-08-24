---
title: Background
description: Style chart backgrounds with built-in and custom patterns.
image: /og/backgrounds.png
---

## Usage

```svelte
<EvilLineChart xDataKey="month" {data} {chartConfig} backgroundVariant="dots" />
```

## Variants

### Dots

<ComponentPreview title="backgroundVariant='dots'" name="ex-bg-dots-line-chart" />

### Grid

<ComponentPreview title="backgroundVariant='grid'" name="ex-bg-grid-line-chart" />

### Cross Hatch

<ComponentPreview title="backgroundVariant='cross-hatch'" name="ex-bg-cross-hatch-line-chart" />

### Diagonal Lines

<ComponentPreview title="backgroundVariant='diagonal-lines'" name="ex-bg-diagonal-lines-line-chart" />

### Plus

<ComponentPreview title="backgroundVariant='plus'" name="ex-bg-plus-line-chart" />

### Falling Triangles

<ComponentPreview title="backgroundVariant='falling-triangles'" name="ex-bg-falling-triangles-line-chart" />

### 4-Pointed Star

<ComponentPreview title="backgroundVariant='4-pointed-star'" name="ex-bg-4-pointed-star-line-chart" />

### Tiny Checkers

<ComponentPreview title="backgroundVariant='tiny-checkers'" name="ex-bg-tiny-checkers-line-chart" />

### Overlapping Circles

<ComponentPreview title="backgroundVariant='overlapping-circles'" name="ex-bg-overlapping-circles-line-chart" />

### Wiggle Lines

<ComponentPreview title="backgroundVariant='wiggle-lines'" name="ex-bg-wiggle-lines-line-chart" />

### Bubbles

<ComponentPreview title="backgroundVariant='bubbles'" name="ex-bg-bubbles-line-chart" />

## Custom Variant

Add your own style: define an SVG `<pattern>` and register it as a variant.

1. Add the new name to the `BackgroundVariant` union in `src/lib/registry/ui/layerchart-background/types.ts`.
2. Create a pattern component that returns a `<pattern>` with your SVG shapes.
3. Register the pattern component in `PATTERN_MAP`.

Example custom pattern:

```ts title="src/lib/registry/ui/layerchart-background/types.ts"
export type BackgroundVariant =
	| 'dots'
	| 'grid'
	| 'cross-hatch'
	| 'diagonal-lines'
	| 'plus'
	| 'falling-triangles'
	| '4-pointed-star'
	| 'tiny-checkers'
	| 'overlapping-circles'
	| 'wiggle-lines'
	| 'bubbles'
	| 'custom-pattern';
```

```svelte title="src/lib/registry/ui/layerchart-background/patterns/custom-pattern.svelte"
<script lang="ts">
	let { id }: { id: string } = $props();
</script>

<pattern {id} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
	<path
		class="text-border dark:text-border"
		d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z"
		fill="currentColor"
		fill-opacity="0.35"
	/>
</pattern>
```

```ts title="src/lib/registry/ui/layerchart-background/pattern-map.ts"
import type { Component } from 'svelte';
import Bubbles from './patterns/bubbles.svelte';
import CrossHatch from './patterns/cross-hatch.svelte';
import DiagonalLines from './patterns/diagonal-lines.svelte';
import DotsPattern from './patterns/dots.svelte';
import FallingTriangles from './patterns/falling-triangles.svelte';
import FourPointedStar from './patterns/four-pointed-star.svelte';
import GridPattern from './patterns/grid.svelte';
import OverlappingCircles from './patterns/overlapping-circles.svelte';
import Plus from './patterns/plus.svelte';
import TinyCheckers from './patterns/tiny-checkers.svelte';
import WiggleLines from './patterns/wiggle-lines.svelte';
import CustomPattern from './patterns/custom-pattern.svelte';
import type { BackgroundVariant, PatternProps } from './types.js';

export const PATTERN_MAP: Record<BackgroundVariant, Component<PatternProps>> = {
	dots: DotsPattern,
	grid: GridPattern,
	plus: Plus,
	bubbles: Bubbles,
	'cross-hatch': CrossHatch,
	'diagonal-lines': DiagonalLines,
	'falling-triangles': FallingTriangles,
	'4-pointed-star': FourPointedStar,
	'tiny-checkers': TinyCheckers,
	'overlapping-circles': OverlappingCircles,
	'wiggle-lines': WiggleLines,
	'custom-pattern': CustomPattern
};
```

Then use it in any chart:

```svelte
<EvilLineChart xDataKey="month" {data} {chartConfig} backgroundVariant="custom-pattern" />
```

<Alert>
  <AlertContent>

Tip: Use your logo as a pattern. Swap the SVG shape for an `<image>` pointing to your logo, then control its size and transparency: `<image href="/logo.svg" width="24" height="24" opacity="0.2" />`.

</AlertContent>
</Alert>
