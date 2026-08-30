<script lang="ts">
	import { EChartsPieChart } from '$lib/registry/charts/echarts-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const series = [
		{
			key: 'skyline',
			label: 'Skyline',
			value: 27,
			swatch: 'bg-[#0a0a0a] dark:bg-[#ffffff]'
		},
		{
			key: 'datawell',
			label: 'Datawell',
			value: 21,
			swatch: 'bg-[#262626] dark:bg-[#dedede]'
		},
		{
			key: 'cloudpeak',
			label: 'Cloudpeak',
			value: 13,
			swatch: 'bg-[#3d3d3d] dark:bg-[#bebebe]'
		},
		{
			key: 'taskbridge',
			label: 'Taskbridge',
			value: 21,
			swatch: 'bg-[#545454] dark:bg-[#a0a0a0]'
		},
		{
			key: 'insightloop',
			label: 'Insightloop',
			value: 6,
			swatch: 'bg-[#6b6b6b] dark:bg-[#868686]'
		},
		{
			key: 'streamforge',
			label: 'Streamforge',
			value: 12,
			swatch: 'bg-[#7d7d7d] dark:bg-[#6f6f6f]'
		}
	] as const;

	const data = [...series].reverse().map(({ key, value }) => ({
		product: key,
		value,
		share: `${value}%`
	}));

	const config = {
		skyline: { label: 'Skyline', colors: { light: ['#0a0a0a'], dark: ['#ffffff'] } },
		datawell: { label: 'Datawell', colors: { light: ['#262626'], dark: ['#dedede'] } },
		cloudpeak: { label: 'Cloudpeak', colors: { light: ['#3d3d3d'], dark: ['#bebebe'] } },
		taskbridge: { label: 'Taskbridge', colors: { light: ['#545454'], dark: ['#a0a0a0'] } },
		insightloop: { label: 'Insightloop', colors: { light: ['#6b6b6b'], dark: ['#868686'] } },
		streamforge: { label: 'Streamforge', colors: { light: ['#7d7d7d'], dark: ['#6f6f6f'] } }
	} satisfies ChartConfig;

	const total = series.reduce((sum, { value }) => sum + value, 0);
	let selected = $state<string | null>(null);

	function select(key: string) {
		selected = selected === key ? null : key;
	}
</script>

<div class="@container flex h-full w-full flex-col p-4">
	<div class="relative min-h-0 w-full flex-1">
		<EChartsPieChart
			{data}
			{config}
			dataKey="value"
			nameKey="product"
			class="h-full w-full"
			selectedSector={selected}
			onSelectionChange={(selection) => (selected = selection?.dataKey ?? null)}
		>
			<EChartsPieChart.Tooltip />
			<EChartsPieChart.Pie
				isClickable
				innerRadius="52%"
				outerRadius="94%"
				paddingAngle={3}
				startAngle={90}
				endAngle={-270}
			>
				<EChartsPieChart.Label dataKey="share" />
			</EChartsPieChart.Pie>
		</EChartsPieChart>

		<div
			class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5"
		>
			<span class="text-xl font-semibold tracking-tight text-primary @xl:text-3xl">${total}B</span>
			<span class="text-[10px] text-muted-foreground @xl:text-xs">Ecosystem value</span>
		</div>
	</div>

	<div
		class="mt-3 grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-6 gap-y-1.5 border-t border-border pt-3"
	>
		{#each series as item (item.key)}
			<button
				type="button"
				aria-pressed={selected === item.key}
				onclick={() => select(item.key)}
				class={[
					'flex cursor-pointer items-center gap-2 text-left text-xs transition-opacity',
					selected !== null && selected !== item.key && 'opacity-40'
				]}
			>
				<span class={`size-3 shrink-0 rounded-[3px] ${item.swatch}`}></span>
				<span class="font-medium text-primary">{item.label}</span>
				<span class="text-muted-foreground">${item.value}B</span>
				<span class="text-muted-foreground/60">({item.value}%)</span>
			</button>
		{/each}
	</div>
</div>
