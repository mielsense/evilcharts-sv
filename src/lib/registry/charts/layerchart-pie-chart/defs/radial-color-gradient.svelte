<script lang="ts">
	/**
	 * Radial-style colour gradients, one per sector. Each sector's fill paints from the gradient
	 * that matches its name, supporting both single and multi-colour config entries.
	 *
	 * The gradient runs corner to corner (`0,0 → 1,1`), which is what gives a single-colour sector
	 * its flat fill and a multi-colour sector its diagonal ramp.
	 */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';

	// `variant` is accepted for parity with the reference, which threads it through but only ever
	// has the one value; the underscore marks it as deliberately unused.
	let {
		id,
		config,
		variant: _variant
	}: { id: string; config: ChartConfig; variant?: 'gradient' } = $props();

	const sectors = $derived(
		Object.entries(config).map(([sectorKey, sectorConfig]) => ({
			sectorKey,
			colorsCount: getColorsCount(sectorConfig)
		}))
	);
</script>

{#each sectors as { sectorKey, colorsCount } (sectorKey)}
	<linearGradient id={`${id}-colors-${sectorKey}`} x1="0" y1="0" x2="1" y2="1">
		{#if colorsCount === 1}
			<stop offset="0%" stop-color={`var(--color-${sectorKey}-0)`} />
			<stop offset="100%" stop-color={`var(--color-${sectorKey}-0)`} />
		{:else}
			{#each Array.from({ length: colorsCount }, (_, index) => `${(index / (colorsCount - 1)) * 100}%`) as offset, index (offset)}
				<stop
					{offset}
					stop-color={`var(--color-${sectorKey}-${index}, var(--color-${sectorKey}-0))`}
				/>
			{/each}
		{/if}
	</linearGradient>
{/each}
