<script lang="ts">
	/**
	 * `TreeIndicator` from `evilcharts/src/components/docs/sidebar/nav-main.tsx`.
	 *
	 * The dotted rail behind an expanded chart folder, plus the spring-animated line and diamond
	 * that mark the active child. Every coordinate, the `29.5` row step and the
	 * `stiffness: 200 - index * 10` taper are the reference's.
	 */
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';

	let { activeIndex, hasActiveChild }: { activeIndex: number; hasActiveChild: boolean } = $props();
	const shouldReduceMotion = useReducedMotion();

	const y = $derived(activeIndex === 0 ? 11 : activeIndex * 29.5 + 11);
	const transition = $derived(
		shouldReduceMotion.current
			? { duration: 0 }
			: { type: 'spring' as const, stiffness: 200 - activeIndex * 10, damping: 20 }
	);
</script>

<svg class="pointer-events-none absolute z-10 ml-[5px] flex h-full w-5! text-muted duration-200">
	<ellipse class="text-path" cx="50%" cy="calc(100% - 15px)" rx="2" ry="2" fill="currentColor" />
	<rect class="text-path" x="9.5" y="0" width="1" height="calc(100% - 15px)" fill="currentColor" />
	{#if hasActiveChild}
		<motion.line
			class="text-primary"
			x1="50%"
			y1="0"
			x2="50%"
			stroke="currentColor"
			stroke-width="1"
			initial={shouldReduceMotion.current ? false : { y2: 0, opacity: 0 }}
			animate={{ y2: y, opacity: 1 }}
			{transition}
		/>
		<motion.rect
			class="text-primary"
			x="32.10%"
			width="7"
			height="7"
			rx="1"
			fill="currentColor"
			style={{ rotate: '45deg', transformOrigin: 'center', transformBox: 'fill-box' }}
			initial={shouldReduceMotion.current ? false : { y: 0, opacity: 0 }}
			animate={{ y, opacity: 1 }}
			{transition}
		/>
	{/if}
</svg>
