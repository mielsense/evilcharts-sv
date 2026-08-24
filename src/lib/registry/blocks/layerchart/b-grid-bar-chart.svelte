<script lang="ts">
	/**
	 * Grid bar chart block.
	 *
	 * Each column is a stack of 10x10 squares — ghost squares for the full plot height, solid ones
	 * up to the value. Built on `ChartContainer` plus LayerChart primitives, as the reference builds
	 * it on `ChartContainer` plus raw Recharts.
	 */
	import { Axis, Chart, Svg } from 'layerchart';
	import {
		ChartContainer,
		thinAxisTicks,
		type ChartConfig
	} from '$lib/registry/ui/layerchart-chart/index.js';
	import GridBar from './b-grid-bar-chart-bar.svelte';

	const chartData = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 305 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 273 },
		{ month: 'May', desktop: 209 },
		{ month: 'June', desktop: 346 },
		{ month: 'July', desktop: 181 },
		{ month: 'August', desktop: 392 },
		{ month: 'September', desktop: 298 },
		{ month: 'October', desktop: 215 },
		{ month: 'November', desktop: 327 },
		{ month: 'December', desktop: 162 }
	];

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: {
				light: ['#18181b'],
				dark: ['#fafafa']
			}
		}
	} satisfies ChartConfig;

	const seriesKeys = Object.keys(chartConfig);

	const total = chartData.reduce((sum, item) => sum + item.desktop, 0);
	const maxData = chartData.reduce(
		(max, item, index) =>
			item.desktop > max.value ? { index, month: item.month, value: item.desktop } : max,
		{ index: 0, month: chartData[0].month, value: chartData[0].desktop }
	);

	/** The band is keyed by row index so the axis can format it back to a month. */
	const INDEX_KEY = '__gridIndex';
	const rows = chartData.map((row, index) => ({ ...row, [INDEX_KEY]: index }));
	const formatMonth = (value: unknown) => String(rows[Number(value)]?.month ?? '').slice(0, 3);
</script>

<div class="flex h-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[Σ] Total</span>
				<span class="font-mono text-3xl tracking-tighter text-primary">
					{total.toLocaleString()}
				</span>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Peak</span>
				<span class="font-mono text-3xl tracking-tighter text-primary">
					{maxData.month.slice(0, 3)}
				</span>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground">
				// CELL: <span class="text-primary">10x10px</span>
			</span>
			<span class="font-mono text-[10px] text-muted-foreground">
				// TYPE: <span class="text-primary">GRID</span>
			</span>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<ChartContainer config={chartConfig}>
		<Chart
			data={rows}
			x={INDEX_KEY}
			series={seriesKeys.map((key) => ({ key, value: key }))}
			seriesLayout="overlap"
			bandPadding={0}
			yBaseline={0}
			yNice
			padding={{ top: 5, right: 5, bottom: 35, left: 5 }}
			tooltipContext={{ mode: 'band' }}
			class="h-full w-full"
		>
			<Svg>
				{#each seriesKeys as key (key)}
					<GridBar dataKey={key} {rows} fill={`var(--color-${key}-0)`} />
				{/each}
				<Axis
					placement="bottom"
					rule={false}
					tickMarks={false}
					tickLength={10}
					ticks={thinAxisTicks({ format: formatMonth })}
					format={formatMonth}
				/>
			</Svg>
		</Chart>
	</ChartContainer>
</div>
