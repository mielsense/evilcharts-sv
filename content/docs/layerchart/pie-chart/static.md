---
title: Pie Chart
description: Pie and donut charts with gradients, labels, and glow effects
image: /og/pie-chart.png
links:
  github: https://github.com/mielsense/evilcharts-sv/tree/main/src/lib/registry/charts/layerchart-pie-chart
  doc: https://www.layerchart.com/docs/components/Pie
  api: https://www.layerchart.com/docs/components/Chart
---

<ComponentPreview title="Basic Chart" name="ex-pie-chart"  />

## Installation

<CodeTabs>
  <TabsList variant="underline">
    <TabsTab value="cli">CLI</TabsTab>
    <TabsTab value="manual">Manual</TabsTab>
  </TabsList>
  <TabsPanel value="cli">
    <CliBlock commands={["@evilcharts/layerchart-pie-chart"]} />
  </TabsPanel>
  <TabsPanel value="manual">
    <Steps>
      <Step>
        <StepTitle>Install the following dependencies:</StepTitle>
        <StepContent>
          <CommandBlock commands={["layerchart"]} />
        </StepContent>
      </Step>
      <Step>
        <StepTitle>Copy the following code into your project.</StepTitle>
         <StepDescription>

Create an `evilcharts` folder with a `charts` subfolder inside your `components` directory, then paste the base pie-chart code into a new file there.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-pie-chart"
            title="$lib/components/evilcharts/charts/layerchart-pie-chart"
          />
        </StepContent>
      </Step>
       <Step>
        <StepTitle>Add the chart component.</StepTitle>
        <StepDescription>

These components render the chart. Create a `ui` folder inside `evilcharts` and paste the code there.

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

Create `tooltip.svelte` inside `evilcharts/ui` and paste the code there.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-tooltip"
            title="$lib/components/evilcharts/ui/layerchart-tooltip"
          />
        </StepContent>
        <StepDescription>

Then create `legend.svelte` in the same folder and paste the code there.

</StepDescription>
        <StepContent>
          <ComponentSource
            name="layerchart-legend"
            title="$lib/components/evilcharts/ui/layerchart-legend"
          />
        </StepContent>
      </Step>
    </Steps>
  </TabsPanel>
</CodeTabs>

## Usage

The pie chart is composable. `<EvilPieChart>` is the container; compose the parts you need — `<EvilPieChart.Legend>`, `<EvilPieChart.Tooltip>`, `<EvilPieChart.Background>`, and one `<EvilPieChart.Pie>` — as children. Each `<EvilPieChart.Pie>` owns its shape props (`innerRadius`, `paddingAngle`, `cornerRadius`, …), `isClickable`, and `glowingSectors`, so one chart can mix any combination.

```svelte
<script lang="ts">
	import { EvilPieChart } from '$lib/components/evilcharts/charts/layerchart-pie-chart';
	import { type ChartConfig } from '$lib/components/evilcharts/ui/layerchart-chart';
</script>
```

```svelte
<script lang="ts">
	const data = [
		{ browser: 'chrome', visitors: 275 },
		{ browser: 'safari', visitors: 200 },
		{ browser: 'firefox', visitors: 187 }
	];

	const chartConfig = {
		chrome: {
			label: 'Chrome',
			colors: { light: ['#3b82f6'], dark: ['#60a5fa'] }
		},
		safari: {
			label: 'Safari',
			colors: { light: ['#10b981'], dark: ['#34d399'] }
		},
		firefox: {
			label: 'Firefox',
			colors: { light: ['#f59e0b'], dark: ['#fbbf24'] }
		}
	} satisfies ChartConfig;
</script>
```

```svelte
<EvilPieChart {data} dataKey="visitors" nameKey="browser" config={chartConfig}>
	<EvilPieChart.Legend isClickable />
	<EvilPieChart.Tooltip />
	<EvilPieChart.Pie isClickable innerRadius={60} paddingAngle={4} cornerRadius={8}>
		<EvilPieChart.Label />
	</EvilPieChart.Pie>
</EvilPieChart>
```

### Interactive Selection

Add `isClickable` to `<EvilPieChart.Pie>` (and `<EvilPieChart.Legend>`) to make sectors selectable. Handle changes with the `onSelectionChange` callback on `<EvilPieChart>`:

```svelte
<EvilPieChart
	{data}
	dataKey="visitors"
	nameKey="browser"
	config={chartConfig}
	onSelectionChange={(selection) => {
		if (selection) {
			console.log('Selected:', selection.dataKey, 'Value:', selection.value);
		} else {
			console.log('Deselected');
		}
	}}
>
	<EvilPieChart.Legend isClickable />
	<EvilPieChart.Tooltip />
	<EvilPieChart.Pie isClickable />
</EvilPieChart>
```

### Loading State

<ComponentPreview class="mb-0" title="isLoading='true'" name="ex-loading-state-pie-chart"  />
<Alert > 
  <AlertContent >

