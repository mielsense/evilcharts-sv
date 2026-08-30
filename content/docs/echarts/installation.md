---
title: Installation
description: install the evilcharts echarts components in your project
image: /og/og-image.png
---

The ECharts provider uses Apache ECharts with Canvas by default and optional SVG rendering — same config contract, same install flow, and a renderer choice on every chart root.

Omit `renderer` to keep the Canvas default, or pass `renderer="svg"` to select ECharts' SVG renderer:

```svelte
<EChartsAreaChart {data} config={chartConfig}>
	<!-- Canvas -->
</EChartsAreaChart>

<EChartsAreaChart renderer="svg" {data} config={chartConfig}>
	<!-- SVG renderer -->
</EChartsAreaChart>
```

## Steps

<Steps>
  <Step>
    <StepTitle>Install ECharts</StepTitle>
    <StepContent>
      <StepDescription>

Apache ECharts powers the provider and is required by every ECharts component.

Learn more at the <Link href="https://echarts.apache.org/handbook/en/basics/import" _blank>ECharts import guide</Link>.

</StepDescription>
      <CommandBlock commands={["echarts"]} />
    </StepContent>

  </Step>

  <Step>
    <StepTitle>Setup shadcn-svelte</StepTitle>
    <StepContent>
      <StepDescription>

Initialize shadcn-svelte to set up Tailwind CSS, theming, and component structure. Skip this step if you already have it.

Check out the <Link href="https://www.shadcn-svelte.com/docs/installation" _blank>shadcn-svelte installation docs</Link> for more details.

</StepDescription>
      <CliBlock commands={["init"]} />
    </StepContent>

  </Step>

  <Step>
    <StepTitle>Add EvilCharts ECharts Components</StepTitle>
    <StepContent>
      <StepDescription>

Add components with the CLI. ECharts components are prefixed with `echarts-` — replace `{chart-name}` with one of `area-chart`, `line-chart`, `bar-chart`, `composed-chart`, `radar-chart`, `pie-chart`, `radial-chart`, or `sankey-chart`. Installing one pulls that chart plus the shared `ui` modules it imports.

</StepDescription>
      <CliBlock commands={["@evilcharts/echarts-{chart-name}"]} />
    </StepContent>
  </Step>
</Steps>

## Give the docs to your coding agent

Evil Charts for Svelte is indexed on Context7 under the library ID
<code>/mielsense/evilcharts-sv</code>. Give that exact ID to an agent with Context7 MCP connected so
it reads this Svelte port instead of the original React implementation:

```text
Use Context7 library /mielsense/evilcharts-sv for EvilCharts Svelte docs.
```

<Link href="https://context7.com/mielsense/evilcharts-sv" _blank>Open the Evil Charts for Svelte Context7 page</Link>.
