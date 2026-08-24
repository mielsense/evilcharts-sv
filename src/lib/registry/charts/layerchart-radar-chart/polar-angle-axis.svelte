<script lang="ts">
	/**
	 * The angular category axis — the labels around the chart's perimeter. Ships with the chart's
	 * flat default styling and forwards every LayerChart Axis prop. Hidden automatically while the
	 * chart is loading.
	 *
	 * `dataKey` names the category key. Recharts reads it here; LayerChart needs it on the root's
	 * `x` accessor, so it is registered into the chart context on mount.
	 */
	import { Axis } from 'layerchart';
	import { layerChartFormatter } from '../../ui/layerchart-chart/ticks.js';
	import type { ComponentProps } from 'svelte';
	import { useRadarChart } from './radar-chart-context.svelte.js';

	type Props = Omit<ComponentProps<typeof Axis>, 'placement' | 'format'> & {
		dataKey?: string;
		tickFormatter?: (value: unknown, index: number) => string;
		tickLine?: boolean;
	};

	let { dataKey, tickLine = false, tickFormatter, ...restProps }: Props = $props();

	const chart = useRadarChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.registerAngleDataKey(token, dataKey);
		return () => chart.registerAngleDataKey(token, undefined);
	});

	const format = $derived(tickFormatter ? layerChartFormatter(tickFormatter) : undefined);
</script>

{#if !chart.isLoading}
	<!-- The reference's `tick={{ fill: 'currentColor', fontSize: 12 }}`. -->
	<Axis
		placement="angle"
		rule={false}
		tickMarks={tickLine}
		tickLabelProps={{ class: 'fill-current text-xs' }}
		{format}
		{...restProps}
	/>
{/if}
