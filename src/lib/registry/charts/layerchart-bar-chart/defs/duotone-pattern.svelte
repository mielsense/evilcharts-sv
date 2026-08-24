<script lang="ts">
	/** Two-tone fill — a half-faded, half-solid split applied per bar bounding box. */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';

	let { id, dataKey, config }: { id: string; dataKey: string; config: ChartConfig } = $props();

	const colorsCount = $derived(getColorsCount(config[dataKey] ?? {}));
</script>

<linearGradient
	id={`${id}-duotone-mask-gradient-${dataKey}`}
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
	id={`${id}-duotone-colors-${dataKey}`}
	gradientUnits="objectBoundingBox"
	x1="0"
	y1="0"
	x2="0"
	y2="1"
>
	{#if colorsCount === 1}
		<stop offset="0%" stop-color={`var(--color-${dataKey}-0)`} />
		<stop offset="100%" stop-color={`var(--color-${dataKey}-0)`} />
	{:else}
		{#each Array.from({ length: colorsCount }, (_, index) => `${(index / (colorsCount - 1)) * 100}%`) as offset, index (offset)}
			<stop {offset} stop-color={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`} />
		{/each}
	{/if}
</linearGradient>
<mask id={`${id}-duotone-mask-${dataKey}`} maskContentUnits="objectBoundingBox">
	<rect x="0" y="0" width="1" height="1" fill={`url(#${id}-duotone-mask-gradient-${dataKey})`} />
</mask>
<pattern
	id={`${id}-duotone-${dataKey}`}
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
		fill={`url(#${id}-duotone-colors-${dataKey})`}
		mask={`url(#${id}-duotone-mask-${dataKey})`}
	/>
</pattern>
