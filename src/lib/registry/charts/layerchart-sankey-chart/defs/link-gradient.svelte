<script lang="ts">
	/** Source-to-target fade gradient that fills a single gradient-variant link. */
	import type { ChartConfig } from '../../../ui/layerchart-chart/chart-config.js';

	let {
		chartId,
		index,
		config,
		sourceName,
		targetName
	}: {
		chartId: string;
		index: number;
		config: ChartConfig;
		sourceName: string;
		targetName: string;
	} = $props();

	const sourceColor = $derived(
		sourceName in config ? `var(--color-${sourceName}-0)` : 'currentColor'
	);
	const targetColor = $derived(
		targetName in config ? `var(--color-${targetName}-0)` : 'currentColor'
	);
</script>

<linearGradient id={`${chartId}-link-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
	<stop offset="0%" stop-color={sourceColor} stop-opacity={0.2} />
	<stop offset="50%" stop-color={sourceColor} stop-opacity={0.5} />
	<stop offset="100%" stop-color={targetColor} stop-opacity={0.2} />
</linearGradient>
