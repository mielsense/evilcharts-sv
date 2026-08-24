---
title: Tooltip
description: Interactive tooltips on chart data-point hover
image: /og/tooltip.png
---

## Usage

```svelte
<EvilBarChart {data} config={chartConfig}>
	<EvilBarChart.XAxis dataKey="month" />
	<EvilBarChart.Tooltip variant="frosted-glass" roundness="md" />
	<EvilBarChart.Bar dataKey="desktop" />
</EvilBarChart>
```

## Variants

Set the `variant` prop on the chart's `Tooltip` part to `"default"` or `"frosted-glass"`.

### Default

A solid background.

<ComponentPreview title="variant='default'" name="ex-tooltip-default-bar-chart" />

### Frosted glass

A semi-transparent background with a backdrop blur.

<ComponentPreview title="variant='frosted-glass'" name="ex-tooltip-frosted-glass-bar-chart" />

## API reference

<ApiTable>
	<ApiRow name="variant" type='"default" | "frosted-glass"' default='"default"'>

The tooltip's visual style.

</ApiRow>
	<ApiRow name="roundness" type='"sm" | "md" | "lg" | "xl"' default='"lg"'>

The tooltip's border-radius.

</ApiRow>
	<ApiRow name="defaultIndex" type="number">

Shows the tooltip by default at this data-point index.

</ApiRow>
</ApiTable>
