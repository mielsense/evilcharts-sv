<script lang="ts">
	/**
	 * One `<stop>` per colour, with an optional per-stop opacity ramp. A single-colour series still
	 * emits two stops so the gradient paints a flat fill rather than a fade.
	 */
	import { chartColorVariable } from '../../../ui/layerchart-chart/colors.js';

	let {
		dataKey,
		colorsCount,
		opacities
	}: { dataKey: string; colorsCount: number; opacities?: number[] } = $props();
</script>

{#if colorsCount === 1}
	<stop offset="0%" stop-color={chartColorVariable(dataKey, 0)} stop-opacity={opacities?.[0]} />
	<stop
		offset="100%"
		stop-color={chartColorVariable(dataKey, 0)}
		stop-opacity={opacities?.[opacities.length - 1]}
	/>
{:else}
	{#each Array.from({ length: colorsCount }, (_, index) => index) as index (index)}
		<stop
			offset={`${(index / (colorsCount - 1)) * 100}%`}
			stop-color={chartColorVariable(dataKey, index, 0)}
			stop-opacity={opacities?.[index]}
		/>
	{/each}
{/if}
