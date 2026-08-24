<script lang="ts">
	/**
	 * The hover tooltip. Reads the chart's selection from context so its content
	 * dims unselected series. Hidden automatically while the chart is loading.
	 *
	 * Config-only: the tooltip box and its cursor cannot render inside `<Svg>`, so this
	 * registers its props and the root renders them in the right place.
	 */
	import type { TooltipRoundness, TooltipVariant } from '../../ui/layerchart-tooltip/index.js';
	import { useLineChart } from './line-chart-context.svelte.js';

	let {
		variant,
		roundness,
		defaultIndex,
		cursor = true
	}: {
		variant?: TooltipVariant; // visual style of the tooltip surface
		roundness?: TooltipRoundness; // border-radius of the tooltip
		defaultIndex?: number; // data index shown by default with no hover
		cursor?: boolean; // whether the vertical cursor line follows the pointer
	} = $props();

	const chart = useLineChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.slots.registerTooltip(token, { variant, roundness, defaultIndex, cursor });
		return () => chart.slots.unregisterTooltip(token);
	});
</script>
