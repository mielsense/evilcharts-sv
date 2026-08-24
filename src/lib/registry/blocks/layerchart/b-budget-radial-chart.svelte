<script lang="ts">
	import { EvilRadialChart } from '$lib/registry/charts/layerchart-radial-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const data = [
		{ name: 'payroll', label: 'Payroll', value: 46, amount: 920000, color: '#d97706' },
		{
			name: 'infrastructure',
			label: 'Infrastructure',
			value: 21,
			amount: 420000,
			color: '#2563eb'
		},
		{ name: 'marketing', label: 'Marketing', value: 14, amount: 280000, color: '#e11d48' },
		{ name: 'tooling', label: 'Tooling', value: 10, amount: 200000, color: '#64748b' },
		{ name: 'support', label: 'Support', value: 9, amount: 180000, color: '#0d9488' }
	];
	const config = Object.fromEntries(
		data.map(({ name, label, color }) => [
			name,
			{ label, colors: { light: [color], dark: [color] } }
		])
	) satisfies ChartConfig;
	const total = data.reduce((sum, { amount }) => sum + amount, 0);
	const money = (value: number) => value.toLocaleString('en-US');
</script>

<div
	class="@container flex h-full w-full min-w-0 flex-col gap-3 overflow-hidden p-3 sm:gap-5 sm:p-4"
>
	<div class="flex shrink-0 items-baseline justify-between gap-3">
		<span class="truncate text-base font-medium tracking-tight text-primary sm:text-lg"
			>Quarterly Spend</span
		>
		<span class="shrink-0 text-[10px] text-muted-foreground sm:text-xs">${money(total)}</span>
	</div>

	<div class="grid shrink-0 grid-cols-5 gap-1.5 sm:gap-2">
		{#each data as row (row.name)}
			<div class="flex min-w-0 flex-col items-center gap-1">
				<div class="aspect-square w-full max-w-14">
					<EvilRadialChart
						data={[row]}
						{config}
						nameKey="name"
						max={100}
						innerRadius="66%"
						outerRadius="100%"
						class="h-full w-full"
					>
						<EvilRadialChart.RadialBar dataKey="value" barSize={8} cornerRadius={6} />
					</EvilRadialChart>
				</div>
				<span class="w-full truncate text-center text-[9px] text-muted-foreground sm:text-[11px]"
					>{row.label}</span
				>
			</div>
		{/each}
	</div>

	<div class="flex min-h-0 flex-1 flex-col">
		{#each data as item (item.name)}
			<div class="flex min-h-0 flex-1 items-center gap-2 rounded-md px-2 odd:bg-muted/30 sm:px-3">
				<span class="size-2.5 shrink-0 rounded-[3px]" style:background={item.color}></span>
				<span class="text-[10px] font-medium text-primary tabular-nums sm:text-xs"
					>{item.value}%</span
				>
				<span class="truncate text-[10px] text-muted-foreground sm:text-xs">{item.label}</span>
				<span class="ml-auto shrink-0 text-[10px] font-medium text-primary sm:text-xs"
					>${money(item.amount)}</span
				>
			</div>
		{/each}
	</div>
</div>
