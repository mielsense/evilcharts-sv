<script lang="ts">
	/** Hatched diagonal lines with no background fill, used for the buffer bar. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<pattern
	id={`${id}-buffer-hatched-mask-pattern`}
	x="0"
	y="0"
	width="5"
	height="5"
	patternUnits="userSpaceOnUse"
	patternTransform="rotate(-45)"
>
	<rect width="5" height="5" fill="black" fill-opacity={0} />
	<rect width="1" height="5" fill="white" fill-opacity={1} />
</pattern>
<mask id={`${id}-buffer-hatched-mask-${dataKey}`}>
	<rect width="100%" height="100%" fill={`url(#${id}-buffer-hatched-mask-pattern)`} />
</mask>
<pattern
	id={`${id}-buffer-hatched-${dataKey}`}
	patternUnits="userSpaceOnUse"
	width="100%"
	height="100%"
>
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-buffer-hatched-mask-${dataKey})`}
	/>
</pattern>
