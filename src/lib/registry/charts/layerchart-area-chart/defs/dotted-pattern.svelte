<script lang="ts">
	/** Dotted texture fill, masked from the series color gradient. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<pattern id={`${id}-dotted-texture`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
	<circle cx="4" cy="4" r="0.5" fill="white" />
</pattern>
<mask id={`${id}-dotted-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-dotted-texture)`} fill-opacity="0.5" />
</mask>
<pattern id={`${id}-dotted`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-dotted-mask)`}
	/>
</pattern>
