<script lang="ts">
	/**
	 * Diagonal colour gradient applied to every radial bar, one per config key.
	 *
	 * A single chart-level block keyed by `chartId`, unlike the per-series generators in the other
	 * charts — the reference does the same, because every bar shares one `<defs>`.
	 */
	import { chartColorVariable, getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';

	let { config, chartId }: { config: ChartConfig; chartId: string } = $props();

	const gradients = $derived(
		Object.entries(config).map(([dataKey, colorConfig]) => ({
			dataKey,
			colorsCount: getColorsCount(colorConfig)
		}))
	);
</script>

{#each gradients as { dataKey, colorsCount } (dataKey)}
	<linearGradient id={`${chartId}-radial-colors-${dataKey}`} x1="0" y1="0" x2="1" y2="1">
		{#if colorsCount === 1}
			<stop offset="0%" stop-color={chartColorVariable(dataKey, 0)} />
			<stop offset="100%" stop-color={chartColorVariable(dataKey, 0)} />
		{:else}
			{#each Array.from({ length: colorsCount }, (_, index) => index) as index (index)}
				<stop
					offset={`${(index / (colorsCount - 1)) * 100}%`}
					stop-color={chartColorVariable(dataKey, index, 0)}
				/>
			{/each}
		{/if}
	</linearGradient>
{/each}
