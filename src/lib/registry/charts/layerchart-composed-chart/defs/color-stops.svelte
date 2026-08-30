<script lang="ts">
	/**
	 * The series' colour stops, shared by both gradient orientations.
	 *
	 * A single-colour series still emits two stops (0% and 100%) so the gradient paints a flat
	 * fill rather than a fade, exactly as the reference does.
	 */
	import { chartColorVariable } from '../../../ui/layerchart-chart/colors.js';

	let { dataKey, colorsCount }: { dataKey: string; colorsCount: number } = $props();
</script>

{#if colorsCount === 1}
	<stop offset="0%" stop-color={chartColorVariable(dataKey, 0)} />
	<stop offset="100%" stop-color={chartColorVariable(dataKey, 0)} />
{:else}
	{#each Array.from({ length: colorsCount }, (_, index) => `${(index / (colorsCount - 1)) * 100}%`) as offset, index (offset)}
		<stop {offset} stop-color={chartColorVariable(dataKey, index, 0)} />
	{/each}
{/if}
