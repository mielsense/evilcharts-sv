<script lang="ts">
	/** `ShowcaseGrid` from `evilcharts/src/components/docs/mdx/components/showcase-grid.tsx`. */
	import { page } from '$app/state';
	import { DEFAULT_PROVIDER, providerFromPathname } from '$site/globals/constants/providers.js';
	import AreaPreview from '$site/components/docs/svg-previews/area-preview.svelte';
	import BarPreview from '$site/components/docs/svg-previews/bar-preview.svelte';
	import ComposedPreview from '$site/components/docs/svg-previews/composed-preview.svelte';
	import LinePreview from '$site/components/docs/svg-previews/line-preview.svelte';
	import PiePreview from '$site/components/docs/svg-previews/pie-preview.svelte';
	import RadarPreview from '$site/components/docs/svg-previews/radar-preview.svelte';
	import RadialPreview from '$site/components/docs/svg-previews/radial-preview.svelte';
	import SankeyPreview from '$site/components/docs/svg-previews/sankey-preview.svelte';
	import Grid from '$site/components/docs/svg-previews/background-grid.svelte';

	const CHARTS = [
		{
			name: 'Area Chart',
			description: 'Highlight trends with filled area ranges.',
			Component: AreaPreview,
			slug: 'area-chart'
		},
		{
			name: 'Line Chart',
			description: 'Track change over time with lines.',
			Component: LinePreview,
			slug: 'line-chart'
		},
		{
			name: 'Bar Chart',
			description: 'Compare categories quickly with bold bars.',
			Component: BarPreview,
			slug: 'bar-chart'
		},
		{
			name: 'Composed Chart',
			description: 'Mix lines, bars, areas in one.',
			Component: ComposedPreview,
			slug: 'composed-chart'
		},
		{
			name: 'Radar Chart',
			description: 'Compare multi-metric profiles on radial axes.',
			Component: RadarPreview,
			slug: 'radar-chart'
		},
		{
			name: 'Pie Chart',
			description: 'Show parts of a whole, clearly.',
			Component: PiePreview,
			slug: 'pie-chart'
		},
		{
			name: 'Radial Chart',
			description: 'Visualize totals in a circular layout.',
			Component: RadialPreview,
			slug: 'radial-chart'
		},
		{
			name: 'Sankey Chart',
			description: 'Show flows between stages with weighted links.',
			Component: SankeyPreview,
			slug: 'sankey-chart'
		}
	];

	// This grid renders inside a provider's Components page, so link within that provider. Deriving
	// it from the URL means a new provider needs no changes here and no prop threading through the
	// markdown.
	const provider = $derived(providerFromPathname(page.url.pathname) ?? DEFAULT_PROVIDER);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

<div class="mt-6 grid grid-flow-row grid-cols-1 gap-8 sm:grid-cols-2">
	{#each CHARTS as { name, description, slug, Component } (name)}
		<a href={`/docs/${provider}/${slug}`}>
			<div class="group cursor-pointer rounded-md bg-[#F5F5F5] p-1 dark:bg-primary-foreground">
				<div
					class="relative h-40 rounded-[5px] border bg-background duration-200 group-hover:border-primary/20"
				>
					<Grid />
					<Component />
				</div>
				<div class="flex flex-col gap-1 p-2">
					<p class="text-xs font-medium group-hover:text-primary">{name}</p>
					<p class="text-[11px] text-muted-foreground">{description}</p>
				</div>
			</div>
		</a>
	{/each}
</div>
