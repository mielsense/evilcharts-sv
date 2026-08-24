<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/docs/charts/lazy-mount.tsx`.
	 *
	 * Defers rendering of `children` until the wrapper element is near the viewport.
	 *
	 * Used to avoid mounting many heavy chart components (LayerChart + ResizeObserver + large SVG
	 * trees) on the same page at once, which caused noticeable jank on the docs pages where 10–20+
	 * chart previews can live next to each other.
	 *
	 * SSR safety: starts as not-visible on both server and client, so hydration matches and the
	 * chart subtree never runs on the server.
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let {
		children,
		fallback,
		/**
		 * Distance from the viewport at which the children start mounting. Same syntax as
		 * IntersectionObserver `rootMargin`. Defaults to a generous 300px so charts are ready by the
		 * time the user scrolls to them.
		 */
		rootMargin = '300px 0px',
		class: className
	}: { children?: Snippet; fallback?: Snippet; rootMargin?: string; class?: string } = $props();

	let host = $state<HTMLDivElement | null>(null);
	let visible = $state(false);

	$effect(() => {
		if (visible) return;
		const node = host;
		if (!node) return;

		if (typeof IntersectionObserver === 'undefined') {
			visible = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					visible = true;
					observer.disconnect();
				}
			},
			{ rootMargin }
		);

		observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<div bind:this={host} class={cn('size-full', className)}>
	{#if visible}
		{@render children?.()}
	{:else}
		{@render fallback?.()}
	{/if}
</div>
