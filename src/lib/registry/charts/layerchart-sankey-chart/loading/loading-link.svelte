<script lang="ts">
	/** One pulsing skeleton link. Separate component for the same reason as `loading-node`. */
	let { d, width, delay, duration }: { d: string; width: number; delay: number; duration: number } =
		$props();
</script>

<path
	class="loading-link"
	{d}
	fill="none"
	stroke="currentColor"
	stroke-width={width}
	style:--loading-duration={`${duration}s`}
	style:--loading-delay={`${delay}s`}
/>

<style>
	.loading-link {
		opacity: 0.04;
		animation: loading-link-pulse var(--loading-duration) ease-in-out var(--loading-delay) infinite;
	}

	@keyframes loading-link-pulse {
		50% {
			opacity: 0.14;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-link {
			opacity: 0.09;
			animation: none;
		}
	}
</style>
