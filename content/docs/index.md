---
title: Introduction
description: Open-source Svelte 5 chart components built with LayerChart and shadcn-svelte.
image: /og/og-image.png
---

<Alert variant="svelte" title="This is an unofficial Svelte port">
  <AlertContent variant="svelte">

<Link href="https://github.com/mielsense" _blank={true} accent={true}>Mathis</Link> built and maintains this
<code>Svelte 5</code> port. <Link href="https://x.com/legionsdev" _blank={true}>Gurbinder</Link> created the
original <Link href="https://github.com/legions-developer/evilcharts" _blank={true}>EvilCharts</Link>
design and React implementation. This independent port preserves that credit and the original MIT
license.

The port is not affiliated with or endorsed by the original project. You can find its source at
<Link href="https://github.com/mielsense/evilcharts-sv" _blank={true}>mielsense/evilcharts-sv</Link>.

</AlertContent>
</Alert>

EvilCharts is a set of installable chart components, not a separate charting runtime. The Svelte
port uses <Link href="https://www.layerchart.com/" _blank={true} accent={true}>LayerChart</Link> for chart rendering
and <Link href="https://shadcn-svelte.com" _blank={true} accent={true}>shadcn-svelte</Link> for its registry and UI
conventions.

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

## One engine, every chart

Every chart is a compound component: the root owns the data and the config, and the visible parts
are children. Same parts, same config object, same gradients, patterns and reveal animations across
every chart type.

```svelte
<EvilAreaChart {data} config={chartConfig}>
	<EvilAreaChart.Grid />
	<EvilAreaChart.XAxis dataKey="month" />
	<EvilAreaChart.Area dataKey="desktop" variant="gradient" />
</EvilAreaChart>
```

You install one chart at a time from this port's registry, so you only ship what you choose. For
example: `npx shadcn-svelte@latest add https://evilcharts-sv.vercel.app/r/layerchart-area-chart.json`.

### LayerChart

**SVG, and all of it is in the DOM.** LayerChart renders through Svelte to SVG, so every gradient, pattern, dot and glow is a real element.

- **Themeable without JavaScript.** Series colors compile to per-chart CSS variables, so light and dark modes swap with a class and do not need a re-render.
- **Inspectable.** Open devtools and the whole chart is right there, stylable with the CSS you already use.
- **Composable.** Charts are built from parts, not props. Drop in a `<Grid />`, a `<Legend />`, or a second `<Area />`.

Reach for it by default: product dashboards, marketing pages, anything where the chart is design surface first and data volume second.

Start with <Link href="/docs/layerchart/installation">Installation</Link>. Labels, colors, and icons
come from one object, which is covered in <Link href="/docs/chart-config">Chart Config</Link>.

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
`@humanspeak/svelte-motion`, and Svelte 5 in place of the original React stack.
