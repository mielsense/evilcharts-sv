<script lang="ts">
	/** Vertical colour gradient for every configured node, painted by name. */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';

	let { config, chartId }: { config: ChartConfig; chartId: string } = $props();

	const gradients = $derived(
		Object.entries(config).map(([dataKey, nodeConfig]) => ({
			dataKey,
			colorsCount: getColorsCount(nodeConfig)
		}))
	);
</script>

{#each gradients as { dataKey, colorsCount } (dataKey)}
	<linearGradient id={`${chartId}-sankey-colors-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
		{#if colorsCount === 1}
			<stop offset="0%" stop-color={`var(--color-${dataKey}-0)`} />
			<stop offset="100%" stop-color={`var(--color-${dataKey}-0)`} />
		{:else}
			{#each Array.from({ length: colorsCount }, (_, index) => index) as index (index)}
				<stop
					offset={`${(index / (colorsCount - 1)) * 100}%`}
					stop-color={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`}
				/>
			{/each}
		{/if}
	</linearGradient>
{/each}
