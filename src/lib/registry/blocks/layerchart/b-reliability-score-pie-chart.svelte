<script lang="ts">
	import { EvilPieChart } from '$lib/registry/charts/layerchart-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const max = 1000;
	const score = 842;
	const data = [
		{ band: 'atrisk', label: 'At risk', from: 0, value: 450, color: '#e11d48' },
		{ band: 'fair', label: 'Fair', from: 450, value: 200, color: '#f59e0b' },
		{ band: 'good', label: 'Good', from: 650, value: 170, color: '#84cc16' },
		{ band: 'excellent', label: 'Excellent', from: 820, value: 180, color: '#059669' }
	];
	const config = Object.fromEntries(
		data.map(({ band, label, color }) => [
			band,
			{ label, colors: { light: [color], dark: [color] } }
		])
	) satisfies ChartConfig;
	const scoreBand = [...data].reverse().find(({ from }) => score >= from) ?? data[0];
</script>

<div class="flex h-full w-full min-w-0 flex-col overflow-hidden p-3 sm:p-4">
	<span class="shrink-0 text-base font-medium tracking-tight text-primary sm:text-lg"
		>Delivery Reliability</span
	>

	<div class="relative mx-auto mt-1 aspect-square min-h-0 w-full max-w-50 flex-1">
		<EvilPieChart
			data={[...data].reverse()}
			{config}
			dataKey="value"
			nameKey="band"
			class="h-full w-full"
		>
			<EvilPieChart.Pie
				innerRadius="74%"
				outerRadius="94%"
				paddingAngle={6}
				cornerRadius={10}
				startAngle={-30}
				endAngle={210}
			/>
		</EvilPieChart>
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<span class="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{score}</span>
		</div>
	</div>

	<div class="-mt-5 shrink-0 text-center">
		<p class="text-xs font-medium text-primary sm:text-sm">
			Reliability is {scoreBand.label.toLowerCase()}
		</p>
		<p class="text-[10px] text-muted-foreground sm:text-xs">Updated 12 Mar 2026</p>
	</div>

	<div class="mt-auto shrink-0 pt-2">
		<div class="flex text-[9px] text-muted-foreground sm:text-[10px]">
			{#each data as item (item.band)}
				<span style:flex-grow={item.value} style:flex-basis="0">{item.from}</span>
			{/each}
			<span>{max}</span>
		</div>
		<div class="mt-1 flex gap-1">
			{#each data as item (item.band)}
				<span
					class="h-1.5 rounded-full"
					style:flex-grow={item.value}
					style:flex-basis="0"
					style:background={item.color}
				></span>
			{/each}
		</div>
	</div>
</div>
