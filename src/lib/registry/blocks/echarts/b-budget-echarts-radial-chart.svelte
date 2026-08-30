<script lang="ts">
	import { EChartsRadialChart } from '$lib/registry/charts/echarts-radial-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/echarts-chart/index.js';

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

<div class="flex h-full w-full flex-col gap-6 p-4">
	<div class="flex items-baseline justify-between gap-4">
		<span class="text-base font-medium tracking-tight text-primary sm:text-lg">Quarterly Spend</span
		>
		<span class="text-xs text-muted-foreground">${money(total)}</span>
	</div>

	<div class="grid shrink-0 grid-cols-5 gap-2">
		{#each data as row (row.name)}
			<div class="flex flex-col items-center gap-1">
				<div class="aspect-square w-full max-w-14">
					<EChartsRadialChart
						data={[row]}
						{config}
						nameKey="name"
						max={100}
						innerRadius="66%"
						outerRadius="100%"
						class="h-full w-full"
					>
						<EChartsRadialChart.RadialBar dataKey="value" barSize={8} cornerRadius={6} />
					</EChartsRadialChart>
				</div>
				<span class="w-full truncate text-center text-[10px] text-muted-foreground sm:text-[11px]"
					>{row.label}</span
				>
			</div>
		{/each}
	</div>

	<div class="flex min-h-0 flex-1 flex-col">
		{#each data as item (item.name)}
			<div class="flex flex-1 items-center gap-2 rounded-md px-3 odd:bg-muted/30">
				<span class="size-2.5 shrink-0 rounded-[3px]" style:background={item.color}></span>
				<span class="text-xs font-medium text-primary tabular-nums">{item.value}%</span>
				<span class="truncate text-xs text-muted-foreground">{item.label}</span>
				<span class="ml-auto text-xs font-medium text-primary">${money(item.amount)}</span>
			</div>
		{/each}
	</div>
</div>
