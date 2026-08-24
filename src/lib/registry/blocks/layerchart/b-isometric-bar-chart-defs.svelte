<script lang="ts">
	/**
	 * Gradients and hatches for the isometric bars.
	 *
	 * Ids are namespaced per chart instance so several charts on a page do not share — and clobber —
	 * each other's `<defs>`.
	 */
	let {
		idPrefix,
		bevelOpacity,
		highlightColor,
		highlightColorDark
	}: {
		idPrefix: string;
		bevelOpacity: number;
		highlightColor: string;
		highlightColorDark: string;
	} = $props();
</script>

<defs>
	<linearGradient id={`${idPrefix}-iso-front-base`} x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="var(--color-accent)" stop-opacity={1} />
		<stop offset="100%" stop-color="var(--color-accent)" stop-opacity={0.8} />
	</linearGradient>
	<linearGradient id={`${idPrefix}-iso-top-base`} x1="0" y1="0" x2="1" y2="0">
		<stop offset="0%" stop-color="var(--color-accent)" stop-opacity={bevelOpacity} />
		<stop offset="100%" stop-color="var(--color-accent)" stop-opacity={bevelOpacity * 0.9} />
	</linearGradient>
	<linearGradient id={`${idPrefix}-iso-right-base`} x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color="var(--color-accent)" stop-opacity={bevelOpacity * 0.7} />
		<stop offset="100%" stop-color="var(--color-accent)" stop-opacity={bevelOpacity * 0.55} />
	</linearGradient>

	<linearGradient id={`${idPrefix}-iso-front-accent`} x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color={highlightColor} stop-opacity={1} />
		<stop offset="100%" stop-color={highlightColorDark} stop-opacity={0.95} />
	</linearGradient>
	<linearGradient id={`${idPrefix}-iso-top-accent`} x1="0" y1="0" x2="1" y2="0">
		<stop offset="0%" stop-color={highlightColor} stop-opacity={bevelOpacity + 0.15} />
		<stop offset="100%" stop-color={highlightColor} stop-opacity={bevelOpacity} />
	</linearGradient>
	<linearGradient id={`${idPrefix}-iso-right-accent`} x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stop-color={highlightColorDark} stop-opacity={bevelOpacity + 0.05} />
		<stop offset="100%" stop-color={highlightColorDark} stop-opacity={bevelOpacity * 0.7} />
	</linearGradient>

	<pattern
		id={`${idPrefix}-iso-hatch-base`}
		patternUnits="userSpaceOnUse"
		width="6"
		height="6"
		patternTransform="rotate(45)"
	>
		<line
			x1="0"
			y1="0"
			x2="0"
			y2="6"
			stroke="currentColor"
			stroke-width="1"
			stroke-opacity="0.15"
		/>
	</pattern>
	<pattern
		id={`${idPrefix}-iso-hatch-accent`}
		patternUnits="userSpaceOnUse"
		width="6"
		height="6"
		patternTransform="rotate(45)"
	>
		<line
			x1="0"
			y1="0"
			x2="0"
			y2="6"
			stroke={highlightColorDark}
			stroke-width="1"
			stroke-opacity="0.15"
		/>
	</pattern>
</defs>
