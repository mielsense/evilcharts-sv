<script lang="ts">
	/** Two-tone fill that splits each bar into a light and a full-strength half. */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';
	import ColorStops from './color-stops.svelte';

	let { id, dataKey, config }: { id: string; dataKey: string; config: ChartConfig } = $props();

	const colorsCount = $derived(getColorsCount(config[dataKey] ?? {}));
</script>

<linearGradient
	id={`${id}-duotone-mask-gradient`}
	gradientUnits="objectBoundingBox"
	x1="0"
	y1="0"
	x2="1"
	y2="0"
>
	<stop offset="50%" stop-color="white" stop-opacity={0.4} />
	<stop offset="50%" stop-color="white" stop-opacity={1} />
</linearGradient>
<linearGradient
	id={`${id}-duotone-colors`}
	gradientUnits="objectBoundingBox"
	x1="0"
	y1="0"
	x2="0"
	y2="1"
>
	<ColorStops {dataKey} {colorsCount} />
</linearGradient>
<mask id={`${id}-duotone-mask`} maskContentUnits="objectBoundingBox">
	<rect x="0" y="0" width="1" height="1" fill={`url(#${id}-duotone-mask-gradient)`} />
</mask>
<pattern
	id={`${id}-duotone`}
	patternUnits="objectBoundingBox"
	patternContentUnits="objectBoundingBox"
	width="1"
	height="1"
>
	<rect
		x="0"
		y="0"
		width="1"
		height="1"
		fill={`url(#${id}-duotone-colors)`}
		mask={`url(#${id}-duotone-mask)`}
	/>
</pattern>
