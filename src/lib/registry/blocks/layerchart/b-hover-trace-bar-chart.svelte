<script lang="ts">
	/**
	 * Hover-trace bar chart block.
	 *
	 * Hovering a column dims the rest, springs a dashed reference line to that column's value, and
	 * rolls the headline figure to it. Built on `ChartContainer` plus LayerChart primitives, as the
	 * reference builds it on `ChartContainer` plus raw Recharts.
	 */
	import { Axis, Chart, Svg, type ChartState } from 'layerchart';
	import { useMotionValueEvent, useReducedMotion, useSpring } from '@humanspeak/svelte-motion';
	import { onDestroy } from 'svelte';
	import NumberFlow from '@number-flow/svelte';
	import {
		ChartContainer,
		thinAxisTicks,
		type ChartConfig
	} from '$lib/registry/ui/layerchart-chart/index.js';
	import HoverTraceBar from './b-hover-trace-bar-chart-bar.svelte';
	import HoverTraceTrace from './b-hover-trace-bar-chart-trace.svelte';

	const CHART_MARGIN = 38;

	const chartData = [
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 676 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 },
		{ month: 'May', desktop: 458 },
		{ month: 'June', desktop: 781 },
		{ month: 'July', desktop: 394 },
		{ month: 'August', desktop: 924 },
		{ month: 'September', desktop: 647 },
		{ month: 'October', desktop: 532 },
		{ month: 'November', desktop: 803 },
		{ month: 'December', desktop: 271 },
		{ month: 'January', desktop: 342 },
		{ month: 'February', desktop: 876 },
		{ month: 'March', desktop: 512 },
		{ month: 'April', desktop: 629 }
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

	/** The band is keyed by row index — the months repeat, so a name is not unique. */
	const INDEX_KEY = '__traceIndex';
	const rows = chartData.map((row, index) => ({ ...row, [INDEX_KEY]: index }));
	const formatMonth = (value: unknown) => String(rows[Number(value)]?.month ?? '').slice(0, 3);

	const maxData = chartData.reduce(
		(max, item, index) =>
			item.desktop > max.value ? { index, month: item.month, value: item.desktop } : max,
		{ index: 0, month: chartData[0].month, value: chartData[0].desktop }
	);

	/** LayerChart's chart state, read for the column under the pointer. */
	let layerContext = $state<ChartState<Record<string, unknown>> | undefined>(undefined);
	const activeRow = $derived(layerContext?.tooltip?.data as Record<string, unknown> | undefined);
	const activeIndex = $derived(activeRow ? (activeRow[INDEX_KEY] as number) : null);

	const selectedData = $derived(
		activeIndex != null && chartData[activeIndex]
			? {
					index: activeIndex,
					month: chartData[activeIndex].month,
					value: chartData[activeIndex].desktop
				}
			: maxData
	);

	/** The reference's spring, so the trace line eases between columns. */
	const valueSpring = useSpring(maxData.value, { stiffness: 110, damping: 20 });
	const shouldReduceMotion = useReducedMotion();
	let springValue = $state(maxData.value);

	const stopValueSync = useMotionValueEvent(valueSpring, 'change', (latest: number) => {
		springValue = Math.round(latest);
	});
	onDestroy(stopValueSync);

	$effect(() => {
		if (shouldReduceMotion.current) {
			valueSpring.jump(selectedData.value);
			springValue = selectedData.value;
		} else {
			valueSpring.set(selectedData.value);
		}
	});
</script>

<div class="flex h-full flex-col p-4">
	<div class="mb-4 flex items-end justify-between">
		<div class="space-y-1">
			<p class="font-mono text-xs text-muted-foreground">[desktop] Value</p>
			<p class="font-mono text-3xl tracking-tighter text-primary">
				<NumberFlow
					value={selectedData.value}
					format={{ style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }}
				/>
			</p>
		</div>

		<div class="space-y-1 text-right">
			<p class="font-mono text-[10px] text-muted-foreground">[month]</p>
			<p class="font-mono text-xs text-primary">{selectedData.month}</p>
		</div>
	</div>

	<ChartContainer config={chartConfig}>
		<Chart
			bind:context={layerContext}
			data={rows}
			x={INDEX_KEY}
			series={[{ key: 'desktop', value: 'desktop' }]}
			seriesLayout="overlap"
			bandPadding={0}
			yBaseline={0}
			yNice
			padding={{ top: 5, right: 5, bottom: 35, left: CHART_MARGIN }}
			tooltipContext={{ mode: 'band' }}
			class="h-full w-full"
		>
			<Svg>
				<HoverTraceBar
					dataKey="desktop"
					{rows}
					{activeRow}
					highlightedIndex={selectedData.index}
					fill="var(--color-desktop-0)"
				/>
				<HoverTraceTrace {springValue} labelValue={selectedData.value} chartMargin={CHART_MARGIN} />
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
