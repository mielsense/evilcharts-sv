<script lang="ts">
	import { revealMaskRects, revealProgress, type CubicBezier } from './intros.js';

	type RevealDirection = 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';

	let {
		id,
		type,
		elapsed,
		duration,
		ease,
		onReady
	}: {
		id: string;
		type: RevealDirection;
		elapsed: number;
		duration: number;
		ease: CubicBezier;
		onReady: () => void;
	} = $props();

	const progress = $derived(revealProgress(elapsed, duration, ease));
	const rects = $derived(revealMaskRects(type, progress));

	// Effects run after the mask has reached the DOM, so the chart gets a full visible intro.
	$effect(() => onReady());
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
	{#each rects as rect, index (index)}
		<rect x={`${rect.x}%`} y="0" width={`${rect.width}%`} height="100%" fill="white" />
	{/each}
</mask>
