<script lang="ts">
	/**
	 * The sector legend. When `isClickable` is set, each entry toggles selection of its sector,
	 * driving the shared selection state read by the <Pie />.
	 *
	 * Config-only: the legend is an HTML box outside the SVG, so this registers its props and the
	 * root renders it above or below the plot per `verticalAlign`.
	 */
	import type {
		ChartLegendVariant,
		LegendAlign,
		LegendVerticalAlign
	} from '../../ui/layerchart-legend/index.js';
	import { useRadialChart } from './radial-chart-context.svelte.js';

	let {
		variant,
		align = 'center',
		verticalAlign = 'bottom',
		isClickable = false
	}: {
		variant?: ChartLegendVariant; // visual style of the legend indicators
		align?: LegendAlign; // horizontal placement
		verticalAlign?: LegendVerticalAlign; // vertical placement
		isClickable?: boolean; // lets each entry toggle selection of its bar
	} = $props();

	const chart = useRadialChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.slots.registerLegend(token, { variant, align, verticalAlign, isClickable });
		return () => chart.slots.unregisterLegend(token);
	});
</script>
