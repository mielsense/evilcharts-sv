<script lang="ts">
	/**
	 * The hover tooltip. Hidden automatically while the chart is loading.
	 *
	 * Config-only: the tooltip box cannot render inside `<Svg>`, so this registers its props and
	 * the root renders it in the right place.
	 */
	import type { TooltipRoundness, TooltipVariant } from '../../ui/layerchart-tooltip/index.js';
	import { useRadialChart } from './radial-chart-context.svelte.js';

	let {
		variant,
		roundness,
		defaultIndex
	}: {
		variant?: TooltipVariant; // visual style of the tooltip surface
		roundness?: TooltipRoundness; // border-radius of the tooltip
		defaultIndex?: number; // bar index shown by default with no hover
	} = $props();

	const chart = useRadialChart();
	const token = $props.id();

	$effect.pre(() => {
		chart.slots.registerTooltip(token, { variant, roundness, defaultIndex, cursor: false });
		return () => chart.slots.unregisterTooltip(token);
	});
</script>
