<script lang="ts">
	/** Gradient fill for a bar that fades from visible at the top toward transparent. */
	let { id }: { id: string } = $props();
</script>

<linearGradient id={`${id}-gradient-mask-gradient`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="20%" stop-color="white" stop-opacity={1} />
	<stop offset="90%" stop-color="white" stop-opacity={0} />
</linearGradient>
<mask id={`${id}-gradient-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-gradient-mask-gradient)`} />
</mask>
<pattern id={`${id}-gradient`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-bar-colors)`}
		mask={`url(#${id}-gradient-mask)`}
	/>
</pattern>
