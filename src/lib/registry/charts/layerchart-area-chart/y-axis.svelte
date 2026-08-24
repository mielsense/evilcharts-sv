<script lang="ts">
	/**
	 * The vertical value axis. Forwards every LayerChart Axis prop and, when the
	 * chart uses an expanded stack, formats ticks as percentages automatically.
	 * Hidden automatically while the chart is loading.
	 */
	import { Axis } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { axisValueToPercentFormatter } from '../../ui/layerchart-chart/format.js';
	import { useAreaChart } from './area-chart-context.svelte.js';

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
		minTickGap = 8,
		tickFormatter,
		dataKey: _dataKey,
		...restProps
	}: Props = $props();

	const chart = useAreaChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.registerAxis(token, 'y', true);
		return () => chart.registerAxis(token, 'y', false);
	});

	const format = $derived(
		chart.isExpanded
			? (value: unknown) => axisValueToPercentFormatter(Number(value))
			: tickFormatter
				? (value: unknown) => tickFormatter(value, 0)
				: undefined
	);
</script>

{#if !chart.isLoading}
	<Axis
		placement="left"
		rule={axisLine}
		tickMarks={tickLine}
		tickLength={tickMargin}
		tickSpacing={minTickGap}
		{format}
		{...restProps}
	/>
{/if}
