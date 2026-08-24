<script lang="ts">
	/** Horizontal left-to-right color gradient — the stroke source for a line series. */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';
	import ColorStops from './color-stops.svelte';

	let { id, dataKey, config }: { id: string; dataKey: string; config: ChartConfig } = $props();

	const colorsCount = $derived(getColorsCount(config[dataKey] ?? {}));
</script>

<linearGradient id={`${id}-line-colors-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
	<ColorStops {dataKey} {colorsCount} />
</linearGradient>
