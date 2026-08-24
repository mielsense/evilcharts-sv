<script lang="ts">
	/** Diagonal-line texture fill, masked from the series color gradient. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<pattern
	id={`${id}-lines-texture`}
	patternUnits="userSpaceOnUse"
	width="5"
	height="5"
	patternTransform="rotate(45)"
>
	<line x1="0" y1="0" x2="0" y2="5" stroke="white" stroke-width="1" />
</pattern>
<mask id={`${id}-lines-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-lines-texture)`} fill-opacity="0.3" />
</mask>
<pattern id={`${id}-lines`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-lines-mask)`}
	/>
</pattern>
