<script lang="ts">
	/**
	 * The series legend. When `isClickable` is set, each entry toggles selection of
	 * its series, driving the shared selection state read by every <Radar />.
	 *
	 * Config-only: the legend is an HTML box outside the SVG, so this registers its props
	 * and the root renders it above or below the plot per `verticalAlign`.
	 */
	import type {
		ChartLegendVariant,
		LegendAlign,
		LegendVerticalAlign
	} from '../../ui/layerchart-legend/index.js';
	import { useRadarChart } from './radar-chart-context.svelte.js';

	let {
		variant,
		align = 'center',
		verticalAlign = 'bottom',
		isClickable = false
	}: {
		variant?: ChartLegendVariant; // visual style of the legend indicators
		align?: LegendAlign; // horizontal placement
		verticalAlign?: LegendVerticalAlign; // vertical placement
		isClickable?: boolean; // lets each entry toggle selection of its series
	} = $props();

	const chart = useRadarChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.slots.registerLegend(token, { variant, align, verticalAlign, isClickable });
		return () => chart.slots.unregisterLegend(token);
	});
</script>
