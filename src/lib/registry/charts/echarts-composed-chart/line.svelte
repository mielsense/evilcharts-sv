<script lang="ts">
	import type { LineSeriesOption } from 'echarts/charts';
	import type { DitherVariant } from '../../ui/echarts-dither/index.js';
	import type { Snippet } from 'svelte';
	import { useEChartsComposedChart } from './composed-chart-context.svelte.js';
	import { setEChartsComposedLineSlots } from './line-slots.svelte.js';
	import type { ComposedAnimationType, CurveType, StrokeVariant } from './types.js';
	let {
		dataKey,
		strokeVariant = 'solid',
		curveType,
		animationType,
		connectNulls = false,
		glow = false,
		isClickable = false,
		lineProps,
		children,
		ditherVariant
	}: {
		dataKey: string;
		strokeVariant?: StrokeVariant;
		curveType?: CurveType;
		animationType?: ComposedAnimationType;
		connectNulls?: boolean;
		glow?: boolean;
		isClickable?: boolean;
		lineProps?: Partial<LineSeriesOption>;
		children?: Snippet;
		ditherVariant?: DitherVariant;
	} = $props();
	const token = $props.id();
	const chart = useEChartsComposedChart();
	const slots = setEChartsComposedLineSlots();
	$effect(() =>
		chart.lines.register(token, () => ({
			dataKey,
			strokeVariant,
			curveType,
			animationType,
			connectNulls,
			glow,
			isClickable,
			lineProps,
			dotVariant: slots.dots.first?.variant ?? 'none',
			activeDotVariant: slots.activeDots.first?.variant ?? 'none',
			ditherVariant
		}))
	);
</script>

{@render children?.()}
