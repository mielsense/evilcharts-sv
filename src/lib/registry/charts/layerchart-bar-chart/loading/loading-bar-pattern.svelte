<script lang="ts">
	/**
	 * Animated shimmer pattern for the loading skeleton.
	 *
	 * The visible chart area is normalized to 0-1, the shimmer gradient has width 1,
	 * and the pattern is 3x wide so the shimmer has buffer on both sides. The motion
	 * rect travels x from -1 to 2; onShimmerExit fires as it crosses x=1, letting the
	 * data swap happen while the shimmer is off-screen for a seamless loop.
	 */
	import { motion } from '@humanspeak/svelte-motion';
	import { LOADING_ANIMATION_DURATION } from '../types.js';
	import { generateEasedGradientStops } from './gradient-stops.js';

	let { chartId, onShimmerExit }: { chartId: string; onShimmerExit: () => void } = $props();

	const gradientStops = generateEasedGradientStops();

	// 1 (left buffer) + 1 (visible) + 1 (right buffer)
	const patternWidth = 3;
	const startX = -1;
	const endX = 2;

	// Tracks the last x value to detect the exit threshold crossing
	let lastX = startX;
</script>

<linearGradient id={`${chartId}-loading-mask-gradient`} x1="0" y1="0" x2="1" y2="0">
	{#each gradientStops as { offset, opacity } (offset)}
		<stop {offset} stop-color="white" stop-opacity={opacity} />
	{/each}
</linearGradient>
<pattern
	id={`${chartId}-loading-mask-pattern`}
	patternUnits="objectBoundingBox"
	patternContentUnits="objectBoundingBox"
	patternTransform="rotate(25)"
	width={patternWidth}
	height="1"
	x="0"
	y="0"
>
	<motion.rect
		y="0"
		width="1"
		height="1"
		fill={`url(#${chartId}-loading-mask-gradient)`}
		initial={{ x: startX }}
		animate={{ x: endX }}
		transition={{
			duration: LOADING_ANIMATION_DURATION / 1000,
			ease: 'linear',
			repeat: Infinity,
			repeatType: 'loop'
		}}
		onUpdate={(latest: Record<string, unknown>) => {
			const xValue = typeof latest.x === 'number' ? latest.x : startX;

			// Fire once per loop, when the shimmer fully exits the visible area
			if (xValue >= 1 && lastX < 1) {
				onShimmerExit();
			}

			lastX = xValue;
		}}
	/>
</pattern>
<mask id={`${chartId}-loading-mask`} maskUnits="userSpaceOnUse">
	<rect width="100%" height="100%" fill={`url(#${chartId}-loading-mask-pattern)`} />
</mask>
