---
title: Introduction
description: Open-source, beautifully handcrafted chart components built with shadcn — on LayerChart.
image: /og/og-image.png
---

<Alert variant="info" title="This is an unofficial Svelte port">
  <AlertContent>

All credit for the design, the component API, the documentation and the examples goes to
<Link href="https://x.com/legionsdev" _blank={true}>Gurbinder</Link> and the original
<Link href="https://github.com/legions-developer/evilcharts" _blank={true}>EvilCharts</Link>
project — a React library built on Recharts and Apache ECharts. Everything here is a Svelte 5
translation of it, MIT-licensed like the original.

This port is community-maintained and not affiliated with or endorsed by the original authors. If
you like these charts, star <Link href="https://github.com/legions-developer/evilcharts" _blank={true}>the original repository</Link>.

</AlertContent>
</Alert>

Wait... it's not another chart library. I couldn't find chart components with smooth animations and dynamic data, so I built my own — with <Link href="https://www.layerchart.com/" _blank={true}>LayerChart</Link> and <Link href="https://shadcn-svelte.com" _blank={true}>shadcn-svelte</Link>.

## The Problem

EvilCharts is built by <Link href="https://x.com/legionsdev" _blank={true}>Gurbinder</Link> (Design Engineer @ Axiom.co). I see ugly, generic charts everywhere, and no one in the community is building a beautiful chart library.

> The words below are Gurbinder's, from the original project's introduction. They are kept because
> they are the reason this library exists — and this port exists only to bring it to Svelte.

There are tons of chart libraries, but none are beautiful. They allow customization, yet everyone just ships the defaults from the docs.

So I'm building a beautiful chart component site — open source, open code, all yours...

## Why I named it EvilCharts?

"Evil" doesn't mean malicious. It means:

- Unapologetically opinionated UI choices
- Design-first, animated, unique designs
- Handcrafted with SVGs and <Link href="https://motion.dev" _blank={true}>Motion</Link> to stand out

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

You install one chart at a time — `@evilcharts/layerchart-area-chart` — so you only ever ship what
you picked.

### LayerChart

**SVG, and all of it is in the DOM.** LayerChart renders through Svelte to SVG, so every gradient, pattern, dot and glow is a real element.

- **Themeable without JavaScript.** Series colors compile to per-chart CSS variables, so light and dark swap with a class — no re-render, no flash.
- **Inspectable.** Open devtools and the whole chart is right there, stylable with the CSS you already use.
- **Composable.** Charts are built from parts, not props. Drop in a `<Grid />`, a `<Legend />`, or a second `<Area />`.

Reach for it by default: product dashboards, marketing pages, anything where the chart is design surface first and data volume second.

Start from the sidebar — <Link href="/docs/layerchart/installation">Installation</Link> — and the labels, colors and icons all come from one object: see <Link href="/docs/chart-config">Chart Config</Link>.

## Credits and licence

|                  |                                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Original project | <Link href="https://github.com/legions-developer/evilcharts" _blank={true}>legions-developer/evilcharts</Link>               |
| Original site    | <Link href="https://evilcharts.com" _blank={true}>evilcharts.com</Link>                                                      |
| Original author  | <Link href="https://x.com/legionsdev" _blank={true}>Gurbinder</Link>                                                         |
| Licence          | MIT, for both the original and this port                                                                                     |
| This port        | <Link href="https://github.com/legions-developer/evilcharts-svelte" _blank={true}>legions-developer/evilcharts-svelte</Link> |

Substantially all of the design, component API, documentation prose and example data in this port
derive from the original project. The Svelte translation swaps the engine (Recharts → LayerChart),
the motion library (`motion/react` → `@humanspeak/svelte-motion`) and the framework, and nothing
else on purpose.
