<script lang="ts">
	import { EChartsPieChart } from '$lib/registry/charts/echarts-pie-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const dotCount = 40;
	const sectorCount = dotCount * 2;
	const stats = [
		{ id: 'support', value: 48, caption: 'Additional support requests from users.' },
		{ id: 'forecast', value: 67, caption: 'Inaccurate forecasts disrupt planning.' }
	] as const;
	const filledColors = { light: ['#E43861'], dark: ['#E43861'] };
	const trackColors = { light: ['#d4d4d4'], dark: ['#3f3f3f'] };
	const gapColors = { light: ['transparent'], dark: ['transparent'] };

	const dataFor = (id: string) =>
		Array.from({ length: sectorCount }, (_, index) => ({ dot: `${id}-${index}`, value: 1 }));

	function configFor(id: string, value: number): ChartConfig {
		const filled = Math.round((dotCount * value) / 100);
		return Object.fromEntries(
			Array.from({ length: sectorCount }, (_, index) => {
				const colors = index % 2 ? gapColors : index / 2 < filled ? filledColors : trackColors;
				return [`${id}-${index}`, { label: '', colors }];
			})
		);
	}
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex items-start justify-between gap-4">
		<div class="flex flex-col gap-0.5">
			<span class="text-[10px] tracking-wide text-muted-foreground uppercase">User research</span>
			<span class="text-base leading-tight font-medium tracking-tight text-primary sm:text-xl"
				>Where the workday leaks</span
			>
		</div>
		<span class="shrink-0 text-[10px] text-muted-foreground sm:text-xs">1,240 responses</span>
	</div>

	<div class="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-4">
		{#each stats as stat (stat.id)}
			<div class="relative min-h-0">
				<EChartsPieChart
					data={dataFor(stat.id)}
					config={configFor(stat.id, stat.value)}
					dataKey="value"
					nameKey="dot"
					class="h-full w-full"
				>
					<EChartsPieChart.Pie
						innerRadius="85%"
						outerRadius="92%"
						paddingAngle={0}
						cornerRadius={6}
						startAngle={90}
						endAngle={-270}
					/>
				</EChartsPieChart>

				<div
					class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[radial-gradient(circle_closest-side,rgba(0,0,0,0.04)_0_79%,transparent_79%)] px-[25%] text-center dark:bg-[radial-gradient(circle_closest-side,rgba(255,255,255,0.05)_0_79%,transparent_79%)]"
				>
					<span class="text-2xl leading-none font-medium tracking-tight text-primary sm:text-4xl"
						>{stat.value}%</span
					>
					<span class="text-[10px] leading-snug text-balance text-muted-foreground sm:text-xs"
						>{stat.caption}</span
					>
				</div>
			</div>
		{/each}
	</div>
</div>
