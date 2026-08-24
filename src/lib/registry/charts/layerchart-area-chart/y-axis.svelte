<script lang="ts">
	/**
	 * The vertical value axis. Forwards every LayerChart Axis prop and, when the
	 * chart uses an expanded stack, formats ticks as percentages automatically.
	 * Hidden automatically while the chart is loading.
	 */
	import { Axis, getChartContext } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { axisValueToPercentFormatter } from '../../ui/layerchart-chart/format.js';
	import {
		layerChartFormatter,
		measureRechartsYAxisWidth,
		rechartsValueAxisTicks
	} from '../../ui/layerchart-chart/ticks.js';
	import { useAreaChart } from './area-chart-context.svelte.js';

	type Props = Omit<ComponentProps<typeof Axis>, 'placement' | 'format'> & {
		dataKey?: string;
		tickFormatter?: (value: unknown, index: number) => string;
		tickLine?: boolean;
		axisLine?: boolean;
		tickMargin?: number;
		minTickGap?: number;
		width?: number | 'auto';
	};

	let {
		tickLine = false,
		axisLine = false,
		tickMargin = 8,
		minTickGap: _minTickGap = 8,
		width = 'auto',
		tickFormatter,
		tickLabelProps,
		dataKey: _dataKey,
		...restProps
	}: Props = $props();

	const chart = useAreaChart();
	const layer = getChartContext();
	const token = $props.id();

	const format = $derived(
		chart.isExpanded
			? (value: unknown) => axisValueToPercentFormatter(Number(value))
			: tickFormatter
				? layerChartFormatter(tickFormatter)
				: (value: unknown) => String(value)
	);

	const tickValues = $derived(rechartsValueAxisTicks(layer.yScale));
	const resolvedWidth = $derived(
		width === 'auto'
			? measureRechartsYAxisWidth(
					tickValues.map((value, index) => format(value, index)),
					tickMargin
				)
			: width
	);

	$effect.pre(() => {
		chart.registerAxis(token, 'y', true, resolvedWidth);
		return () => chart.registerAxis(token, 'y', false);
	});
</script>

{#if !chart.isLoading}
	<Axis
		placement="left"
		ticks={rechartsValueAxisTicks}
		rule={axisLine}
		tickMarks={tickLine}
		tickLength={6}
		tickLabelProps={{ ...tickLabelProps, dx: -(6 + tickMargin) }}
		{format}
		{...restProps}
	/>
{/if}
