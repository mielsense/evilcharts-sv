---
title: Composed Chart
description: Static, beautifully designed composed charts combining bars and lines
image: /og/composed-chart.png
links:
  github: https://github.com/legions-developer/evilcharts-svelte/tree/main/src/lib/registry/charts/layerchart-composed-chart
  doc: https://www.layerchart.com/docs/components/Chart
  api: https://www.layerchart.com/docs/components/Chart
---

<ComponentPreview title="Basic Chart" name="ex-composed-chart"  />

## Installation

<CodeTabs>
  <TabsList variant="underline">
    <TabsTab value="cli">CLI</TabsTab>
    <TabsTab value="manual">Manual</TabsTab>
  </TabsList>
  <TabsPanel value="cli">
    <CliBlock commands={["@evilcharts/layerchart-composed-chart"]} />
  </TabsPanel>
  <TabsPanel value="manual">
    <Steps>
      <Step>
        <StepTitle>Install the following dependencies:</StepTitle>
        <StepContent>
          <CommandBlock commands={["layerchart", "@humanspeak/svelte-motion"]} />
        </StepContent>
      </Step>
      <Step>
        <StepTitle>Copy and paste the following code snippets into your project.</StepTitle>
         <StepDescription>

Create an `evilcharts` folder with a `charts` subfolder inside `components`, then paste the base layerchart-composed-chart code into a new file there.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-composed-chart"
            title="$lib/components/evilcharts/charts/layerchart-composed-chart"
          />
        </StepContent>
      </Step>
       <Step>
        <StepTitle>Add the chart component.</StepTitle>
        <StepDescription>

The chart needs these components to render. Create a `ui` folder inside `evilcharts` and paste the code there.

Below is the main chart component.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-chart"
            title="$lib/components/evilcharts/ui/layerchart-chart"
          />
        </StepContent>
      </Step>
       <Step>
        <StepTitle>Add the sub-components.</StepTitle>
        <StepDescription>

Create `tooltip.tsx` inside `evilcharts/ui` and paste the code there.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-tooltip"
            title="$lib/components/evilcharts/ui/layerchart-tooltip"
          />
        </StepContent>
        <StepDescription>

Then create `legend.tsx` in the same folder and paste the code there.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-legend"
            title="$lib/components/evilcharts/ui/layerchart-legend"
          />
        </StepContent>
        <StepDescription>

Finally, create `dot.tsx` in the same folder and paste the code there.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-dot"
            title="$lib/components/evilcharts/ui/layerchart-dot"
          />
        </StepContent>
      </Step>
    </Steps>
  </TabsPanel>
</CodeTabs>

## Usage

`<EvilComposedChart>` is the container; compose the parts you need — `<EvilComposedChart.Grid>`, `<EvilComposedChart.XAxis>`, `<EvilComposedChart.YAxis>`, `<EvilComposedChart.Legend>`, `<EvilComposedChart.Tooltip>`, and one or more `<EvilComposedChart.Bar>` and `<EvilComposedChart.Line>` — as children. Each `<Bar>` carries its own `variant`, `glow`, and `isClickable`; each `<Line>` its own `strokeVariant`, `curveType`, `glow`, and `isClickable`, so one chart can mix bar and line styles freely.

```svelte
<script lang="ts">
	import { EvilComposedChart } from '$lib/components/evilcharts/charts/layerchart-composed-chart';
	import { type ChartConfig } from '$lib/components/evilcharts/ui/layerchart-chart';
</script>
```

```svelte
<script lang="ts">
	const chartConfig = {
		revenue: {
			label: 'Revenue',
			colors: { light: ['#3b82f6'], dark: ['#6A5ACD'] }
		},
		profit: {
			label: 'Profit',
			colors: { light: ['#10b981'], dark: ['#34d399'] }
		}
	} satisfies ChartConfig;
</script>

<EvilComposedChart xDataKey="month" {data} config={chartConfig}>
	<EvilComposedChart.Grid />
	<EvilComposedChart.XAxis dataKey="month" />
	<EvilComposedChart.YAxis />
	<EvilComposedChart.Legend isClickable />
	<EvilComposedChart.Tooltip />
	<EvilComposedChart.Bar dataKey="revenue" variant="gradient" isClickable />
	<EvilComposedChart.Line dataKey="profit" strokeVariant="dashed" isClickable>
		<EvilComposedChart.Dot variant="default" />
		<EvilComposedChart.ActiveDot variant="colored-border" />
	</EvilComposedChart.Line>
</EvilComposedChart>
```

