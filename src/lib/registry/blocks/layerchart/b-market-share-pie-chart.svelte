<script lang="ts">
	import { EvilPieChart } from '$lib/registry/charts/layerchart-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const series = [
		{ key: 'skyline', label: 'Skyline', value: 27, color: '#0a0a0a' },
		{ key: 'datawell', label: 'Datawell', value: 21, color: '#343434' },
		{ key: 'cloudpeak', label: 'Cloudpeak', value: 13, color: '#555555' },
		{ key: 'taskbridge', label: 'Taskbridge', value: 21, color: '#777777' },
		{ key: 'insightloop', label: 'Insightloop', value: 6, color: '#999999' },
		{ key: 'streamforge', label: 'Streamforge', value: 12, color: '#b9b9b9' }
	] as const;

	const data = [...series].reverse().map(({ key, value }) => ({
		product: key,
		value,
		share: `${value}%`
	}));

	const config = Object.fromEntries(
		series.map(({ key, label, color }) => [
			key,
			{ label, colors: { light: [color], dark: [color === '#0a0a0a' ? '#ffffff' : color] } }
		])
	) satisfies ChartConfig;

	const total = series.reduce((sum, { value }) => sum + value, 0);
	let selected = $state<string | null>(null);

	function select(key: string) {
		selected = selected === key ? null : key;
	}
</script>

<div class="@container flex h-full w-full min-w-0 flex-col overflow-hidden p-3 sm:p-4">
	<div class="relative min-h-0 w-full flex-1">
		<EvilPieChart
			{data}
			{config}
			dataKey="value"
			nameKey="product"
			class="h-full w-full"
			selectedSector={selected}
			onSelectionChange={(selection) => (selected = selection?.dataKey ?? null)}
		>
			<EvilPieChart.Tooltip />
			<EvilPieChart.Pie
				isClickable
				innerRadius="52%"
				outerRadius="94%"
				paddingAngle={3}
				startAngle={90}
				endAngle={-270}
			>
				<EvilPieChart.Label dataKey="share" />
			</EvilPieChart.Pie>
		</EvilPieChart>

		<div
			class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5"
		>
			<span class="text-xl font-semibold tracking-tight text-primary @xl:text-3xl">${total}B</span>
			<span class="text-[10px] text-muted-foreground @xl:text-xs">Ecosystem value</span>
		</div>
	</div>

	<div
		class="mt-2 grid shrink-0 grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-2 sm:mt-3 sm:pt-3 @md:grid-flow-col @md:grid-rows-3 @md:gap-x-6"
	>
		{#each series as item (item.key)}
			<button
				type="button"
				aria-pressed={selected === item.key}
				onclick={() => select(item.key)}
				class="flex min-w-0 cursor-pointer items-center gap-1.5 text-left text-[10px] transition-opacity sm:gap-2 sm:text-xs"
				class:opacity-40={selected !== null && selected !== item.key}
			>
				<span class="size-2.5 shrink-0 rounded-[3px]" style:background={item.color}></span>
				<span class="truncate font-medium text-primary">{item.label}</span>
				<span class="ml-auto shrink-0 text-muted-foreground">${item.value}B</span>
			</button>
		{/each}
	</div>
</div>
