<script lang="ts">
	/** Diagonal-line fill used to push a non-selected area into the background. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<pattern
	id={`${id}-unselected-texture`}
	patternUnits="userSpaceOnUse"
	width="5"
	height="5"
	patternTransform="rotate(45)"
>
	<line x1="0" y1="0" x2="0" y2="5" stroke="white" stroke-width="1" />
</pattern>
<mask id={`${id}-unselected-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-unselected-texture)`} fill-opacity="0.3" />
</mask>
<pattern id={`${id}-unselected`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-unselected-mask)`}
	/>
</pattern>