### Interactive Selection

Add `isClickable` to any `<Bar>`, `<Line>`, or `<Legend>` to make those series selectable. Handle selection with the `onSelectionChange` callback on `<EvilComposedChart>`:

```svelte
<EvilComposedChart
	{data}
	config={chartConfig}
	onSelectionChange={(selectedDataKey) => {
		if (selectedDataKey) {
			console.log('Selected:', selectedDataKey);
		} else {
			console.log('Deselected');
		}
	}}
>
	<EvilComposedChart.XAxis dataKey="month" />
	<EvilComposedChart.Legend isClickable />
	<EvilComposedChart.Tooltip />
	<EvilComposedChart.Bar dataKey="revenue" isClickable />
	<EvilComposedChart.Line dataKey="profit" isClickable />
</EvilComposedChart>
```

### Loading State

<ComponentPreview class="mb-0" title="isLoading=&#123;true&#125;" name="ex-loading-state-composed-chart"  />
<Alert > 
  <AlertContent >

Pass the `isLoading` prop to show a shimmer skeleton while your data is being fetched.

</AlertContent>
</Alert>

## Examples

Customize each `<Bar>` with a `variant`, and each `<Line>` with a `strokeVariant`, `curveType`, and more.

### Gradient Colors

<ComponentPreview title="gradient colors" name="ex-gradient-colors-composed-chart"  />

### Bar Variants

<ComponentPreview class="mb-0" title="<Bar variant='hatched' />" name="ex-hatched-variant-composed-chart"  />
<ComponentPreview class="mb-0" title="<Bar variant='duotone' />" name="ex-duotone-variant-composed-chart"  />
<ComponentPreview class="mb-0" title="<Bar variant='gradient' />" name="ex-gradient-variant-composed-chart"  />
<ComponentPreview title="<Bar variant='stripped' />" name="ex-stripped-variant-composed-chart"  />

### Line Stroke Variants

<ComponentPreview class="mb-0" title="<Line strokeVariant='dashed' />" name="ex-dashed-stroke-composed-chart"  />
<ComponentPreview title="<Line strokeVariant='animated-dashed' />" name="ex-animated-dashed-stroke-composed-chart"  />

### Curve Types

<ComponentPreview title="<Line curveType='bump' />" name="ex-bump-curve-composed-chart"  />

### Line Dots

<ComponentPreview class="mb-0" title="<Dot /> and <ActiveDot />" name="ex-dots-composed-chart"  />
<Alert> 
  <AlertContent>

Compose a `<Dot>` for the resting marker and an `<ActiveDot>` for the hover marker inside a `<Line>`. Variants: `default`, `border`, `colored-border`.

</AlertContent>
</Alert>

### Hover Highlight

<ComponentPreview class="mb-0" title="<Bar enableHoverHighlight />" name="ex-hover-highlight-composed-chart"  />
<Alert> 
  <AlertContent>

Set `enableHoverHighlight` on a `<Bar>` to dim the other bars on hover, keeping focus on specific data points.

</AlertContent>
</Alert>

### Glowing Effects

<ComponentPreview class="mb-0" title="<Bar glow /> and <Line glow />" name="ex-glowing-composed-chart"  />
<Alert> 
  <AlertContent>

Add the `glow` prop to a `<Bar>` or `<Line>` for a subtle glow. Each glowing series renders its own scoped filter.

</AlertContent>
</Alert>

## API Reference

The props below are grouped by the component they belong to.

<ApiHeading>EvilComposedChart</ApiHeading>

The root container. It owns the data, shared selection state, loading skeleton, and optional brush; everything visual is composed as its children.

<ApiTable>
  <ApiRow name="data" type="TData[]" required>

The chart data — an array of objects, one per data point (`TData extends Record<string, unknown>`).

</ApiRow>
  <ApiRow name="config" type="Record<string, ChartConfig[string]>" required>

Defines every bar and line series. Each key matches a data key in your data, with a corresponding color or color array.

</ApiRow>
  <ApiRow name="children" type="Snippet" required>

The composed chart parts — `<Grid />`, `<XAxis />`, `<YAxis />`, `<Legend />`, `<Tooltip />`, and one or more `<Bar />` and `<Line />`.

</ApiRow>
  <ApiRow name="className" type="string">

Extra CSS classes for the chart container.

</ApiRow>
  <ApiRow name="curveType" type='"basis" | "bumpX" | "bumpY" | "bump" | "linear" | "natural" | "monotoneX" | "monotoneY" | "monotone" | "step" | …' default='"linear"'>