Pass `isLoading` to show a placeholder animation while your data loads.

</AlertContent>
</Alert>

## Examples

Examples with different configurations. Customize `innerRadius`, `paddingAngle`, `cornerRadius`, and more.

### Gradient Colors

<ComponentPreview title="gradient colors" name="ex-gradient-colors-pie-chart"  />

### Donut Chart

<ComponentPreview class="mb-0" title="innerRadius=&#123;60&#125;" name="ex-donut-pie-chart"  />
<Alert> 
  <AlertContent>

Set `innerRadius` above 0 to create a donut — it cuts the hole in the center.

</AlertContent>
</Alert>

### Padded Sectors

<ComponentPreview class="mb-0" title="paddingAngle=&#123;4&#125; cornerRadius=&#123;8&#125;" name="ex-padded-pie-chart"  />
<Alert> 
  <AlertContent>

`paddingAngle` adds space between sectors; `cornerRadius` rounds their corners. Combine with `innerRadius` for a modern donut look.

</AlertContent>
</Alert>

<ComponentPreview class="mb-0" title="innerRadius=&#123;60&#125; paddingAngle=&#123;-20&#125; cornerRadius=&#123;100&#125;" name="ex-overlapping-padded-pie-chart"  />
<Alert> 
  <AlertContent>

A negative `paddingAngle` with a high `cornerRadius` overlaps sectors into petals. Add `innerRadius` for a flower-shaped donut.

</AlertContent>
</Alert>

### Labels

<ComponentPreview class="mb-0" title="&lt;EvilPieChart.Label /&gt;" name="ex-labels-pie-chart"  />
<Alert> 
  <AlertContent>

Compose `<EvilPieChart.Label />` inside `<EvilPieChart.Pie>` to draw a label on each sector. Use `dataKey` to change the data shown and `labelListProps` for further customization.

</AlertContent>
</Alert>

### Glowing Sectors

<ComponentPreview class="mb-0" title="glowingSectors=&#123;['chrome', 'safari']&#125;" name="ex-glowing-pie-chart"  />
<Alert> 
  <AlertContent>

Pass an array of sector names (values from your `nameKey` field) to `glowingSectors` to give those sectors a subtle glow.

</AlertContent>
</Alert>

### Dither rendering

Set `renderStyle="dither"` on the existing pie root for ordered-dither sectors. Donut holes, padding, rounded corners, labels, tooltips, selection, loading, and sweep motion keep their existing behavior. Use `ditherVariant` on `<Pie />` to override the root texture.

<ComponentPreview title="dithered donut" name="ex-dither-pie-chart" />

