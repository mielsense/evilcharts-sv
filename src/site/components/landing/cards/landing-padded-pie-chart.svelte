<script lang="ts">
	/** `LandingPaddedPieChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilPieChart } from '$lib/registry/charts/layerchart-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const paddedPieData = [
		{ stack: 'render', value: 340 },
		{ stack: 'compute', value: 260 },
		{ stack: 'storage', value: 210 },
		{ stack: 'network', value: 150 },
		{ stack: 'other', value: 90 }
	];
	const paddedPieConfig = {
		render: { label: 'Render', colors: { light: ['#c026d3'], dark: ['#e879f9'] } },
		compute: { label: 'Compute', colors: { light: ['#0891b2'], dark: ['#22d3ee'] } },
		storage: { label: 'Storage', colors: { light: ['#65a30d'], dark: ['#a3e635'] } },
		network: { label: 'Network', colors: { light: ['#ea580c'], dark: ['#fb923c'] } },
		other: { label: 'Other', colors: { light: ['#4f46e5'], dark: ['#818cf8'] } }
	} satisfies ChartConfig;
</script>

<EvilPieChart
	data={paddedPieData}
	dataKey="value"
	nameKey="stack"
	config={paddedPieConfig}
	class="h-full w-full p-3"
>
	<EvilPieChart.Legend />
	<EvilPieChart.Tooltip />
	<EvilPieChart.Pie innerRadius={30} paddingAngle={4} />
</EvilPieChart>