Default curve interpolation for every `<Line />`; each can override it locally.

</ApiRow>
  <ApiRow name="animationType" type='"none" | "left-to-right" | "right-to-left" | "center-out" | "edges-in"' default='"left-to-right"'>

Default intro for every `<Bar />` and `<Line />` — lines wipe in along this direction, bars grow from their baseline staggered in this order. `"none"` disables it; OS reduce-motion falls back to `"none"` automatically.

</ApiRow>
  <ApiRow name="barGap" type="number">

Gap between bars in the same category.

</ApiRow>
  <ApiRow name="barCategoryGap" type="number">

Gap between bar categories.

</ApiRow>
  <ApiRow name="defaultSelectedDataKey" type="string | null" default="null">

The data key selected by default.

</ApiRow>
  <ApiRow name="onSelectionChange" type="(selectedDataKey: string | null) => void">

Fires when a series is selected or deselected by clicking a clickable `<Bar />`, `<Line />`, or `<Legend />` entry. Receives the selected data key, or `null` when deselected.

</ApiRow>
  <ApiRow name="isLoading" type="boolean" default="false">

Shows a skeleton with a shimmer effect while data is being fetched.

</ApiRow>
  <ApiRow name="loadingBars" type="number" default="12">

Number of bars in the loading skeleton.

</ApiRow>
  <ApiRow name="xDataKey" type="keyof TData & string">

The x-axis data key. Only needed by the brush footer — the axis reads its own key from `<XAxis dataKey="…" />`.

</ApiRow>
  <ApiRow name="chartProps" type="ComponentProps<typeof ComposedChart>">

Extra props forwarded to the underlying LayerChart ComposedChart. See the <Link href="https://www.layerchart.com/docs/components/Chart" _blank>LayerChart ComposedChart documentation</Link> for available props.

</ApiRow>
</ApiTable>

<ApiHeading>Bar</ApiHeading>

A single bar series. Each `<Bar />` generates its own gradient/pattern definitions, so a chart can hold any number of bars — each with its own variant, glow, and clickability.

<ApiTable>
  <ApiRow name="dataKey" type="string" required>

The series key. Must exist on both the data rows and the chart `config`.

</ApiRow>
  <ApiRow name="variant" type='"default" | "hatched" | "duotone" | "duotone-reverse" | "gradient" | "stripped"' default='"default"'>

The bar fill's visual style. Applies to this bar only.

</ApiRow>
  <ApiRow name="radius" type="number" default="4">

The bar's corner radius, in pixels.

</ApiRow>
  <ApiRow name="animationType" type='"none" | "left-to-right" | "right-to-left" | "center-out" | "edges-in"'>

The grow-in order for this bar series. Falls back to the chart's `animationType` when omitted.

</ApiRow>
  <ApiRow name="glow" type="boolean" default="false">

Applies a soft outer neon glow to this bar.

</ApiRow>
  <ApiRow name="isClickable" type="boolean" default="false">

Makes this bar selectable on click. When any series is selected, unselected series become semi-transparent.

</ApiRow>
  <ApiRow name="enableHoverHighlight" type="boolean" default="false">

When set, hovering a column dims the other bars, making it easier to focus on specific data points.

</ApiRow>
  <ApiRow name="barProps" type="ComponentProps<typeof Bar>">

Escape hatch for raw props forwarded to the underlying LayerChart Bar.

</ApiRow>
</ApiTable>

<ApiHeading>Line</ApiHeading>

A single line series. Each `<Line />` generates its own color gradient and glow filter, so a chart can hold any number of lines — each with its own stroke, curve, glow, and clickability.

<ApiTable>
  <ApiRow name="dataKey" type="string" required>

The series key. Must exist on both the data rows and the chart `config`.

</ApiRow>
  <ApiRow name="strokeVariant" type='"solid" | "dashed" | "animated-dashed"' default='"solid"'>

The stroke style for this line.

</ApiRow>
  <ApiRow name="curveType" type='"basis" | "bump" | "linear" | "natural" | "monotoneX" | "monotoneY" | "monotone" | "step" | "stepBefore" | "stepAfter" | …'>

The curve interpolation for this line. Falls back to the chart's `curveType` when omitted.

</ApiRow>
  <ApiRow name="animationType" type='"none" | "left-to-right" | "right-to-left" | "center-out" | "edges-in"'>

The intro reveal direction for this line. Falls back to the chart's `animationType` when omitted.

</ApiRow>
  <ApiRow name="connectNulls" type="boolean" default="false">