The renderer is independently implemented for EvilCharts SV and inspired by [Dither Kit](https://github.com/Boring-Software-Inc/dither-kit) by Boring Software.

## API Reference

Props are grouped by the part they belong to.

<ApiHeading>EvilPieChart</ApiHeading>

The root container. Owns the data, shared selection state, and loading skeleton; all visuals are composed as its children.

<ApiTable>
  <ApiRow name="data" type="TData[]" required>

An array of objects, one per sector (`TData extends Record<string, unknown>`).

</ApiRow>
  <ApiRow name="dataKey" type="keyof TData & string" required>

Data key for sector values — typically numbers that set sector size.

</ApiRow>
  <ApiRow name="nameKey" type="keyof TData & string" required>

Data key for sector names — the strings used in labels and legend.

</ApiRow>
  <ApiRow name="config" type="ChartConfig" required>

Defines each sector's colors. Keys should match the values from your `nameKey` field.

</ApiRow>
  <ApiRow name="children" type="Snippet" required>

The composed chart parts — `<Legend />`, `<Tooltip />`, `<Background />`, and one `<Pie />`.

</ApiRow>
  <ApiRow name="accessibility" type="ChartAccessibility">

Names and optionally describes the chart wrapper. It remains a group, so interactive legends and marks stay available to assistive technology.

</ApiRow>
  <ApiRow name="className" type="string">

Extra CSS classes for the chart container.

</ApiRow>
  <ApiRow name="defaultSelectedSector" type="string | null" default="null">

Sector name selected by default.

</ApiRow>
  <ApiRow name="onSelectionChange" type="(selection: &#123; dataKey: string; value: number &#125; | null) => void">

Fires when a sector is selected or deselected via a clickable `<Pie />` sector or `<Legend />` entry. Receives an object with `dataKey` (sector name) and `value` (sector value), or `null` when deselected.

</ApiRow>
  <ApiRow name="isLoading" type="boolean" default="false">

Shows a placeholder animation while data loads.

</ApiRow>
  <ApiRow name="renderStyle" type='"svg" | "dither"' default='"svg"'>Selects the SVG or ordered-dither renderer.</ApiRow>
  <ApiRow name="ditherVariant" type='"gradient" | "dotted" | "hatched" | "solid"' default='"gradient"'>Default texture for dithered sectors.</ApiRow>
  <ApiRow name="ditherCellSize" type="number" default="2">Dither cell size in CSS pixels.</ApiRow>
  <ApiRow name="bloom" type='"off" | "low" | "high" | "aura"' default='"off"'>Optional bounded glow around dither pixels.</ApiRow>
  <ApiRow name="chartProps" type="ComponentProps<typeof PieChart>">

Extra props forwarded to the underlying LayerChart Chart. See the <Link href="https://www.layerchart.com/docs/components/Chart" _blank>LayerChart Chart documentation</Link>.

</ApiRow>
</ApiTable>

<ApiHeading>Pie</ApiHeading>

The pie series. Self-contained — it generates its own gradients and glow filters, so any number of pies coexist on a page without style collisions. Compose a `<Label />` inside it to draw sector labels.

<ApiTable>
  <ApiRow name="innerRadius" type="number | string" default="0">

Inner radius of the pie; set above 0 for a donut. Number (pixels) or percentage string.

</ApiRow>
  <ApiRow name="outerRadius" type="number | string" default='"80%"'>

Outer radius of the pie. Number (pixels) or percentage string.

</ApiRow>
  <ApiRow name="cornerRadius" type="number" default="0">

Corner radius of each sector, in pixels.

</ApiRow>
  <ApiRow name="paddingAngle" type="number" default="0">

Padding between sectors, in degrees. Negative values overlap sectors.

</ApiRow>
  <ApiRow name="startAngle" type="number" default="0">

Starting angle, in degrees (0 is 3 o'clock, 90 is 12 o'clock).

</ApiRow>
  <ApiRow name="endAngle" type="number" default="360">

Ending angle, in degrees. Below 360 draws a partial pie.

</ApiRow>
  <ApiRow name="isClickable" type="boolean" default="false">

Lets users click sectors to select/deselect them; selecting one dims the rest.

</ApiRow>
  <ApiRow name="glowingSectors" type="string[]" default="[]">

Array of sector names (values from your `nameKey` field) to give a smooth outer glow.

</ApiRow>
  <ApiRow name="children" type="Snippet">

Optional `<Label />` that draws labels on each sector.

</ApiRow>
  <ApiRow name="pieProps" type='Omit<ComponentProps<typeof Pie>, "data" | "dataKey" | "nameKey">'>

Escape hatch for raw props forwarded to the underlying LayerChart Arc. See the <Link href="https://www.layerchart.com/docs/components/Arc" _blank>LayerChart Arc documentation</Link>.

</ApiRow>
</ApiTable>

<ApiHeading>Label</ApiHeading>

Per-sector labels composed inside a `<Pie />`. Renders nothing itself — the parent `<Pie />` reads its props and draws the label list over the sectors.

<ApiTable>
  <ApiRow name="dataKey" type="string">

Data key for label text. Falls back to the chart's `dataKey` when omitted.

</ApiRow>
  <ApiRow name="labelListProps" type='Omit<ComponentProps<typeof LabelList>, "dataKey">'>

Escape hatch for label props. See the <Link href="https://www.layerchart.com/docs/components/Text" _blank>LayerChart Text documentation</Link>.

</ApiRow>
</ApiTable>

<ApiHeading>Tooltip</ApiHeading>

The hover tooltip. Hidden automatically while the chart loads.

<ApiTable>
  <ApiRow name="variant" type='"default" | "frosted-glass"' default='"default"'>

Visual style of the tooltip surface.

</ApiRow>
  <ApiRow name="roundness" type='"sm" | "md" | "lg" | "xl"' default='"lg"'>

Border-radius of the tooltip.

</ApiRow>
  <ApiRow name="defaultIndex" type="number">

Shows the tooltip by default at the given sector index.

</ApiRow>
</ApiTable>

<ApiHeading>Legend</ApiHeading>

The sector legend. When `isClickable` is set, each entry toggles selection of its sector.

<ApiTable>
  <ApiRow name="variant" type='"square" | "circle" | "circle-outline" | "rounded-square" | "rounded-square-outline" | …'>

Visual style of the legend indicators.

</ApiRow>
  <ApiRow name="align" type='"left" | "center" | "right"' default='"center"'>

Horizontal placement of the legend.

</ApiRow>
  <ApiRow name="verticalAlign" type='"top" | "middle" | "bottom"' default='"bottom"'>

Vertical placement of the legend.

</ApiRow>
  <ApiRow name="isClickable" type="boolean" default="false">

Lets each legend entry toggle selection of its sector.

</ApiRow>
</ApiTable>

<ApiHeading>Background</ApiHeading>

An optional decorative pattern behind the pie. Compose it before the `<Pie />` so it sits under the sectors.

<ApiTable>
  <ApiRow name="variant" type="BackgroundVariant" default='"dots"'>

The background pattern style.

</ApiRow>
</ApiTable>
