<script lang="ts">
	/** Low-opacity body fill, paired with a solid top strip drawn by the bar itself. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<linearGradient id={`${id}-stripped-mask-gradient`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="0%" stop-color="white" stop-opacity={0.2} />
	<stop offset="100%" stop-color="white" stop-opacity={0.2} />
</linearGradient>
<mask id={`${id}-stripped-mask-${dataKey}`}>
	<rect width="100%" height="100%" fill={`url(#${id}-stripped-mask-gradient)`} />
</mask>
<pattern id={`${id}-stripped-${dataKey}`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-stripped-mask-${dataKey})`}
	/>
</pattern>
