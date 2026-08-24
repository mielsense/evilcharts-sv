<script lang="ts">
	import { EvilRadialChart } from '$lib/registry/charts/layerchart-radial-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const total = 1000;
	const tiers = [
		{ name: 'memory', label: 'L1 Memory', count: 610, color: '#dc2626' },
		{ name: 'regional', label: 'L2 Regional', count: 240, color: '#d97706' },
		{ name: 'overflow', label: 'Edge Overflow', count: 100, color: '#2563eb' },
		{ name: 'origin', label: 'Origin Fetch', count: 50, color: '#94a3b8' }
	];
	const stats = [
		{ name: 'warm', label: 'Served Warm', value: 9150 },
		{ name: 'revalidated', label: 'Revalidated', value: 1280 },
		{ name: 'evictions', label: 'Evictions', value: 412 },
		{ name: 'purges', label: 'Purges', value: 96 }
	];
	const config = Object.fromEntries(
		tiers.map(({ name, label, color }) => [
			name,
			{ label, colors: { light: [color], dark: [color] } }
		])
	) satisfies ChartConfig;
	const data = [...tiers]
		.reverse()
		.map(({ name, count }) => ({ name, share: (count / total) * 100 }));
	const count = (value: number) => value.toLocaleString('en-US');
</script>

<div
	class="@container flex h-full w-full min-w-0 flex-col gap-2 overflow-hidden p-3 sm:gap-3 sm:p-4"
>
	<div class="flex min-h-0 flex-1 gap-2 sm:gap-4">
		<div class="relative min-h-0 min-w-0 flex-1 sm:-mb-10">
			<EvilRadialChart
				{data}
				{config}
				nameKey="name"
				variant="semi"
				max={100}
				innerRadius="38%"
				outerRadius="96%"
				class="h-full w-full"
			>
				<EvilRadialChart.RadialBar dataKey="share" barSize={10} cornerRadius={6} />
			</EvilRadialChart>
		</div>

		<div
			class="grid w-[43%] shrink-0 grid-cols-2 content-center gap-x-2 gap-y-3 sm:max-w-64 sm:gap-x-4 sm:gap-y-5"
		>
			{#each stats as stat (stat.name)}
				<div class="flex min-w-0 flex-col gap-1">
					<span class="truncate text-[9px] text-muted-foreground sm:text-sm">{stat.label}</span>
					<span class="text-sm leading-none font-medium text-primary tabular-nums sm:text-xl"
						>{count(stat.value)}</span
					>
				</div>
			{/each}
		</div>
	</div>

	<div
		class="grid shrink-0 grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-2 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-3 sm:pt-3"
	>
		{#each tiers as tier (tier.name)}
			<div class="flex min-w-0 flex-col gap-0.5 sm:gap-1">
				<div class="flex min-w-0 items-center gap-1.5">
					<span class="size-2.5 shrink-0 rounded-[3px]" style:background={tier.color}></span>
					<span class="truncate text-[10px] text-primary sm:text-xs">{tier.label}</span>
				</div>
				<span class="truncate text-[9px] text-muted-foreground tabular-nums sm:text-xs"
					>{count(tier.count)}/{count(total)} ({Math.round((tier.count / total) * 100)}%)</span
				>
			</div>
		{/each}
	</div>
</div>
