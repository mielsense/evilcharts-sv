<script lang="ts">
	/**
	 * Wipe mask driven by motion.dev, played once when a <Line /> mounts. The same
	 * mask is applied to the line's stroke and its resting dots, so both
	 * reveal in lockstep, replacing the default behaviour where the dots appeared
	 * before the line had finished drawing.
	 *
	 * `maskUnits`/`maskContentUnits` are both userSpaceOnUse so every masked element
	 * shares one coordinate space and the wipe edge lands at the same x on each.
	 *
	 * Each rect animates `scaleX` 0 → 1; `originX` decides which edge it grows from.
	 * "edges-in" needs two rects — each half grows inward from an opposite edge.
	 */
	import { motion } from '@humanspeak/svelte-motion';
	import { getRevealAnimation } from '../../../ui/layerchart-chart/intros.js';
	import { REVEAL_DURATION, REVEAL_EASE, SINGLE_REVEAL_ORIGIN } from '../types.js';
	import type { RevealAnimationType } from '../types.js';

	let {
		id,
		type,
		introStartedAt
	}: { id: string; type: RevealAnimationType; introStartedAt: number } = $props();

	const reveal = $derived(
		getRevealAnimation(REVEAL_DURATION, REVEAL_EASE, introStartedAt) ?? {
			initial: { scaleX: 1 },
			animate: { scaleX: 1 },
			transition: { duration: 0, ease: REVEAL_EASE }
		}
	);
</script>

<mask
	id={`${id}-reveal-mask`}
	maskUnits="userSpaceOnUse"
	maskContentUnits="userSpaceOnUse"
	x="0"
	y="0"
	width="100%"
	height="100%"
>
	{#if type === 'edges-in'}
		<!-- left half wipes inward from the left edge toward the centre -->
		<motion.rect
			{...reveal}
			x="0"
			y="0"
			width="50%"
			height="100%"
			fill="white"
			style={{ originX: 0 }}
		/>
		<!-- right half wipes inward from the right edge toward the centre -->
		<motion.rect
			{...reveal}
			x="50%"
			y="0"
			width="50%"
			height="100%"
			fill="white"
			style={{ originX: 1 }}
		/>
	{:else}
		<motion.rect
			{...reveal}
			x="0"
			y="0"
			width="100%"
			height="100%"
			fill="white"
			style={{ originX: SINGLE_REVEAL_ORIGIN[type] }}
		/>
	{/if}
</mask>
