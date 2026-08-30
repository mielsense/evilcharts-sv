---
name: evilcharts-svelte
description: Install, compose, customize, or debug EvilCharts SV chart components in Svelte 5 projects using the LayerChart or Apache ECharts provider.
---

# EvilCharts for Svelte

Use this skill for the Svelte 5 port by miel at
https://github.com/mielsense/evilcharts-sv. For the original React project, use
https://github.com/legions-developer/evilcharts.

## Read the current docs

Start with the machine-readable docs. Do not rely on remembered component APIs.

- Page index: https://evilcharts-sv.vercel.app/llms.txt
- Full snapshot: https://evilcharts-sv.vercel.app/llms-full.txt
- Documentation MCP endpoint: https://evilcharts-sv.vercel.app/mcp
- LayerChart pages: `https://evilcharts-sv.vercel.app/docs/layerchart/{page}.md`
- ECharts pages: `https://evilcharts-sv.vercel.app/docs/echarts/{page}.md`
- Shared chart config: https://evilcharts-sv.vercel.app/docs/chart-config.md

Read the exact chart page and its linked UI primitive pages before writing imports or props. Never
invent a prop, import path, or registry item from a similar chart.

## Choose a provider per chart

Start with LayerChart for inspectable, themeable Svelte SVG and design-led dashboards. Choose
ECharts for dense data, frequent updates, or an existing ECharts option workflow.

In practice, one project may render charts from both providers. Keep each chart root
provider-specific. Never mix compound parts from different providers inside one chart root. Install
both implementations of a chart only when the app intentionally renders both.

## Install from the registry

Use the item name shown on the exact chart page. The general command is:

```bash
npx shadcn-svelte@latest add https://evilcharts-sv.vercel.app/r/{provider}-{chart-name}.json
```

`provider` is `layerchart` or `echarts`. Preserve the project's existing shadcn-svelte and Tailwind
setup.

## Compose charts

EvilCharts is source installed into the project, not a separate runtime. Each compound chart root
owns its data, shared `chartConfig`, selection, and provider context. Its visible children come from
the same installed provider module.

Keep new or edited components coherent with Svelte 5. Use runes, typed `$props()`, and snippets.
Follow the import and composition examples on the exact provider page because chart parts and props
vary by family.
