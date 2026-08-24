---
title: Chart Config
description: Define labels, colors, and icons for each data series
image: /og/chart-config.png
---

Every EvilCharts component uses a chart config object. It maps each data key to its label, theme colors, and optional icon for tooltips and legends.

## Structure

```svelte
<script lang="ts">
	import Monitor from '@lucide/svelte/icons/monitor';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import type { ChartConfig } from '$lib/components/evilcharts/ui/layerchart-chart/index.js';

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			icon: Monitor,
			colors: {
				light: ['#047857'],
				dark: ['#10b981']
			}
		},
		mobile: {
			label: 'Mobile',
			icon: Smartphone,
			colors: {
				light: ['#be123c'],
				dark: ['#f43f5e']
			}
		}
	} satisfies ChartConfig;
</script>
```

Each key (e.g. `desktop`, `mobile`) must match a data key in your dataset. Its type:

```ts
type ChartConfig = Record<
	string,
	{
		label?: string | Snippet;
		icon?: Component;
		colors?: {
			light?: string[];
			dark?: string[];
		};
	}
>;
```

## Properties

### label

The name shown in tooltips and legends. A string or any `Snippet`.

```ts
const chartConfig = {
	desktop: {
		label: 'Desktop Users' // [!code highlight]
		// ...
	}
} satisfies ChartConfig;
```

### colors

Theme-aware color arrays. Provide at least one theme key (`light` or `dark`); each holds an array of CSS color strings.

One color per theme creates a solid fill:

```ts
colors: {
  light: ["#047857"],
  dark: ["#10b981"],
}
```

Multiple colors create gradient fills across bars, areas, and other elements. The chart distributes them evenly across the series:

```ts
colors: {
  light: ["#a855f7", "#6366f1", "#3b82f6"],
  dark: ["#f43f5e", "#ec4899", "#a855f7", "#6366f1", "#3b82f6"],
}
```

Themes can define different color counts. The chart uses the largest count across all themes.

### icon

An optional Svelte component that replaces the default color indicator in the tooltip and legend. Use icons when color alone is not enough to distinguish each series.

```svelte
<script lang="ts">
	import Monitor from '@lucide/svelte/icons/monitor';
	import Smartphone from '@lucide/svelte/icons/smartphone';

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			icon: Monitor, // [!code highlight] [!code word:Monitor]
			colors: { light: ['#047857'], dark: ['#10b981'] }
		},
		mobile: {
			label: 'Mobile',
			icon: Smartphone, // [!code highlight] [!code word:Smartphone]
			colors: { light: ['#be123c'], dark: ['#f43f5e'] }
		}
	} satisfies ChartConfig;
</script>
```

The `icon` renders in place of the color dot/square in tooltips and the color indicator in legends. It's styled with `text-muted-foreground` and sized `h-2.5 w-2.5` in tooltips, `h-3 w-3` in legends.

## How colors work

The chart config generates CSS custom properties scoped to each chart instance. A key `desktop` with colors `["#a855f7", "#6366f1"]` produces:

```css
--color-desktop-0: #a855f7;
--color-desktop-1: #6366f1;
```

Chart components, tooltips, and legends read these variables for consistent theming. Switching between light and dark mode swaps in the correct set automatically.

### Color distribution

When you provide fewer colors than segments need, they're **evenly distributed** across slots:

- 2 colors for 4 slots: `[red, red, pink, pink]`
- 3 colors for 4 slots: `[red, pink, blue, blue]`

So 2-3 gradient stops smoothly span any number of data points.

## Runtime validation

The config is validated at runtime. An empty `colors` object, or one without a valid theme key, throws a clear error:

```plaintext
[EvilCharts] Invalid chart config for "desktop": colors object must
have at least one theme key (light, dark). Received empty object or
invalid keys.
```

## Examples

### Default (labels and colors)

Labels and theme-aware colors. The label shows in the tooltip and legend; the colors control the fill.

<ComponentPreview title="Basic chart config" name="ex-chart-config-default-bar-chart" />

### With icons

Pass an `icon` component per entry to replace the default color indicator in the tooltip and legend.

<ComponentPreview title="Chart config with icons" name="ex-chart-config-icons-bar-chart" />

### Gradient colors

Pass multiple colors per theme for gradient fills. Each array value is a stop distributed across the chart elements.

<ComponentPreview title="Gradient colors" name="ex-gradient-colors-bar-chart" />

## API reference

<ApiTable>
  <ApiRow name="label" type="Snippet">

Name for the data series, shown in tooltips and legends.

</ApiRow>
  <ApiRow name="colors" type="&#123; light?: string[]; dark?: string[] &#125;">

Theme-aware colors. Include at least one theme key (`light` or `dark`), each mapping to an array of CSS color strings. One color is a solid fill; multiple create a gradient.

</ApiRow>
  <ApiRow name="icon" type="Component">

Optional Svelte component rendered in place of the default color indicator in tooltips and legends.

</ApiRow>
</ApiTable>
