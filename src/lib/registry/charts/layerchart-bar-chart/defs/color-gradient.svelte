<script lang="ts">
	/**
	 * Vertical top-to-bottom color gradient for a series. Always rendered — every
	 * fill variant and the buffer-bar stroke paint from this single gradient.
	 */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';

	let { id, dataKey, config }: { id: string; dataKey: string; config: ChartConfig } = $props();

	const colorsCount = $derived(getColorsCount(config[dataKey] ?? {}));
</script>

<linearGradient id={`${id}-colors-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
	{#if colorsCount === 1}
		<stop offset="0%" stop-color={`var(--color-${dataKey}-0)`} />
		<stop offset="100%" stop-color={`var(--color-${dataKey}-0)`} />
	{:else}
		{#each Array.from({ length: colorsCount }, (_, index) => `${(index / (colorsCount - 1)) * 100}%`) as offset, index (offset)}
			<stop {offset} stop-color={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`} />
		{/each}
	{/if}
</linearGradient>
