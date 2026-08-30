<script lang="ts">
	/**
	 * Monospace bar chart block.
	 *
	 * Built on `ChartContainer` plus LayerChart primitives rather than `EvilBarChart`, exactly as
	 * the reference builds it on `ChartContainer` plus raw Recharts — a block is a self-contained
	 * composition, not a configuration of the chart component.
	 */
	import { Axis, Chart, Svg, type ChartState } from 'layerchart';
	import {
		chartColorVariable,
		ChartContainer,
		thinAxisTicks,
		type ChartConfig
	} from '$lib/registry/ui/layerchart-chart/index.js';
	import MonospaceBar from './b-monospace-bar-chart-bar.svelte';

	const chartData = [
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 876 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 },
		{ month: 'May', desktop: 458 },
		{ month: 'June', desktop: 781 },
		{ month: 'July', desktop: 394 },
		{ month: 'August', desktop: 925 },
		{ month: 'September', desktop: 647 },
		{ month: 'October', desktop: 532 },
		{ month: 'November', desktop: 803 },
		{ month: 'December', desktop: 271 },
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 876 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 },
		{ month: 'May', desktop: 458 },
		{ month: 'June', desktop: 781 },
		{ month: 'July', desktop: 394 },
		{ month: 'August', desktop: 925 },
		{ month: 'September', desktop: 647 },
		{ month: 'October', desktop: 532 },
		{ month: 'November', desktop: 803 },
		{ month: 'December', desktop: 271 }
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

	/**
	 * The reference's data repeats the twelve months twice, so a category *name* is not unique —
	 * the band scale is keyed by row index and the axis formats that index back to a month.
	 */
	const INDEX_KEY = '__monospaceIndex';
	const rows = chartData.map((row, index) => ({ ...row, [INDEX_KEY]: index }));

	/** Twenty-four categories do not all fit, so the axis thins them as Recharts does. */
	const formatMonth = (value: unknown) => String(rows[Number(value)]?.month ?? '').slice(0, 3);

	/** LayerChart's chart state, read for the row the pointer is over. */
	let layerContext = $state<ChartState<Record<string, unknown>> | undefined>(undefined);
	const activeRow = $derived(layerContext?.tooltip?.data as Record<string, unknown> | undefined);
</script>

<div class="flex h-full flex-col p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-row">
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[$] Total Sales</span>
				<span class="font-mono text-3xl text-primary">
					<span class="text-xl font-normal text-muted-foreground">$</span>
					<span class="tracking-tighter">14,340</span>
				</span>
			</div>
			<hr class="mx-4 h-full border-l border-dashed" />
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs text-muted-foreground">[⬆] Top Month</span>
				<span class="font-mono text-3xl text-primary">
					<span class="tracking-tighter">June</span>
				</span>
			</div>
		</div>
		<div class="flex flex-col justify-end gap-1">
			<span class="font-mono text-[10px] text-muted-foreground">
				// X-AXIS: <span class="text-primary">MONTHS</span>
			</span>
			<span class="font-mono text-[10px] text-muted-foreground">
				// Y-AXIS: <span class="text-primary">SALES</span>
			</span>
		</div>
	</div>
	<hr class="my-4 border-t border-dashed" />
	<ChartContainer config={chartConfig}>
		<Chart
			bind:context={layerContext}
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
					<MonospaceBar dataKey={key} {rows} {activeRow} fill={chartColorVariable(key, 0)} />
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
