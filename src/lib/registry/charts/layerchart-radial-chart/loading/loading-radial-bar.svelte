<script lang="ts">
	/**
	 * The skeleton bars shown while the chart is loading. Rendered by the root in place of the real
	 * <RadialBar />, with animated values and a muted fill.
	 */
	import { Arc, getChartContext } from 'layerchart';
	import { cubicBezier, useReducedMotion } from '@humanspeak/svelte-motion';
	import {
		DEFAULT_BAR_SIZE,
		DEFAULT_CORNER_RADIUS,
		LOADING_ANIMATION_DURATION,
		getRings,
		getVariantConfig,
		resolveRadius,
		toArcAngle
	} from '../types.js';
	import { useRadialChart } from '../radial-chart-context.svelte.js';

	const chart = useRadialChart();
	const layer = getChartContext();

	/**
	 * Recharts' `animationEasing="ease-in-out"` is the CSS `ease-in-out` curve. LayerChart's
	 * `motion={{ type: 'tween' }}` takes an easing *function*, and the motion library solves the
	 * curve for us.
	 */
	const easeInOut = cubicBezier(0.42, 0, 0.58, 1);
	const shouldReduceMotion = useReducedMotion();

	const variantConfig = $derived(getVariantConfig(chart.variant));
	// `layer.width` / `layer.height` are the plot box, already inside the chart's `padding`, so the
	// margin must not be subtracted a second time.
	const maxRadius = $derived(Math.min(layer.width, layer.height) / 2);
	const startAngle = $derived(toArcAngle(variantConfig.startAngle));
	// The track spans the chart's whole sweep, not the bar's (DEVIATIONS U-6).
	const trackEndAngle = $derived(toArcAngle(variantConfig.endAngle));

	const rings = $derived(
		getRings({
			rows: chart.data,
			dataKey: 'value',
			nameKey: 'name',
			innerRadius: resolveRadius(chart.innerRadius, maxRadius),
			outerRadius: resolveRadius(chart.outerRadius, maxRadius),
			barSize: DEFAULT_BAR_SIZE,
			startAngle,
			endAngle: toArcAngle(variantConfig.endAngle),
			max: chart.max
		})
	);
</script>

{#each rings as ring (ring.index)}
	<!--
		The reference leaves Recharts' own animation on for the skeleton
		(`animationDuration={LOADING_ANIMATION_DURATION} animationEasing="ease-in-out"`), so each bar
		tweens to its new length whenever the data is regenerated.
	-->
	<Arc
		{startAngle}
		endAngle={ring.endAngle}
		innerRadius={ring.innerRadius}
		outerRadius={ring.outerRadius}
		cornerRadius={DEFAULT_CORNER_RADIUS}
		fill="currentColor"
		fillOpacity={0.25}
		track
		{trackEndAngle}
		motion={shouldReduceMotion.current
			? 'none'
			: { type: 'tween', duration: LOADING_ANIMATION_DURATION, easing: easeInOut }}
	/>
{/each}
