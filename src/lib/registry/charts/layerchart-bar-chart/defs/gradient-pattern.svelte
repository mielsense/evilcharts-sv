<script lang="ts">
	/** Gradient fill that fades the series color from solid at the top to clear. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<linearGradient id={`${id}-gradient-mask-gradient`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="20%" stop-color="white" stop-opacity={1} />
	<stop offset="90%" stop-color="white" stop-opacity={0} />
</linearGradient>
<mask id={`${id}-gradient-mask-${dataKey}`}>
	<rect width="100%" height="100%" fill={`url(#${id}-gradient-mask-gradient)`} />
</mask>
<pattern id={`${id}-gradient-${dataKey}`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-gradient-mask-${dataKey})`}
	/>
</pattern>
