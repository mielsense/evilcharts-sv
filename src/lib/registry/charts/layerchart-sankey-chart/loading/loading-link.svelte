<script lang="ts">
	/** One pulsing skeleton link. Separate component for the same reason as `loading-node`. */
	import { motion } from '@humanspeak/svelte-motion';

	let { d, width, delay, duration }: { d: string; width: number; delay: number; duration: number } =
		$props();
</script>

<motion.path
	{d}
	fill="none"
	stroke="currentColor"
	stroke-width={width}
	initial={{ opacity: 0.04 }}
	animate={{ opacity: [0.04, 0.14, 0.04] }}
	transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
/>
