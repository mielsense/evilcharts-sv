<script lang="ts">
	import { EvilPieChart } from '$lib/registry/charts/layerchart-pie-chart/index.js';
	import { EvilRadialChart } from '$lib/registry/charts/layerchart-radial-chart/index.js';
	import type { ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	type PolarRow = { name: 'primary' | 'secondary'; value: number };

	const initialData: PolarRow[] = [
		{ name: 'primary', value: 80 },
		{ name: 'secondary', value: 20 }
	];
	const updatedData: PolarRow[] = [
		{ name: 'primary', value: 20 },
		{ name: 'secondary', value: 80 }
	];
	const config = {
		primary: { label: 'Primary', colors: { light: ['#ff3e00'], dark: ['#ff3e00'] } },
		secondary: { label: 'Secondary', colors: { light: ['#64748b'], dark: ['#94a3b8'] } }
	} satisfies ChartConfig;

	let pieData = $state(initialData);
	let radialData = $state(initialData);
</script>

<main class="grid min-h-dvh grid-cols-2 gap-8 bg-background p-8" data-preview-ready="true">
	<section data-motion-chart="pie">
		<button type="button" onclick={() => (pieData = updatedData)}>Update pie data</button>
		<EvilPieChart class="mt-4 h-80 w-full" data={pieData} dataKey="value" nameKey="name" {config}>
			<EvilPieChart.Pie>
				<EvilPieChart.Label dataKey="value" />
			</EvilPieChart.Pie>
		</EvilPieChart>
	</section>

	<section data-motion-chart="radial">
		<button type="button" onclick={() => (radialData = updatedData)}>Update radial data</button>
		<EvilRadialChart class="mt-4 h-80 w-full" data={radialData} nameKey="name" max={100} {config}>
			<EvilRadialChart.RadialBar dataKey="value" cornerRadius={0} />
		</EvilRadialChart>
	</section>
</main>
