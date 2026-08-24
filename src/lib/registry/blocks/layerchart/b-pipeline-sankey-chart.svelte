<script lang="ts">
	import {
		EvilSankeyChart,
		type SankeyData
	} from '$lib/registry/charts/layerchart-sankey-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const data: SankeyData = {
		nodes: [
			{ name: 'Retail' },
			{ name: 'Wholesale' },
			{ name: 'Licensing' },
			{ name: 'Services' },
			{ name: 'Pipeline' },
			{ name: 'Expansion' },
			{ name: 'Tooling' },
			{ name: 'Support' },
			{ name: 'Reserve' }
		],
		links: [
			{ source: 0, target: 4, value: 31480 },
			{ source: 1, target: 4, value: 46220 },
			{ source: 2, target: 4, value: 14960 },
			{ source: 3, target: 4, value: 28340 },
			{ source: 4, target: 5, value: 52640 },
			{ source: 4, target: 6, value: 9180 },
			{ source: 4, target: 7, value: 12470 },
			{ source: 4, target: 8, value: 46710 }
		]
	};
	const palette: Record<string, string> = {
		Retail: '#1d4ed8',
		Wholesale: '#2563eb',
		Licensing: '#4338ca',
		Services: '#4f46e5',
		Pipeline: '#6d28d9',
		Expansion: '#be123c',
		Tooling: '#c2410c',
		Support: '#9f1239',
		Reserve: '#b91c1c'
	};
	const config = Object.fromEntries(
		data.nodes.map(({ name }) => [
			name,
			{
				label: name === 'Pipeline' ? '' : name,
				colors: { light: [palette[name]], dark: [palette[name]] }
			}
		])
	) satisfies ChartConfig;
	const total = data.links
		.filter((link) => link.target === 4)
		.reduce((sum, link) => sum + link.value, 0);
</script>

<div class="relative h-full w-full min-w-0 overflow-hidden p-3 sm:p-4">
	<EvilSankeyChart
		{data}
		{config}
		class="h-full w-full"
		nodeWidth={10}
		nodePadding={18}
		linkCurvature={0.55}
	>
		<EvilSankeyChart.Tooltip variant="frosted-glass" />
		<EvilSankeyChart.Link variant="gradient" />
		<EvilSankeyChart.Node radius={5}>
			<EvilSankeyChart.NodeLabel
				position="outside"
				showValues
				valueFormatter={(value) => `$${value.toLocaleString('en-US')}`}
			/>
		</EvilSankeyChart.Node>
	</EvilSankeyChart>

	<div class="pointer-events-none absolute inset-0 flex items-stretch justify-center">
		<div
			class="flex h-full max-w-[52%] flex-col items-center justify-center bg-[linear-gradient(to_right,transparent_0%,var(--background)_30%,var(--background)_70%,transparent_100%)] px-5 text-center sm:px-12"
		>
			<span class="text-[9px] text-muted-foreground sm:text-xs">Total booked</span>
			<span class="text-lg leading-none font-semibold tracking-tight text-primary sm:text-4xl"
				>${total.toLocaleString('en-US')}</span
			>
			<span class="mt-1 text-[9px] text-muted-foreground sm:text-xs">4 sources · 4 routes</span>
		</div>
	</div>
</div>
