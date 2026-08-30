<script lang="ts">
	import { EChartsRadialChart } from '$lib/registry/charts/echarts-radial-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

	const ride = { distance: 18.4, goal: 25, unit: 'km' };
	const metrics = [
		{
			name: 'elevation',
			value: 312,
			goal: 450,
			unit: 'm',
			tint: 'text-[#0284c7] dark:text-[#38bdf8]'
		},
		{
			name: 'energy',
			value: 684,
			goal: 1200,
			unit: 'kJ',
			tint: 'text-[#d97706] dark:text-[#fbbf24]'
		},
		{
			name: 'cadence',
			value: 82,
			goal: 95,
			unit: 'rpm',
			tint: 'text-[#e11d48] dark:text-[#fb7185]'
		}
	];
	const splits = [
		{
			name: 'sprints',
			label: 'Sprints',
			value: '7',
			unit: 'efforts',
			tint: 'text-[#7c3aed] dark:text-[#a78bfa]'
		},
		{
			name: 'recovery',
			label: 'Recovery',
			value: '46',
			unit: 'min',
			tint: 'text-[#0284c7] dark:text-[#38bdf8]'
		}
	];
	const config = {
		elevation: {
			label: 'Elevation',
			colors: { light: ['#0ea5e9', '#0284c7'], dark: ['#38bdf8', '#0ea5e9'] }
		},
		energy: {
			label: 'Energy',
			colors: { light: ['#f59e0b', '#d97706'], dark: ['#fbbf24', '#f59e0b'] }
		},
		cadence: {
			label: 'Cadence',
			colors: { light: ['#f43f5e', '#e11d48'], dark: ['#fb7185', '#f43f5e'] }
		}
	} satisfies ChartConfig;
	const share = (value: number, goal: number) => Math.round((value / goal) * 100);
</script>

<div class="flex h-full w-full flex-col gap-2 p-2 sm:flex-row sm:gap-5 sm:p-4">
	<div class="flex min-h-0 flex-1 flex-col gap-2 sm:gap-4">
		<div class="flex shrink-0 flex-col items-center gap-1 sm:gap-2">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-4 text-[#7c3aed] sm:size-7 dark:text-[#a78bfa]"
				aria-hidden="true"
			>
				<circle cx="5.5" cy="17.5" r="3.5" />
				<circle cx="18.5" cy="17.5" r="3.5" />
				<circle cx="15.5" cy="4.5" r="1" />
				<path d="M12 17.5V14L9 11l4-3 2 3h2.5" />
			</svg>
			<div class="flex items-baseline gap-1.5">
				<span
					class="text-2xl leading-none font-semibold tracking-tight text-primary tabular-nums sm:text-4xl"
					>{ride.distance}</span
				>
				<span class="text-sm font-medium text-muted-foreground">{ride.unit} ridden</span>
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full bg-muted sm:h-2.5">
				<div
					class="h-full rounded-full bg-[#7c3aed] dark:bg-[#a78bfa]"
					style:width={`${share(ride.distance, ride.goal)}%`}
				></div>
			</div>
		</div>

		<div class="grid min-h-0 flex-1 grid-cols-3 gap-2 border-t pt-1.5 sm:pt-3">
			{#each metrics as metric (metric.name)}
				<div class="flex min-h-0 flex-col items-center justify-center gap-1 sm:gap-2">
					<div
						class="relative min-h-0 w-full max-w-[104px] flex-1 sm:aspect-square sm:min-h-auto sm:flex-initial"
					>
						<EChartsRadialChart
							data={[{ name: metric.name, value: share(metric.value, metric.goal) }]}
							{config}
							nameKey="name"
							max={100}
							innerRadius="70%"
							outerRadius="100%"
							class="h-full w-full"
						>
							<EChartsRadialChart.RadialBar dataKey="value" barSize={9} cornerRadius={6} />
						</EChartsRadialChart>
						<span
							class={`pointer-events-none absolute inset-0 flex items-center justify-center ${metric.tint}`}
						>
							{#if metric.name === 'elevation'}
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="size-5 sm:size-6"
									aria-hidden="true"
								>
									<path d="M2.5 19h19L14 5.5l-3.5 6.5L8.5 9.5 2.5 19Z" />
								</svg>
							{:else if metric.name === 'energy'}
								<svg
									viewBox="0 0 24 24"
									fill="currentColor"
									class="size-5 sm:size-6"
									aria-hidden="true"
								>
									<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" />
								</svg>
							{:else}
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="size-5 sm:size-6"
									aria-hidden="true"
								>
									<path d="M3.5 17.5a8.5 8.5 0 1 1 17 0" />
									<path d="M12 17.5 15.5 10.5" />
									<circle cx="12" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
								</svg>
							{/if}
						</span>
					</div>
					<div class="flex shrink-0 items-baseline gap-1">
						<span class="text-xs font-semibold text-primary tabular-nums sm:text-base"
							>{metric.value}</span
						>
						<span class="text-[11px] text-muted-foreground">{metric.unit}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div
		class="flex shrink-0 gap-3 border-t pt-2 sm:w-[34%] sm:max-w-60 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5"
	>
		{#each splits as split, index (split.name)}
			<div
				class={[
					'flex flex-1 flex-col justify-between gap-1.5 sm:gap-3',
					index > 0 && 'border-l pl-3'
				]}
			>
				{#if split.name === 'recovery'}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
						class={`size-4 shrink-0 sm:size-6 ${split.tint}`}
						aria-hidden="true"
					>
						<path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
					</svg>
				{:else}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.9"
						stroke-linecap="round"
						stroke-linejoin="round"
						class={`size-4 shrink-0 sm:size-6 ${split.tint}`}
						aria-hidden="true"
					>
						<path d="M6 14.5 12 8.5l6 6" />
						<path d="M6 19.5 12 13.5l6 6" />
					</svg>
				{/if}
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-muted-foreground uppercase"
						>{split.label}</span
					>
					<div class="flex items-baseline gap-1">
						<span class="text-xl leading-none font-semibold text-primary tabular-nums sm:text-2xl"
							>{split.value}</span
						>
						<span class="text-[11px] text-muted-foreground">{split.unit}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
