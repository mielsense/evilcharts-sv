<script lang="ts">
	import { EvilComposedChart } from '../../charts/layerchart-composed-chart/index.js';
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';

	const data = [
		{ date: 'Jan 1', actual: 240, target: 125 },
		{ date: 'Jan 8', actual: 240, target: 125 },
		{ date: 'Jan 15', actual: 175, target: 200 },
		{ date: 'Jan 22', actual: 175, target: 200 },
		{ date: 'Feb 1', actual: 175, target: 200 },
		{ date: 'Feb 8', actual: 260, target: 125 },
		{ date: 'Feb 15', actual: 260, target: 125 },
		{ date: 'Feb 22', actual: 260, target: 125 },
		{ date: 'Mar 1', actual: 260, target: 190 },
		{ date: 'Mar 8', actual: 335, target: 190 },
		{ date: 'Mar 15', actual: 335, target: 190 },
		{ date: 'Mar 22', actual: 335, target: 390 },
		{ date: 'Apr 1', actual: 335, target: 390 },
		{ date: 'Apr 8', actual: 335, target: 390 },
		{ date: 'Apr 15', actual: 190, target: 390 },
		{ date: 'Apr 22', actual: 215, target: 305 },
		{ date: 'May 1', actual: 215, target: 305 },
		{ date: 'May 8', actual: 215, target: 175 },
		{ date: 'May 15', actual: 215, target: 175 },
		{ date: 'May 22', actual: 275, target: 175 },
		{ date: 'Jun 1', actual: 275, target: 245 }
	];
	const config = {
		actual: { label: 'Actual', colors: { light: ['#ff3e00'], dark: ['#ff5a1f'] } },
		target: { label: 'Target', colors: { light: ['#737373'], dark: ['#a3a3a3'] } }
	} satisfies ChartConfig;
	const latest = data.at(-1)!;
	const delta = ((latest.actual - latest.target) / latest.target) * 100;
</script>

<section
	class="flex size-full min-h-0 flex-col overflow-hidden p-3 sm:p-4"
	data-block="signups-composed-chart"
>
	<header class="flex shrink-0 items-start justify-between gap-4">
		<div>
			<span class="block text-[11px] text-muted-foreground">Weekly signups</span>
			<strong class="text-2xl tracking-tight sm:text-3xl">{latest.actual}</strong>
			<span class="ml-2 text-[11px] font-medium text-[#ff3e00] sm:text-sm"
				>+{delta.toFixed(1)}% vs target</span
			>
		</div>
		<div class="rounded-md border px-2.5 py-1.5 text-right">
			<span class="block text-[9px] tracking-wider text-muted-foreground uppercase">Target</span>
			<strong class="text-base">{latest.target}</strong>
		</div>
	</header>
	<div class="mt-2 min-h-0 flex-1 overflow-hidden sm:mt-3">
		<EvilComposedChart {data} {config} xDataKey="date" class="size-full" curveType="step">
			<EvilComposedChart.Grid />
			<EvilComposedChart.XAxis
				dataKey="date"
				tickFormatter={(value) => (String(value).endsWith(' 1') ? String(value).split(' ')[0] : '')}
			/>
			<EvilComposedChart.YAxis />
			<EvilComposedChart.Tooltip />
			<EvilComposedChart.Bar dataKey="actual" variant="gradient" radius={2} />
			<EvilComposedChart.Line dataKey="target" strokeVariant="dashed">
				<EvilComposedChart.ActiveDot variant="border" />
			</EvilComposedChart.Line>
		</EvilComposedChart>
	</div>
</section>
