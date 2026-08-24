<script lang="ts">
	/** `LandingSemiRadialChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilRadialChart } from '$lib/registry/charts/layerchart-radial-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const semiRadialData = [
		{ tier: 'starter', value: 420 },
		{ tier: 'growth', value: 340 },
		{ tier: 'scale', value: 260 },
		{ tier: 'pro', value: 180 },
		{ tier: 'max', value: 120 }
	];
	const semiRadialConfig = {
		starter: { label: 'Starter', colors: { light: ['#f43f5e'], dark: ['#fb7185'] } },
		growth: { label: 'Growth', colors: { light: ['#ea580c'], dark: ['#fb923c'] } },
		scale: { label: 'Scale', colors: { light: ['#ca8a04'], dark: ['#facc15'] } },
		pro: { label: 'Pro', colors: { light: ['#16a34a'], dark: ['#4ade80'] } },
		max: { label: 'Max', colors: { light: ['#0ea5e9'], dark: ['#38bdf8'] } }
	} satisfies ChartConfig;
</script>

<EvilRadialChart
	data={semiRadialData}
	nameKey="tier"
	config={semiRadialConfig}
	variant="semi"
	class="h-full w-full p-3"
>
	<EvilRadialChart.Legend />
	<EvilRadialChart.Tooltip />
	<EvilRadialChart.RadialBar dataKey="value" />
</EvilRadialChart>
