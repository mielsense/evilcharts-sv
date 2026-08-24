<script lang="ts">
	/**
	 * The vertical value axis. Forwards every LayerChart Axis prop.
	 * Hidden automatically while the chart is loading.
	 */
	import { Axis } from 'layerchart';
	import { layerChartFormatter } from '../../ui/layerchart-chart/ticks.js';
	import type { ComponentProps } from 'svelte';
	import { useLineChart } from './line-chart-context.svelte.js';

	type Props = Omit<ComponentProps<typeof Axis>, 'placement' | 'format'> & {
		dataKey?: string;
		tickFormatter?: (value: unknown, index: number) => string;
		tickLine?: boolean;
		axisLine?: boolean;
		tickMargin?: number;
		minTickGap?: number;
	};

	let {
		tickLine = false,
		axisLine = false,
		tickMargin = 8,
		minTickGap: _minTickGap = 8,
		tickFormatter,
		dataKey: _dataKey,
		...restProps
	}: Props = $props();

	const chart = useLineChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.registerAxis(token, 'y', true);
		return () => chart.registerAxis(token, 'y', false);
	});

	const format = $derived(tickFormatter ? layerChartFormatter(tickFormatter) : undefined);
</script>

{#if !chart.isLoading}
	<Axis
		placement="left"
		rule={axisLine}
		tickMarks={tickLine}
		tickLength={tickMargin}
		{format}
		{...restProps}
	/>
{/if}
