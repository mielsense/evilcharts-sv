<script lang="ts">
	/**
	 * The bottom axis. Ships with the chart's flat default styling and forwards every LayerChart
	 * Axis prop. Hidden automatically while the chart is loading. It carries the categories when
	 * the bars run vertically and the values when they run horizontally — the scale type swaps
	 * with the layout, the side does not, exactly as Recharts does it.
	 *
	 * `dataKey` names the category key. Recharts reads it here; LayerChart needs it on the
	 * root's `x` accessor, so it is registered into the chart context on mount.
	 */
	import { Axis } from 'layerchart';
	import { dropOverflowingLeadTick } from '../../ui/layerchart-chart/ticks.js';
	import type { ComponentProps } from 'svelte';
	import { useBarChart } from './bar-chart-context.svelte.js';

	type Props = Omit<ComponentProps<typeof Axis>, 'placement' | 'format'> & {
		dataKey?: string;
		tickFormatter?: (value: unknown, index: number) => string;
		tickLine?: boolean;
		axisLine?: boolean;
		tickMargin?: number;
		minTickGap?: number;
	};

	let {
		dataKey,
		tickLine = false,
		axisLine = false,
		tickMargin = 8,
		minTickGap = 8,
		tickFormatter,
		...restProps
	}: Props = $props();

	const chart = useBarChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.registerXAxisDataKey(token, dataKey);
		chart.registerAxis(token, 'x', true);
		return () => {
			chart.registerXAxisDataKey(token, undefined);
			chart.registerAxis(token, 'x', false);
		};
	});
</script>

{#if !chart.isLoading}
	<Axis
		placement="bottom"
		ticks={dropOverflowingLeadTick}
		rule={axisLine}
		tickMarks={tickLine}
		tickLength={tickMargin}
		tickSpacing={minTickGap}
		format={tickFormatter ? (value: unknown) => tickFormatter(value, 0) : undefined}
		{...restProps}
	/>
{/if}
