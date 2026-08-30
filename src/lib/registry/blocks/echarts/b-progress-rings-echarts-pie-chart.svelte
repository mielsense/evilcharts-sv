<script lang="ts">
	import { EChartsPieChart } from '$lib/registry/charts/echarts-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const dotCount = 40;
	const sectorCount = dotCount * 2;
	const stats = [
		{ id: 'support', value: 48, caption: 'Additional support requests from users.' },
		{ id: 'forecast', value: 67, caption: 'Inaccurate forecasts disrupt planning.' }
	] as const;
	const dataFor = (id: string) =>
		Array.from({ length: sectorCount }, (_, index) => ({ dot: `${id}-${index}`, value: 1 }));

	function configFor(id: string, value: number): ChartConfig {
		const filled = Math.round((dotCount * value) / 100);
		return Object.fromEntries(
			Array.from({ length: sectorCount }, (_, index) => {
				const color = index % 2 ? 'transparent' : index / 2 < filled ? '#e43861' : '#404040';
				return [`${id}-${index}`, { label: '', colors: { light: [color], dark: [color] } }];
			})
		);
	}
</script>

<div class="@container flex h-full w-full min-w-0 flex-col overflow-hidden p-3 sm:p-4">
	<div class="flex shrink-0 items-start justify-between gap-3">
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="text-[10px] tracking-wide text-muted-foreground uppercase">User research</span>
			<span
				class="truncate text-base leading-tight font-medium tracking-tight text-primary sm:text-xl"
				>Where the workday leaks</span
			>
		</div>
		<span class="shrink-0 text-[10px] text-muted-foreground sm:text-xs">1,240 responses</span>
	</div>

	<div class="mt-2 grid min-h-0 flex-1 grid-cols-2 gap-2 sm:mt-3 sm:gap-4">
		{#each stats as stat (stat.id)}
			<div class="relative min-h-0 min-w-0">
				<EChartsPieChart
					data={dataFor(stat.id)}
					config={configFor(stat.id, stat.value)}
					dataKey="value"
					nameKey="dot"
					class="h-full w-full"
				>
					<EChartsPieChart.Pie innerRadius="85%" outerRadius="92%" cornerRadius={6} />
				</EChartsPieChart>

				<div
					class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-[22%] text-center"
				>
					<span class="text-2xl leading-none font-medium tracking-tight text-primary sm:text-4xl"
						>{stat.value}%</span
					>
					<span class="text-[9px] leading-snug text-balance text-muted-foreground sm:text-xs"
						>{stat.caption}</span
					>
				</div>
			</div>
		{/each}
	</div>
</div>
