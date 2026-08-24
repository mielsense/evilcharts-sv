<script lang="ts">
	import { Bike, Gauge, Mountain, Moon, Zap } from '@lucide/svelte';
	import { EvilRadialChart } from '$lib/registry/charts/layerchart-radial-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const ride = { distance: 18.4, goal: 25, unit: 'km' };
	const metrics = [
		{ name: 'elevation', value: 312, goal: 450, unit: 'm', icon: Mountain, color: '#0284c7' },
		{ name: 'energy', value: 684, goal: 1200, unit: 'kJ', icon: Zap, color: '#d97706' },
		{ name: 'cadence', value: 82, goal: 95, unit: 'rpm', icon: Gauge, color: '#e11d48' }
	];
	const splits = [
		{ name: 'sprints', label: 'Sprints', value: '7', unit: 'efforts', color: '#7c3aed' },
		{ name: 'recovery', label: 'Recovery', value: '46', unit: 'min', color: '#0284c7' }
	];
	const config = Object.fromEntries(
		metrics.map(({ name, color }) => [
			name,
			{ label: name, colors: { light: [color], dark: [color] } }
		])
	) satisfies ChartConfig;
	const share = (value: number, goal: number) => Math.round((value / goal) * 100);
</script>

<div
	class="@container flex h-full w-full min-w-0 flex-col gap-2 overflow-hidden p-2 sm:p-4 @md:flex-row @md:gap-5"
>
	<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-2 sm:gap-3">
		<div class="flex shrink-0 flex-col items-center gap-1">
			<Bike class="size-4 text-[#7c3aed] sm:size-6" />
			<div class="flex items-baseline gap-1.5">
				<span
					class="text-2xl leading-none font-semibold tracking-tight text-primary tabular-nums sm:text-4xl"
					>{ride.distance}</span
				>
				<span class="text-xs font-medium text-muted-foreground sm:text-sm">{ride.unit} ridden</span>
			</div>
			<div class="h-1.5 w-full overflow-hidden rounded-full bg-muted sm:h-2">
				<div
					class="h-full rounded-full bg-[#7c3aed]"
					style:width={`${share(ride.distance, ride.goal)}%`}
				></div>
			</div>
		</div>

		<div class="grid min-h-0 flex-1 grid-cols-3 gap-2 border-t pt-1.5 sm:pt-2">
			{#each metrics as metric (metric.name)}
				<div class="flex min-h-0 min-w-0 flex-col items-center justify-center gap-1">
					<div class="relative min-h-0 w-full max-w-24 flex-1">
						<EvilRadialChart
							data={[{ name: metric.name, value: share(metric.value, metric.goal) }]}
							{config}
							nameKey="name"
							max={100}
							innerRadius="70%"
							outerRadius="100%"
							class="h-full w-full"
						>
							<EvilRadialChart.RadialBar dataKey="value" barSize={9} cornerRadius={6} />
						</EvilRadialChart>
						<span
							class="pointer-events-none absolute inset-0 flex items-center justify-center"
							style:color={metric.color}
						>
							<metric.icon class="size-4 sm:size-5" />
						</span>
					</div>
					<div class="flex shrink-0 items-baseline gap-1">
						<span class="text-[10px] font-semibold text-primary tabular-nums sm:text-sm"
							>{metric.value}</span
						>
						<span class="text-[9px] text-muted-foreground sm:text-[10px]">{metric.unit}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div
		class="flex shrink-0 gap-3 border-t pt-2 @md:w-[34%] @md:max-w-60 @md:border-t-0 @md:border-l @md:pt-0 @md:pl-5"
	>
		{#each splits as split, index (split.name)}
			<div
				class="flex min-w-0 flex-1 flex-col justify-between gap-1.5"
				class:border-l={index > 0}
				class:pl-3={index > 0}
			>
				{#if split.name === 'recovery'}
					<Moon class="size-4 shrink-0" style={`color:${split.color}`} />
				{:else}
					<Zap class="size-4 shrink-0" style={`color:${split.color}`} />
				{/if}
				<div class="flex min-w-0 flex-col gap-0.5">
					<span
						class="truncate text-[9px] tracking-wider text-muted-foreground uppercase sm:text-[10px]"
						>{split.label}</span
					>
					<div class="flex items-baseline gap-1">
						<span class="text-lg leading-none font-semibold text-primary tabular-nums sm:text-2xl"
							>{split.value}</span
						>
						<span class="text-[10px] text-muted-foreground">{split.unit}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
