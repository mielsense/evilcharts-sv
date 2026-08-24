<script lang="ts">
	/**
	 * One pulsing skeleton node.
	 *
	 * A component per element so each owns its own `ref`: motion-sv writes `ref` back into the props
	 * proxy, which Svelte rejects unless it is bound, and a binding cannot be declared inside an
	 * `{#each}`.
	 */
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

<rect
	class="loading-node"
	{x}
	{y}
	{width}
	{height}
	rx={2}
	fill="currentColor"
	style:--loading-duration={`${duration}s`}
	style:--loading-delay={`${delay}s`}
/>

<style>
	.loading-node {
		opacity: 0.15;
		animation: loading-node-pulse var(--loading-duration) ease-in-out var(--loading-delay) infinite;
	}

	@keyframes loading-node-pulse {
		50% {
			opacity: 0.4;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-node {
			opacity: 0.25;
			animation: none;
		}
	}
</style>
