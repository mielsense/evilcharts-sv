<script lang="ts">
	/** Gradient fill that fades from visible at the top to transparent at the bottom. */
	let {
		id,
		dataKey,
		chartHeight,
		plotTop
	}: { id: string; dataKey: string; chartHeight: number; plotTop: number } = $props();
</script>

<!--
	LayerChart renders marks inside a translated plot group. Recharts renders the same area path in
	the root SVG coordinate space, so its user-space pattern includes the chart's top padding in the
	vertical fade. Start above the local plot by that padding to preserve the reference alpha ramp.
-->
<linearGradient
	id={`${id}-vertical-fade`}
	gradientUnits="userSpaceOnUse"
	x1="0"
	y1={-plotTop}
	x2="0"
	y2={chartHeight - plotTop}
>
	<stop offset="0%" stop-color="white" stop-opacity={0.1} />
	<stop offset="100%" stop-color="white" stop-opacity={0} />
</linearGradient>
<mask id={`${id}-gradient-mask`}>
	<rect width="100%" height="100%" fill={`url(#${id}-vertical-fade)`} />
</mask>
<pattern id={`${id}-gradient`} patternUnits="userSpaceOnUse" width="100%" height="100%">
	<rect
		width="100%"
		height="100%"
		fill={`url(#${id}-colors-${dataKey})`}
		mask={`url(#${id}-gradient-mask)`}
	/>
</pattern>
