<script lang="ts">
	/** Vertical top-to-bottom color gradient — the fill source for every bar variant. */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';
	import ColorStops from './color-stops.svelte';

	let { id, dataKey, config }: { id: string; dataKey: string; config: ChartConfig } = $props();

	const colorsCount = $derived(getColorsCount(config[dataKey] ?? {}));
</script>

<linearGradient id={`${id}-bar-colors`} x1="0" y1="0" x2="0" y2="1">
	<ColorStops {dataKey} {colorsCount} />
</linearGradient>
