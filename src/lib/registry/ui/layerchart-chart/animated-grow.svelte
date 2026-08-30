<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		progress,
		axis,
		children
	}: { progress: number; axis: 'horizontal' | 'vertical'; children: Snippet } = $props();

	const transform = $derived(axis === 'horizontal' ? `scaleX(${progress})` : `scaleY(${progress})`);
	const origin = $derived(axis === 'horizontal' ? '0% 50%' : '50% 100%');
</script>

<g style={`transform-box: fill-box; transform-origin: ${origin}; transform: ${transform};`}>
	{@render children()}
</g>
