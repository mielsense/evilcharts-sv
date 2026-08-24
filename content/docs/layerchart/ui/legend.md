---
title: Legend
description: Legends that identify each data series in a chart.
image: /og/legend.png
---

## Usage

```svelte
<EvilLineChart {data} config={chartConfig}>
	<EvilLineChart.XAxis dataKey="month" />
	<EvilLineChart.Legend variant="circle" />
	<EvilLineChart.Line dataKey="desktop" />
</EvilLineChart>
```

## Variants

Set the `variant` prop on the chart's `Legend` part. The API reference lists every available value.

### Square

<ComponentPreview title="variant='square'" name="ex-legend-square-line-chart" />

### Circle

<ComponentPreview title="variant='circle'" name="ex-legend-circle-line-chart" />

### Circle outline

<ComponentPreview title="variant='circle-outline'" name="ex-legend-circle-outline-line-chart" />

### Rounded square (default)

<ComponentPreview title="variant='rounded-square'" name="ex-legend-rounded-square-line-chart" />

### Rounded square outline

<ComponentPreview title="variant='rounded-square-outline'" name="ex-legend-rounded-square-outline-line-chart" />

### Vertical bar

<ComponentPreview title="variant='vertical-bar'" name="ex-legend-vertical-bar-line-chart" />

### Horizontal bar

<ComponentPreview title="variant='horizontal-bar'" name="ex-legend-horizontal-bar-line-chart" />

## API reference

<ApiTable>
	<ApiRow name="variant" type='"square" | "circle" | "circle-outline" | "rounded-square" | "rounded-square-outline" | "vertical-bar" | "horizontal-bar"' default='"rounded-square"'>

Style of the legend indicator icon.

</ApiRow>
	<ApiRow name="align" type='"left" | "center" | "right"' default='"right"'>

Horizontal alignment of the legend items.

</ApiRow>
	<ApiRow name="verticalAlign" type='"top" | "middle" | "bottom"' default='"top"'>

Places the legend above, within, or below the plot.

</ApiRow>
	<ApiRow name="isClickable" type="boolean" default="false">

Lets each legend item toggle its series selection.

</ApiRow>
</ApiTable>
