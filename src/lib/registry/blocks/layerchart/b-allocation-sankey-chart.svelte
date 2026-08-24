<script lang="ts">
	import {
		EvilSankeyChart,
		type SankeyData
	} from '$lib/registry/charts/layerchart-sankey-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

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
	const palette: Record<string, string> = {
		Inflow: '#0d9488',
		Equities: '#d97706',
		Bonds: '#ea580c',
		Cash: '#b45309',
		Growth: '#7c3aed',
		Income: '#6d28d9',
		Reserve: '#4f46e5'
	};
	const config = Object.fromEntries(
		data.nodes.map(({ name }) => [
			name,
			{ label: name, colors: { light: [palette[name]], dark: [palette[name]] } }
		])
	) satisfies ChartConfig;
	const stats = [
		{ key: 'positions', label: 'Open positions', value: '204' },
		{ key: 'aum', label: 'Assets under management', value: '$65,430' },
		{ key: 'hedged', label: 'Hedged', value: '87%' }
	];
</script>

<div class="@container flex h-full w-full min-w-0 flex-col overflow-hidden p-3 sm:p-4">
	<div class="flex shrink-0 items-baseline justify-between gap-3">
		<span class="truncate text-base font-medium tracking-tight text-primary sm:text-lg"
			>Where the fund flows</span
		>
		<span class="shrink-0 text-[10px] text-muted-foreground sm:text-xs">Quarter to date</span>
	</div>

	<div class="mt-1 min-h-0 w-full flex-1 sm:mt-2">
		<EvilSankeyChart
			{data}
			{config}
			class="h-full w-full"
			nodeWidth={72}
			nodePadding={12}
			linkCurvature={0.55}
		>
			<EvilSankeyChart.Tooltip variant="frosted-glass" />
			<EvilSankeyChart.Link variant="gradient" />
			<EvilSankeyChart.Node radius={6}>
				<EvilSankeyChart.NodeLabel
					position="inside"
					showValues
					valueFormatter={(value) => `$${(value * 1000).toLocaleString('en-US')}`}
				/>
			</EvilSankeyChart.Node>
		</EvilSankeyChart>
	</div>

	<div class="mt-2 grid shrink-0 grid-cols-3 gap-2 sm:mt-3 sm:gap-4">
		{#each stats as stat, index (stat.key)}
			<div
				class="flex min-w-0 flex-col gap-0.5"
				class:items-center={index === 1}
				class:text-center={index === 1}
				class:items-end={index === 2}
				class:text-right={index === 2}
			>
				<span
					class="w-full truncate text-[8px] tracking-wide text-muted-foreground uppercase sm:text-[11px]"
					>{stat.label}</span
				>
				<span class="text-base font-semibold tracking-tight text-primary sm:text-2xl"
					>{stat.value}</span
				>
			</div>
		{/each}
	</div>
</div>
