<script lang="ts">
	/** Hatched diagonal-stripe fill for a bar, masked from the series color gradient. */
	let { id }: { id: string } = $props();
</script>

<pattern
	id={`${id}-hatched-mask-pattern`}
	x="0"
	y="0"
	width="5"
	height="5"
	patternUnits="userSpaceOnUse"
	patternTransform="rotate(-45)"
>
	<rect width="5" height="5" fill="white" fill-opacity={0.3} />
	<rect width="1.5" height="5" fill="white" fill-opacity={1} />
</pattern>
<mask id={`${id}-hatched-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-hatched-mask-pattern)`} />
</mask>
<pattern id={`${id}-hatched`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-bar-colors)`}
		mask={`url(#${id}-hatched-mask)`}
	/>
</pattern>