Whether to connect line segments across null or missing values.

</ApiRow>
  <ApiRow name="glow" type="boolean" default="false">

Applies a soft outer neon glow to this line.

</ApiRow>
  <ApiRow name="isClickable" type="boolean" default="false">

Makes this line selectable on click. When any series is selected, unselected series become semi-transparent.

</ApiRow>
  <ApiRow name="children" type="Snippet">

Optional `<Dot />` and `<ActiveDot />` that add point markers to this line.

</ApiRow>
  <ApiRow name="lineProps" type="ComponentProps<typeof Line>">

Escape hatch for raw props forwarded to the underlying LayerChart Line.

</ApiRow>
</ApiTable>

<ApiHeading>Dot and ActiveDot</ApiHeading>

Point markers composed inside a `<Line />`. `<Dot />` is the resting marker; `<ActiveDot />` is the hovered marker. They render nothing on their own — the parent `<Line />` reads their `variant`.

<ApiTable>
  <ApiRow name="variant" type='"default" | "border" | "colored-border"'>

The visual style of the point marker.

</ApiRow>
</ApiTable>

<ApiHeading>XAxis and YAxis</ApiHeading>

The category and value axes. Both ship with the chart's flat default styling and forward every LayerChart axis prop — `dataKey`, `tickFormatter`, `tickMargin`, etc. pass straight through. They hide automatically while the chart is loading.

<ApiTable>
  <ApiRow name="dataKey" type="string">

The data key for the axis values.

</ApiRow>
  <ApiRow name="…axisProps">

Every other LayerChart XAxis / YAxis prop is forwarded as-is. See the <Link href="https://www.layerchart.com/docs/components/Chart" _blank>LayerChart XAxis</Link> and <Link href="https://www.layerchart.com/docs/components/Chart" _blank>LayerChart YAxis</Link> docs for available props.

</ApiRow>
</ApiTable>

<ApiHeading>Grid</ApiHeading>

The background grid lines. Defaults to horizontal-only dashed lines and forwards every LayerChart CartesianGrid prop.

<ApiTable>
  <ApiRow name="…gridProps">

Every LayerChart CartesianGrid prop is forwarded as-is. See the <Link href="https://www.layerchart.com/docs/components/Chart" _blank>LayerChart CartesianGrid documentation</Link> for available props.

</ApiRow>
</ApiTable>

<ApiHeading>Tooltip</ApiHeading>

The hover tooltip. It reads the chart's selection state so its content dims unselected series.

<ApiTable>
  <ApiRow name="variant" type='"default" | "frosted-glass"' default='"default"'>

The visual style of the tooltip surface.

</ApiRow>
  <ApiRow name="roundness" type='"sm" | "md" | "lg" | "xl"' default='"lg"'>

Controls the border-radius of the tooltip.

</ApiRow>
  <ApiRow name="defaultIndex" type="number">

When set, the tooltip shows by default at this data point index.

</ApiRow>
  <ApiRow name="cursor" type="boolean" default="true">

Whether the vertical cursor line follows the pointer on hover.

</ApiRow>
</ApiTable>

<ApiHeading>Legend</ApiHeading>

The series legend. When `isClickable` is set, each entry toggles selection of its series.

<ApiTable>
  <ApiRow name="variant" type='"square" | "circle" | "circle-outline" | "rounded-square" | "rounded-square-outline" | "vertical-bar" | "horizontal-bar"'>

The visual style of the legend indicators.

</ApiRow>
  <ApiRow name="align" type='"left" | "center" | "right"' default='"right"'>

Horizontal placement of the legend.

</ApiRow>
  <ApiRow name="verticalAlign" type='"top" | "middle" | "bottom"' default='"top"'>

Vertical placement of the legend.

</ApiRow>
  <ApiRow name="isClickable" type="boolean" default="false">

Lets each legend entry toggle selection of its series.

</ApiRow>
</ApiTable>

<ApiHeading>Brush</ApiHeading>

An optional zoom brush below the chart. Include `<EvilComposedChart.Brush />` to render it; dragging the range filters the main chart.

<ApiTable>
  <ApiRow name="height" type="number">

Height of the brush preview strip in pixels.

</ApiRow>
  <ApiRow name="formatLabel" type="(value: unknown, index: number) => string">

Formats the range-handle labels below the brush.

</ApiRow>
  <ApiRow name="onChange" type="(range: &#123; startIndex: number; endIndex: number &#125;) => void">

Fires when the brush selection range changes.

</ApiRow>
</ApiTable>
