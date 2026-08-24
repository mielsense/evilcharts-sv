<script lang="ts">
	/**
	 * A single skeleton sector shown while the chart is loading. Each sector pulses with a
	 * staggered delay, producing a wave that travels around the pie.
	 */
	import { Arc } from 'layerchart';
	import { motion } from '@humanspeak/svelte-motion';
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

<motion.g
	initial={{ opacity: 0.15 }}
	animate={{ opacity: [0.15, 0.5, 0.15] }}
	transition={{
		duration: LOADING_ANIMATION_DURATION / 1000,
		delay,
		repeat: Infinity,
		ease: 'easeInOut'
	}}
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
</motion.g>
