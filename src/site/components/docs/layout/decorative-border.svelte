<script lang="ts">
	/** Adapted from the reference's `src/components/docs/layout/decorative-border-svg.tsx`. */
</script>

<svg
	class="pointer-events-none absolute top-0 right-0 z-10 h-[44px] w-[315px] overflow-visible sm:top-[8.5px] sm:right-[8.5px] sm:w-[445px] lg:w-[585px]"
	viewBox="0 0 400 44"
	preserveAspectRatio="none"
	fill="none"
>
	<!-- Top path to mask the panel border. -->
	<path
		d="M 400 0 L 1.5 0"
		stroke="var(--sidebar)"
		stroke-width="2"
		vector-effect="non-scaling-stroke"
		stroke-linecap="round"
		fill="var(--sidebar)"
	/>
	<!-- right path to mask border -->
	<path
		d="M 400 0 L 400 53"
		stroke="var(--sidebar)"
		stroke-width="2"
		vector-effect="non-scaling-stroke"
		stroke-linecap="round"
		fill="var(--sidebar)"
	/>
	<!-- main path with fill -->
	<path
		class="text-[#E5E5E5] dark:text-[#1B1B1B]"
		d="M -8 0 q 10 0 20 10 l 22 24 q 10 10 20 10 L 390 44 q 10 0 10 10 l 0 -54 Z"
		fill="var(--sidebar)"
	/>
	<!-- main path with border -->
	<path
		class="text-[#E5E5E5] dark:text-[#1B1B1B]"
		d="M -8 0 q 10 0 20 10 l 22 24 q 10 10 20 10 L 390 44 q 10 0 10 10 v 10 "
		stroke="currentColor"
		stroke-width="1"
		vector-effect="non-scaling-stroke"
		fill="none"
	/>
</svg>
