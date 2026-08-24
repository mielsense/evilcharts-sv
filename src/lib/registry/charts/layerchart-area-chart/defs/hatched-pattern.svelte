<script lang="ts">
	/** Hatched striped fill with a soft gradient across each stripe. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<linearGradient id={`${id}-hatched-stripe`} x1="0" y1="0" x2="1" y2="0">
	<stop offset="50%" stop-color="white" stop-opacity={0.2} />
	<stop offset="50%" stop-color="white" stop-opacity={1} />
</linearGradient>
<pattern
	id={`${id}-hatched-texture`}
	x="0"
	y="0"
	width="20"
	height="10"
	patternUnits="userSpaceOnUse"
	overflow="visible"
	patternTransform="rotate(20)"
>
	<rect width="20" height="10" fill={`url(#${id}-hatched-stripe)`} />
</pattern>
<mask id={`${id}-hatched-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-hatched-texture)`} fill-opacity="0.2" />
</mask>
<pattern id={`${id}-hatched`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-hatched-mask)`}
	/>
</pattern>
