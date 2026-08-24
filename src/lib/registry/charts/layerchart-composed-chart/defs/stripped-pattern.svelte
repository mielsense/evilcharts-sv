<script lang="ts">
	/** Low-opacity gradient fill paired with the solid top strip drawn by the bar itself. */
	let { id }: { id: string } = $props();
</script>

<linearGradient id={`${id}-stripped-mask-gradient`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="0%" stop-color="white" stop-opacity={0.4} />
	<stop offset="100%" stop-color="white" stop-opacity={0.1} />
</linearGradient>
<mask id={`${id}-stripped-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-stripped-mask-gradient)`} />
</mask>
<pattern id={`${id}-stripped`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-bar-colors)`}
		mask={`url(#${id}-stripped-mask)`}
	/>
</pattern>
