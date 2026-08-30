<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DitherVariant } from '../../ui/echarts-dither/index.js';
	import { useEChartsRadarChart } from './radar-chart-context.svelte.js';
	import { setEChartsRadarSlots } from './radar-slots.svelte.js';
	import { DEFAULT_FILL_OPACITY, type RadarStrokeVariant, type RadarVariant } from './types.js';

	let {
		dataKey,
		variant = 'filled',
		strokeVariant = 'solid',
		fillOpacity = DEFAULT_FILL_OPACITY,
		isClickable = false,
		glowing = false,
		ditherVariant,
		children
	}: {
		dataKey: string;
		variant?: RadarVariant;
		strokeVariant?: RadarStrokeVariant;
		fillOpacity?: number;
		isClickable?: boolean;
		glowing?: boolean;
		ditherVariant?: DitherVariant;
		children?: Snippet;
	} = $props();

	const token = $props.id();
	const chart = useEChartsRadarChart();
	const slots = setEChartsRadarSlots();

	$effect(() =>
		chart.radars.register(token, () => ({
			dataKey,
			variant,
			strokeVariant,
			fillOpacity,
			isClickable,
			glowing,
			ditherVariant,
			dotVariant: slots.dots.first?.variant ?? 'none',
			activeDotVariant: slots.activeDots.first?.variant ?? 'none'
		}))
	);
</script>

{@render children?.()}
