<script lang="ts">
	import {
		EChartsSankeyChart,
		type SankeyData
	} from '$lib/registry/charts/echarts-sankey-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const data: SankeyData = {
		nodes: [
			{ name: 'Inflow' },
			{ name: 'Equities' },
			{ name: 'Bonds' },
			{ name: 'Cash' },
			{ name: 'Growth' },
			{ name: 'Income' },
			{ name: 'Reserve' }
		],
		links: [
			{ source: 0, target: 1, value: 78 },
			{ source: 0, target: 2, value: 46 },
			{ source: 0, target: 3, value: 24 },
			{ source: 1, target: 4, value: 52 },
			{ source: 1, target: 5, value: 26 },
			{ source: 2, target: 5, value: 19 },
			{ source: 2, target: 6, value: 27 },
			{ source: 3, target: 4, value: 9 },
			{ source: 3, target: 6, value: 15 }
		]
	};
	const config = {
		Inflow: { label: 'Inflow', colors: { light: ['#0d9488'], dark: ['#2dd4bf'] } },
		Equities: { label: 'Equities', colors: { light: ['#d97706'], dark: ['#fbbf24'] } },
		Bonds: { label: 'Bonds', colors: { light: ['#ea580c'], dark: ['#fb923c'] } },
		Cash: { label: 'Cash', colors: { light: ['#b45309'], dark: ['#f59e0b'] } },
		Growth: { label: 'Growth', colors: { light: ['#7c3aed'], dark: ['#a78bfa'] } },
		Income: { label: 'Income', colors: { light: ['#6d28d9'], dark: ['#8b5cf6'] } },
		Reserve: { label: 'Reserve', colors: { light: ['#4f46e5'], dark: ['#818cf8'] } }
	} satisfies ChartConfig;
	const stats = [
		{ key: 'positions', label: 'Open positions', value: '204' },
		{ key: 'aum', label: 'Assets under management', value: '$65,430' },
		{ key: 'hedged', label: 'Hedged', value: '87%' }
	];
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex items-baseline justify-between gap-4">
		<span class="text-base font-medium tracking-tight text-primary sm:text-lg">
			Where the fund flows
		</span>
		<span class="text-xs text-muted-foreground">Quarter to date</span>
	</div>

	<div class="mt-2 min-h-0 w-full flex-1">
		<EChartsSankeyChart
			{data}
			{config}
			class="h-full w-full"
			nodeWidth={92}
			nodePadding={12}
			linkCurvature={0.55}
		>
			<EChartsSankeyChart.Tooltip variant="frosted-glass" />
			<EChartsSankeyChart.Link variant="gradient" />
			<EChartsSankeyChart.Node radius={6}>
				<EChartsSankeyChart.NodeLabel
					position="inside"
					showValues
					valueFormatter={(value) => `$${(value * 1000).toLocaleString('en-US')}`}
				/>
			</EChartsSankeyChart.Node>
		</EChartsSankeyChart>
	</div>

	<div class="mt-3 grid shrink-0 grid-cols-3 gap-4">
		{#each stats as stat, index (stat.key)}
			<div
				class="flex flex-col gap-0.5"
				class:items-center={index === 1}
				class:text-center={index === 1}
				class:items-end={index === 2}
				class:text-right={index === 2}
			>
				<span
					class="truncate text-[10px] tracking-wide text-muted-foreground uppercase sm:text-[11px]"
					>{stat.label}</span
				>
				<span class="text-lg font-semibold tracking-tight text-primary sm:text-2xl"
					>{stat.value}</span
				>
			</div>
		{/each}
	</div>
</div>
