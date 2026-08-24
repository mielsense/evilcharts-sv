<script lang="ts">
	/** Gradient fill that fades from visible at the top to transparent at the bottom. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<linearGradient id={`${id}-vertical-fade`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="0%" stop-color="white" stop-opacity={0.1} />
	<stop offset="100%" stop-color="white" stop-opacity={0} />
</linearGradient>
<mask id={`${id}-gradient-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-vertical-fade)`} />
</mask>
<pattern id={`${id}-gradient`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-gradient-mask)`}
	/>
</pattern>
