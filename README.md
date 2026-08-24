# Evil Charts for Svelte

Animated, interactive chart components for **Svelte 5**. Built on [LayerChart][layerchart], styled
for [shadcn-svelte][shadcn-svelte], and installed as source in your project.

> ### This is an unofficial port
>
> [Mathis (`mielsense`)][porter] built and maintains this Svelte 5 port. [Gurbinder
> (`legions-developer`)][author] created the original [EvilCharts][upstream] design and React
> implementation. This independent port preserves that credit and the original MIT license.
>
> - Svelte port: <https://github.com/mielsense/evilcharts-sv>
> - Svelte docs: <https://evilcharts-sv.vercel.app/docs>
> - Original project: <https://github.com/legions-developer/evilcharts>
> - Original site: <https://evilcharts.com>
>
> This port is not affiliated with or endorsed by the original authors.

---

## What's in here

Two things in one repository, the same split the original uses:

1. **A [shadcn-svelte][shadcn-svelte]-compatible registry** of copy-paste chart components built on
   LayerChart. The components keep working after you copy them into your own
   project.
2. **The documentation site** that presents the registry, renders every example, publishes the docs
   and exposes machine-readable surfaces for agents.

|                        | Count                                                    |
| ---------------------- | -------------------------------------------------------- |
| Chart types            | 8: area, line, bar, composed, radar, pie, radial, sankey |
| Shared primitives      | 6: chart, tooltip, legend, dot, brush, background        |
| Documentation examples | 113                                                      |
| Installable blocks     | 4                                                        |
| Registry items total   | 131                                                      |

## Install a chart

```bash
npx shadcn-svelte@latest add https://evilcharts-sv.vercel.app/r/layerchart-area-chart.json
```

Then use it:

```svelte
<script lang="ts">
	import { EvilAreaChart } from '$lib/components/evilcharts/charts/layerchart-area-chart/index.js';
	import { type ChartConfig } from '$lib/components/evilcharts/ui/layerchart-chart/index.js';

	const data = [
		{ month: 'January', desktop: 342, mobile: 245 },
		{ month: 'February', desktop: 876, mobile: 654 }
	];

	const chartConfig = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'], dark: ['#10b981'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'], dark: ['#f43f5e'] } }
	} satisfies ChartConfig;
</script>

<EvilAreaChart {data} config={chartConfig} stackType="stacked">
	<EvilAreaChart.Grid />
	<EvilAreaChart.XAxis dataKey="month" />
	<EvilAreaChart.Legend isClickable />
	<EvilAreaChart.Tooltip />
	<EvilAreaChart.Area dataKey="desktop" variant="gradient" isClickable>
		<EvilAreaChart.Dot variant="border" />
		<EvilAreaChart.ActiveDot variant="colored-border" />
	</EvilAreaChart.Area>
</EvilAreaChart>
```

Every chart is a compound component: the root owns the data, the config and the shared selection
state; the visible parts are children. See the [Svelte docs](https://evilcharts-sv.vercel.app/docs)
for the full API.

## Stack

- **Svelte 5** (runes) and **SvelteKit 2**
- **[LayerChart][layerchart] 2** for the chart engine
- **[`@humanspeak/svelte-motion`][svelte-motion]** for animation
- **Tailwind CSS v4**, **[bits-ui][bits-ui]** for the site primitives
- **mdsvex** for the documentation
- **Vitest** (browser + node) and **Playwright** for tests

The original is built on React 19, Next.js 16, Recharts 3 / Apache ECharts 6, Base UI, Fumadocs and
`motion/react`. Where a Svelte equivalent behaves differently, the difference is written down in
`plans/DEVIATIONS.md` alongside the measurement that justified it.

## Development

```bash
pnpm install

pnpm dev              # dev server
pnpm build            # registry:fresh, then a production build
pnpm preview          # serve the production build

pnpm check            # svelte-check (type-check)
pnpm lint             # prettier --check + eslint
pnpm format           # prettier --write

pnpm test:unit        # vitest (client browser project + server node project)
pnpm test:e2e         # playwright, against the production build
pnpm test             # both

pnpm registry:build   # regenerate __index__.ts, registry.json and static/r/*.json
pnpm registry:fresh   # clean, then rebuild
```

`pnpm build` runs `registry:fresh` first, so the generated registry artefacts are always in step
with the source. `registry.json` and `src/lib/registry/__index__.ts` are tracked; `static/r/` is
generated and gitignored.

## Deploying

The site is built with `@sveltejs/adapter-vercel` and is almost entirely prerendered. `/mcp`'s
`POST` is the one dynamic route. Any static-capable host works; the adapter is the only thing to
swap.

Set `PUBLIC_APP_URL` to the deployment's own origin. It backs the canonical tags, the OG image URLs,
the sitemap and every absolute URL the agent surfaces publish, so leaving it unset on a custom
domain would point agents at the wrong registry. On Vercel, `PUBLIC_VERCEL_URL` is used as a
fallback so previews are self-consistent. See [`.env.example`](./.env.example).

## Repository map

```
src/lib/registry/          the installable product
  charts/                  8 chart modules, one directory each
  ui/                      6 shared primitives
  examples/layerchart/     113 `ex-*` documentation demos
  blocks/layerchart/       4 larger `b-*` compositions
  registry-*.ts            item manifests (names, deps, consumer targets)
  __index__.ts             generated; never edit by hand

src/site/                  the documentation site
  components/docs/         docs chrome, previews, the markdown component map
  components/ui/           site primitives on bits-ui
  components/landing/      the animated landing showcase
  lib/                     source loader, highlighter, agent surfaces, mdsvex plugins

content/docs/              the documentation, as markdown
src/routes/                the SvelteKit app, plus the agent endpoints
scripts/build-registry.ts  writes registry.json, static/r/*.json and __index__.ts
```

## Agent-readable surfaces

The docs are published for machines as well as people:

| Route                                                | What it is                                                |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `/llms.txt`                                          | the documentation index                                   |
| `/llms-full.txt`                                     | every page, inlined, with registry source                 |
| `/docs/**.md`                                        | the markdown behind any docs page                         |
| `/mcp`                                               | a JSON-RPC MCP endpoint with `search_docs` and `read_doc` |
| `/skill.md`, `/.well-known/{skills,agent-skills}/**` | agent-skill discovery                                     |

A request to any `/docs/…` page with `Accept: text/markdown` is served its markdown mirror.

## Contributing

Bug reports and fixes are welcome. Two things to know first:

- **Parity with the original is the goal.** A change that makes a chart diverge from
  [evilcharts.com][upstream-site] needs a reason, and that reason belongs in
  `plans/DEVIATIONS.md` with the measurement behind it.
- **New chart designs belong upstream.** If you have an idea for a new chart or variant, open it on
  the [original repository][upstream]. This port follows it.

## Licence

MIT. See [`LICENSE`](./LICENSE). It preserves the original project's copyright and identifies
Mathis as the author of the Svelte port.

[author]: https://x.com/legionsdev
[porter]: https://github.com/mielsense
[upstream]: https://github.com/legions-developer/evilcharts
[upstream-site]: https://evilcharts.com
[layerchart]: https://www.layerchart.com
[shadcn-svelte]: https://shadcn-svelte.com
[svelte-motion]: https://github.com/humanspeak/svelte-motion
[bits-ui]: https://bits-ui.com
