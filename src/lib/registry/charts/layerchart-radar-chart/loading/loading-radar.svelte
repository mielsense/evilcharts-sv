<script lang="ts">
	/**
	 * The skeleton radar shown while the chart is loading. Rendered by the root in place of the
	 * real radars, it animates between randomised shapes as the data is regenerated.
	 */
	import { Spline } from 'layerchart';
	import { curveLinearClosed } from 'd3-shape';
	import { cubicBezier } from '@humanspeak/svelte-motion';
	import { LOADING_ANIMATION_DURATION, LOADING_RADAR_DATA_KEY } from '../types.js';

	/**
	 * Recharts' `animationEasing="ease-in-out"` is the CSS `ease-in-out` curve. LayerChart's
	 * `motion={{ type: 'tween' }}` takes an easing *function*, and the motion library solves the
	 * curve for us.
	 */
	const easeInOut = cubicBezier(0.42, 0, 0.58, 1);
</script>

<!--
	The reference leaves Recharts' own animation on for this one mark
	(`animationDuration={LOADING_ANIMATION_DURATION} animationEasing="ease-in-out"`), so the shape
	tweens each time the data is regenerated. LayerChart's `motion` prop does the same.
-->
<Spline
	seriesKey={LOADING_RADAR_DATA_KEY}
	curve={curveLinearClosed}
	stroke="currentColor"
	strokeOpacity={0.3}
	strokeWidth={2}
	fill="currentColor"
	fillOpacity={0.1}
	motion={{ type: 'tween', duration: LOADING_ANIMATION_DURATION, easing: easeInOut }}
/>
