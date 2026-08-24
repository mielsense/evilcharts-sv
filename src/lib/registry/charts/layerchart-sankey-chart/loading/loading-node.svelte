<script lang="ts">
	/**
	 * One pulsing skeleton node.
	 *
	 * A component per element so each owns its own `ref`: motion-sv writes `ref` back into the props
	 * proxy, which Svelte rejects unless it is bound, and a binding cannot be declared inside an
	 * `{#each}`. See plans/DEVIATIONS.md B-3b.
	 */
	import { motion } from '@humanspeak/svelte-motion';

	let {
		x,
		y,
		width,
		height,
		delay,
		duration
	}: {
		x: number;
		y: number;
		width: number;
		height: number;
		delay: number;
		duration: number;
	} = $props();
</script>

<motion.rect
	{x}
	{y}
	{width}
	{height}
	rx={2}
	fill="currentColor"
	initial={{ opacity: 0.15 }}
	animate={{ opacity: [0.15, 0.4, 0.15] }}
	transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
/>
