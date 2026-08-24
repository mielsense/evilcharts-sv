<script lang="ts">
	/** `LandingDonutPieChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilPieChart } from '$lib/registry/charts/layerchart-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const donutData = [
		{ channel: 'search', value: 320 },
		{ channel: 'social', value: 240 },
		{ channel: 'direct', value: 195 },
		{ channel: 'referral', value: 140 },
		{ channel: 'email', value: 110 }
	];
	const donutConfig = {
		search: { label: 'Search', colors: { light: ['#e11d48'], dark: ['#fb7185'] } },
		social: { label: 'Social', colors: { light: ['#f97316'], dark: ['#fb923c'] } },
		direct: { label: 'Direct', colors: { light: ['#eab308'], dark: ['#facc15'] } },
		referral: { label: 'Referral', colors: { light: ['#16a34a'], dark: ['#4ade80'] } },
		email: { label: 'Email', colors: { light: ['#0284c7'], dark: ['#38bdf8'] } }
	} satisfies ChartConfig;
</script>

<EvilPieChart
	data={donutData}
	dataKey="value"
	nameKey="channel"
	config={donutConfig}
	class="h-full w-full p-3"
>
	<EvilPieChart.Legend />
	<EvilPieChart.Tooltip />
	<EvilPieChart.Pie innerRadius={60} />
</EvilPieChart>
