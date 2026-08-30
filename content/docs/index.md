---
title: Introduction
description: Open-source Svelte 5 chart components built with LayerChart or Apache ECharts.
image: /og/og-image.png
---

<Alert variant="svelte" title="EvilCharts for Svelte">
  <AlertContent variant="svelte">

<p>This is a <code>Svelte 5</code> port of <a href="https://github.com/legions-developer/evilcharts" target="_blank" rel="noreferrer" class="text-svelte underline underline-offset-4">EvilCharts</a> with ordered-dither chart variants adapted from <a href="https://github.com/Boring-Software-Inc/dither-kit" target="_blank" rel="noreferrer" class="text-svelte underline underline-offset-4">Dither Kit</a>.</p>

</AlertContent>
</Alert>

EvilCharts is a set of installable chart components, not a separate charting runtime. Choose
<Link href="https://www.layerchart.com/" _blank={true} accent={true}>LayerChart</Link> for
Svelte-rendered SVG or <Link href="https://echarts.apache.org" _blank={true} accent={true}>Apache ECharts</Link>
for Canvas with optional SVG rendering. Both providers use the same chart config and
<Link href="https://shadcn-svelte.com" _blank={true} accent={true}>shadcn-svelte</Link> registry flow.

## The Problem

Gurbinder created EvilCharts after seeing the same default chart styles repeated across products.
The original project set out to make charts more distinctive without hiding their source code.

> The words below are adapted from Gurbinder's introduction to the original project. This port
> brings that work to Svelte.

There are tons of chart libraries, but none are beautiful. They allow customization, yet everyone just ships the defaults from the docs.

The result is an open-source chart component collection whose code belongs in your project.

## Why is it called EvilCharts?

"Evil" doesn't mean malicious. It means:

- Unapologetically opinionated UI choices
- Design-first, animated, unique designs
- Handcrafted SVG and motion that give each chart a distinct look

## Two providers, one chart API

Every chart is a compound component: the root owns the data and config, and the visible parts are
children. LayerChart components use the `Evil*Chart` prefix; ECharts components use
`ECharts*Chart`. Both providers keep the same composition model, data, variants, and interactions.

```svelte
<EvilAreaChart {data} config={chartConfig}>
	<EvilAreaChart.Grid />
	<EvilAreaChart.XAxis dataKey="month" />
	<EvilAreaChart.Area dataKey="desktop" variant="gradient" />
</EvilAreaChart>
```

You install one chart at a time from this port's registry, so you only ship what you choose. Use
`layerchart-area-chart` or `echarts-area-chart` in the registry URL to select the provider.

## Accessibility

Give each chart an accessible name with the root `accessibility` prop. Add a description when the
chart needs context that its name does not provide.

```svelte
<EvilAreaChart
	{data}
	config={chartConfig}
	accessibility={{
		label: 'Monthly traffic',
		description: 'Desktop and mobile visits from January through December.'
	}}
>
	<EvilAreaChart.Legend isClickable />
	<EvilAreaChart.Area dataKey="desktop" isClickable />
	<EvilAreaChart.Area dataKey="mobile" isClickable />
</EvilAreaChart>
```

If visible text already names or describes the chart, pass its element IDs as `labelledBy` and
`describedBy`. The chart wrapper keeps `role="group"`, so interactive legends and chart marks
remain available to assistive technology.

### LayerChart

**SVG, and all of it is in the DOM.** LayerChart renders through Svelte to SVG, so every gradient, pattern, dot and glow is a real element.

- **Themeable without JavaScript.** Series colors compile to per-chart CSS variables, so light and dark modes swap with a class and do not need a re-render.
- **Inspectable.** Open devtools and the whole chart is right there, stylable with the CSS you already use.
- **Composable.** Charts are built from parts, not props. Drop in a `<Grid />`, a `<Legend />`, or a second `<Area />`.

Reach for it by default: product dashboards, marketing pages, anything where the chart is design surface first and data volume second.

Start with <Link href="/docs/layerchart/installation">Installation</Link>. Labels, colors, and icons
come from one object, which is covered in <Link href="/docs/chart-config">Chart Config</Link>.

### Apache ECharts

**Canvas by default, with SVG available.** ECharts is a strong fit for dense dashboards and teams
that already use its option model. EvilCharts keeps the compound Svelte API and compiles those
parts into a typed ECharts option.

- **Renderer choice.** Use the Canvas default or pass `renderer="svg"` on any chart root.
- **Native updates.** Data changes interpolate through ECharts rather than replacing the chart.
- **Same source-registry workflow.** Install only the ECharts chart and UI modules you need.

Start with <Link href="/docs/echarts/installation">ECharts installation</Link>, then browse the
matching chart pages under the ECharts provider.

## Credits and licence

|                  |                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Original project | <Link href="https://github.com/legions-developer/evilcharts" _blank={true}>legions-developer/evilcharts</Link> |
| Original site    | <Link href="https://evilcharts.com" _blank={true}>evilcharts.com</Link>                                        |
| Original author  | <Link href="https://x.com/legionsdev" _blank={true}>Gurbinder</Link>                                           |
| Licence          | MIT, for both the original and this port                                                                       |
| Svelte port      | <Link href="https://github.com/mielsense/evilcharts-sv" _blank={true}>mielsense/evilcharts-sv</Link>           |
| Port author      | <Link href="https://github.com/mielsense" _blank={true}>Mathis</Link>                                          |

Substantially all of the design, component API, documentation prose and example data in this port
derive from the original project. The Svelte translation uses LayerChart,
`@humanspeak/svelte-motion`, Apache ECharts, and Svelte 5 in place of the original React stack.
