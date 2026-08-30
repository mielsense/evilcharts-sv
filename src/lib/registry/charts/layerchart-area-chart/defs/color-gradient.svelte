<script lang="ts">
	/**
	 * Horizontal left-to-right color gradient for a series. Always rendered — every
	 * fill variant, the stroke, and the dots all paint from this single gradient.
	 */
	import { chartColorVariable, getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';

	let {
		id,
		dataKey,
		config,
		isExpanded
	}: { id: string; dataKey: string; config: ChartConfig; isExpanded: boolean } = $props();

	const colorsCount = $derived(getColorsCount(config[dataKey] ?? {}));
</script>

<linearGradient
	id={`${id}-colors-${dataKey}`}
	x1="0"
	y1="0"
	x2="1"
	y2="0"
	gradientUnits={isExpanded ? 'userSpaceOnUse' : 'objectBoundingBox'}
>
	{#if colorsCount === 1}
		<stop offset="0%" stop-color={chartColorVariable(dataKey, 0)} />
		<stop offset="100%" stop-color={chartColorVariable(dataKey, 0)} />
	{:else}
		{#each Array.from({ length: colorsCount }, (_, index) => `${(index / (colorsCount - 1)) * 100}%`) as offset, index (offset)}
			<stop {offset} stop-color={chartColorVariable(dataKey, index, 0)} />
		{/each}
	{/if}
</linearGradient>
