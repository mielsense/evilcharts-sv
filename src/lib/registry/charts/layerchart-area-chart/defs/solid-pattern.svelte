<script lang="ts">
	/** Uniform low-opacity gradient fill with no vertical fade. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<linearGradient id={`${id}-solid-fade`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="0%" stop-color="white" stop-opacity={0.1} />
	<stop offset="100%" stop-color="white" stop-opacity={0.1} />
</linearGradient>
<mask id={`${id}-solid-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-solid-fade)`} />
</mask>
<pattern id={`${id}-solid`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-solid-mask)`}
	/>
</pattern>
