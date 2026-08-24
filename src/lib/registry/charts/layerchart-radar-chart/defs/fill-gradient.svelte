<script lang="ts">
	/** Radial colour gradient used for the radar's filled area, fading toward the edge. */
	import { getColorsCount } from '../../../ui/layerchart-chart/colors.js';
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';
	import ColorStops from './color-stops.svelte';

	let { id, dataKey, config }: { id: string; dataKey: string; config: ChartConfig } = $props();

	const colorsCount = $derived(getColorsCount(config[dataKey] ?? {}));
	const opacities = $derived(
		colorsCount === 1
			? [0.8, 0.3]
			: Array.from({ length: colorsCount }, (_, index) => (index === 0 ? 0.8 : 0.3))
	);
</script>

<radialGradient id={`${id}-radar-fill-${dataKey}`} cx="50%" cy="50%" r="50%">
	<ColorStops {dataKey} {colorsCount} {opacities} />
</radialGradient>
