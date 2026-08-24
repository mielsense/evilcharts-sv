<script lang="ts">
	/**
	 * Isometric bar chart block.
	 *
	 * Each column is drawn as a front face plus two bevels, hatched over, with the tallest picked out
	 * in green. Built on `ChartContainer` plus LayerChart primitives, as the reference builds it on
	 * `ChartContainer` plus raw Recharts.
	 */
	import { Axis, Chart, Svg } from 'layerchart';
	import {
		ChartContainer,
		thinAxisTicks,
		type ChartConfig
	} from '$lib/registry/ui/layerchart-chart/index.js';
	import { ChartTooltip, ChartTooltipContent } from '$lib/registry/ui/layerchart-tooltip/index.js';
	import IsoBar from './b-isometric-bar-chart-bar.svelte';
	import IsoBarDefs from './b-isometric-bar-chart-defs.svelte';

	const chartData = [
		{ month: 'January', revenue: 28 },
		{ month: 'February', revenue: 34 },
		{ month: 'March', revenue: 22 },
		{ month: 'April', revenue: 41 },
		{ month: 'May', revenue: 47 },
		{ month: 'June', revenue: 31 },
		{ month: 'July', revenue: 38 }
	];

	const chartConfig = {
		revenue: {
			label: 'Revenue',
			colors: {
				light: ['#18181b'],
				dark: ['#fafafa']
			}
		}
	} satisfies ChartConfig;

	const BEVEL_OPACITY = 0.55;
	const HIGHLIGHT_COLOR = '#22c55e';
	const HIGHLIGHT_COLOR_DARK = '#15803d';

	/** Namespaces this instance's `<defs>` ids so several charts can coexist on a page. */
	const idPrefix = $props.id();

	const maxValue = chartData.reduce((m, d) => (d.revenue > m ? d.revenue : m), 0);
	const total = chartData.reduce((sum, d) => sum + d.revenue, 0);
	const peak = chartData.find((d) => d.revenue === maxValue)!;

	/** The band is keyed by row index so the axis can format it back to a month. */
	const INDEX_KEY = '__isoIndex';
	const rows = chartData.map((row, index) => ({ ...row, [INDEX_KEY]: index }));
	const formatMonth = (value: unknown) => String(rows[Number(value)]?.month ?? '').slice(0, 3);
</script>

<div class="flex h-full w-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[$] Total</span>
				<span class="font-mono text-3xl text-primary">
					<span class="text-xl font-normal text-muted-foreground">$</span>
					<span class="tracking-tighter">{total}K</span>
				</span>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Peak</span>
				<span class="font-mono text-3xl tracking-tighter text-primary">
					{peak.month.slice(0, 3)}
				</span>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground">
				// PROJECTION: <span class="text-primary">ISOMETRIC</span>
			</span>
			<span class="font-mono text-[10px] text-muted-foreground">
				// HIGHLIGHT: <span class="text-primary">MAX</span>
			</span>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<ChartContainer config={chartConfig}>
		<!--
			`margin={{ top: 30, right: 30 }}` in the reference leaves room for the bevels, which stick
			out above and to the right of every column. `yNice` is dropped in favour of the reference's
			`domain={[0, 'dataMax + 10']}`.
		-->
		<Chart
			data={rows}
			x={INDEX_KEY}
			series={[{ key: 'revenue', value: 'revenue' }]}
			seriesLayout="overlap"
			bandPadding={0}
			yBaseline={0}
			yDomain={[0, maxValue + 10]}
			padding={{ top: 30, right: 30, bottom: 30, left: 0 }}
			tooltipContext={{ mode: 'band' }}
			class="h-full w-full"
		>
			<Svg>
				<IsoBarDefs
					{idPrefix}
					bevelOpacity={BEVEL_OPACITY}
					highlightColor={HIGHLIGHT_COLOR}
					highlightColorDark={HIGHLIGHT_COLOR_DARK}
				/>
				<IsoBar dataKey="revenue" {rows} {maxValue} {idPrefix} />
				<Axis
					placement="bottom"
					rule={false}
					tickMarks={false}
					tickLength={10}
					ticks={thinAxisTicks({ format: formatMonth })}
					format={formatMonth}
				/>
			</Svg>
			<ChartTooltip>
				{#snippet children({ data })}
					<ChartTooltipContent
						active
						label={(data as Record<string, unknown>)?.month as string}
						payload={[
							{
								dataKey: 'revenue',
								name: 'revenue',
								value: (data as Record<string, unknown>)?.revenue as number,
								payload: data
							}
						]}
					>
						{#snippet formatter(value, name)}
							<div class="flex flex-1 items-center gap-2">
								<div
									class="size-2.5 shrink-0 rounded-[2px]"
									style="background: var(--color-revenue-0)"
								></div>
								<span class="flex-1 text-muted-foreground capitalize">{name}</span>
								<span class="font-mono font-medium text-foreground tabular-nums">
									${value}K
								</span>
							</div>
						{/snippet}
					</ChartTooltipContent>
				{/snippet}
			</ChartTooltip>
		</Chart>
	</ChartContainer>
</div>
