<script lang="ts">
	/**
	 * The radial value axis — the scale running from the centre outward. Forwards every LayerChart
	 * Axis prop. Hidden automatically while the chart is loading.
	 */
	import { Axis } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { useRadarChart } from './radar-chart-context.svelte.js';

	type Props = Omit<ComponentProps<typeof Axis>, 'placement' | 'format'> & {
		tickFormatter?: (value: unknown, index: number) => string;
		tickLine?: boolean;
		axisLine?: boolean;
	};

	let { tickLine = false, axisLine = false, tickFormatter, ...restProps }: Props = $props();

	const chart = useRadarChart();

	const format = $derived(tickFormatter ? (value: unknown) => tickFormatter(value, 0) : undefined);
</script>

{#if !chart.isLoading}
	<!-- The reference's `tick={{ fill: 'currentColor', fontSize: 10 }}`. -->
	<Axis
		placement="radius"
		rule={axisLine}
		tickMarks={tickLine}
		tickLabelProps={{ class: 'fill-current text-[10px]' }}
		{format}
		{...restProps}
	/>
{/if}
