<script lang="ts">
	/**
	 * The horizontal category axis. Ships with the chart's flat default styling and
	 * forwards every LayerChart Axis prop, so `tickFormatter`, `ticks`, etc. are
	 * passed straight through. Hidden automatically while the chart is loading.
	 *
	 * `dataKey` names the category key. Recharts reads it here; LayerChart needs it on the
	 * root's `x` accessor, so it is registered into the chart context on mount.
	 */
	import { Axis } from 'layerchart';
	import {
		layerChartFormatter,
		RECHARTS_X_AXIS_TICK_OFFSET,
		thinAxisTicks
	} from '../../ui/layerchart-chart/ticks.js';
	import { onMount, type ComponentProps } from 'svelte';
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
		dataKey,
		tickLine = false,
		axisLine = false,
		tickMargin = 8,
		minTickGap = 8,
		tickFormatter,
		...restProps
	}: Props = $props();

	const chart = useLineChart();
	const token = $props.id();
	let fontMetricsRevision = $state(0);
	const translatedTickLength = $derived(tickMargin + RECHARTS_X_AXIS_TICK_OFFSET);
	const format = $derived(tickFormatter ? layerChartFormatter(tickFormatter) : undefined);
	const ticks = $derived.by(() => {
		void fontMetricsRevision;
		return thinAxisTicks({
			minGap: minTickGap,
			leadingInset: chart.xAxisLeadingInset,
			trailingInset: chart.xAxisTrailingInset,
			format: (value, index) => tickFormatter?.(value, index) ?? String(value)
		});
	});

	onMount(() => {
		let active = true;
		void (document.fonts?.ready ?? Promise.resolve()).then(() => {
			if (active) fontMetricsRevision += 1;
		});
		return () => {
			active = false;
		};
	});

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
		data-evil-scale="point"
		{ticks}
		rule={axisLine}
		tickMarks={tickLine}
		tickLength={translatedTickLength}
		{format}
		{...restProps}
	/>
{/if}
