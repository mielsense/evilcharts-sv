<script lang="ts">
	import { EChartsPieChart } from '$lib/registry/charts/echarts-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const max = 1000;
	const score = 842;
	const data = [
		{
			band: 'atrisk',
			label: 'At risk',
			from: 0,
			value: 450,
			bar: 'bg-[#e11d48] dark:bg-[#fb7185]'
		},
		{
			band: 'fair',
			label: 'Fair',
			from: 450,
			value: 200,
			bar: 'bg-[#f59e0b] dark:bg-[#fbbf24]'
		},
		{
			band: 'good',
			label: 'Good',
			from: 650,
			value: 170,
			bar: 'bg-[#84cc16] dark:bg-[#a3e635]'
		},
		{
			band: 'excellent',
			label: 'Excellent',
			from: 820,
			value: 180,
			bar: 'bg-[#059669] dark:bg-[#34d399]'
		}
	];
	const config = {
		atrisk: { label: 'At risk', colors: { light: ['#e11d48'], dark: ['#fb7185'] } },
		fair: { label: 'Fair', colors: { light: ['#f59e0b'], dark: ['#fbbf24'] } },
		good: { label: 'Good', colors: { light: ['#84cc16'], dark: ['#a3e635'] } },
		excellent: { label: 'Excellent', colors: { light: ['#059669'], dark: ['#34d399'] } }
	} satisfies ChartConfig;
	const scoreBand = [...data].reverse().find(({ from }) => score >= from) ?? data[0];
</script>

<div class="flex h-full w-full flex-col p-4">
	<span class="text-base font-medium tracking-tight text-primary sm:text-lg"
		>Delivery Reliability</span
	>

	<div class="relative mx-auto mt-1 aspect-square w-full max-w-50 shrink-0">
		<EChartsPieChart
			data={[...data].reverse()}
			{config}
			dataKey="value"
			nameKey="band"
			class="h-full w-full"
		>
			<EChartsPieChart.Pie
				innerRadius="74%"
				outerRadius="94%"
				paddingAngle={6}
				cornerRadius={10}
				startAngle={-30}
				endAngle={210}
			/>
		</EChartsPieChart>

		<svg
			viewBox="0 0 100 100"
			class="pointer-events-none absolute inset-0 text-muted-foreground/50"
			aria-hidden="true"
		>
			<path
				d="M 23.15 65.5 A 31 31 0 1 1 76.85 65.5"
				fill="none"
				stroke="currentColor"
				stroke-width="1"
				stroke-linecap="round"
				stroke-dasharray="0.1 5"
			/>
		</svg>
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<span class="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{score}</span>
		</div>
	</div>

	<div class="-mt-6 text-center">
		<p class="text-xs font-medium text-primary sm:text-sm">
			Reliability is {scoreBand.label.toLowerCase()}
		</p>
		<p class="text-[10px] text-muted-foreground sm:text-xs">Updated 12 Mar 2026</p>
	</div>

	<div class="mt-auto shrink-0 pt-2">
		<div class="flex text-[10px] text-muted-foreground">
			{#each data as item (item.band)}
				<span style:flex-grow={item.value} style:flex-basis="0">{item.from}</span>
			{/each}
			<span>{max}</span>
		</div>
		<div class="mt-1 flex gap-1">
			{#each data as item (item.band)}
				<span
					class={`h-1.5 rounded-full ${item.bar}`}
					style:flex-grow={item.value}
					style:flex-basis="0"
				></span>
			{/each}
		</div>
	</div>
</div>
