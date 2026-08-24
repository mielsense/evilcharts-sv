<script lang="ts">
	/** Gradient fill that fades from transparent at the top to visible at the bottom. */
	let { id, dataKey }: { id: string; dataKey: string } = $props();
</script>

<linearGradient id={`${id}-vertical-fade-reverse`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="0%" stop-color="white" stop-opacity={0} />
	<stop offset="100%" stop-color="white" stop-opacity={0.1} />
</linearGradient>
<mask id={`${id}-gradient-reverse-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-vertical-fade-reverse)`} />
</mask>
<pattern id={`${id}-gradient-reverse`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-gradient-reverse-mask)`}
	/>
</pattern>
