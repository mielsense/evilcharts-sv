<script lang="ts">
	/**
	 * A single skeleton sector shown while the chart is loading. Each sector pulses with a
	 * staggered delay, producing a wave that travels around the pie.
	 */
	import { Arc } from 'layerchart';
	import { LOADING_ANIMATION_DURATION, LOADING_SECTORS } from '../types.js';

	let {
		index,
		startAngle,
		endAngle,
		innerRadius,
		outerRadius,
		cornerRadius
	}: {
		index: number;
		startAngle: number;
		endAngle: number;
		innerRadius: number | undefined;
		outerRadius: number | undefined;
		cornerRadius: number;
	} = $props();

	// Staggered delay so the pulse sweeps around the circle
	const delay = $derived((index / LOADING_SECTORS) * (LOADING_ANIMATION_DURATION / 1000));
</script>

<g
	class="loading-sector"
	style:--loading-duration={`${LOADING_ANIMATION_DURATION}ms`}
	style:--loading-delay={`${delay}s`}
>
	<Arc
		class="lc-pie-arc"
		{startAngle}
		{endAngle}
		{innerRadius}
		{outerRadius}
		{cornerRadius}
		fill="currentColor"
		strokeWidth={0}
		motion="none"
	/>
</g>

<style>
	.loading-sector {
		opacity: 0.15;
		animation: loading-sector-pulse var(--loading-duration) ease-in-out var(--loading-delay)
			infinite;
	}

	@keyframes loading-sector-pulse {
		50% {
			opacity: 0.5;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-sector {
			opacity: 0.3;
			animation: none;
		}
	}
</style>
