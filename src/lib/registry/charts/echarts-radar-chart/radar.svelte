<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useEChartsRadarChart } from './radar-chart-context.svelte.js';
	import { setEChartsRadarSlots } from './radar-slots.svelte.js';
	import { DEFAULT_FILL_OPACITY, type RadarVariant } from './types.js';

	let {
		dataKey,
		variant = 'filled',
		fillOpacity = DEFAULT_FILL_OPACITY,
		isClickable = false,
		children
	}: {
		dataKey: string;
		variant?: RadarVariant;
		fillOpacity?: number;
		isClickable?: boolean;
		children?: Snippet;
	} = $props();

	const token = $props.id();
	const chart = useEChartsRadarChart();
	const slots = setEChartsRadarSlots();

	$effect(() =>
		chart.radars.register(token, () => ({
			dataKey,
			variant,
			fillOpacity,
			isClickable,
			dotVariant: slots.dots.first?.variant ?? 'none',
			activeDotVariant: slots.activeDots.first?.variant ?? 'none'
		}))
	);
</script>

{@render children?.()}
