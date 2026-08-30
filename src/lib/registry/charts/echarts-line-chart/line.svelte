<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LineSeriesOption } from 'echarts/charts';
	import type { DitherVariant } from '../../ui/echarts-dither/index.js';
	import { useEChartsLineChart } from './line-chart-context.svelte.js';
	import { setEChartsLineSlots } from './line-slots.svelte.js';
	import {
		STROKE_WIDTH,
		type CurveType,
		type LineAnimationType,
		type StrokeVariant
	} from './types.js';

	let {
		dataKey,
		strokeVariant = 'solid',
		strokeWidth = STROKE_WIDTH,
		curveType,
		animationType,
		connectNulls = false,
		isClickable = false,
		glowing = false,
		enableBufferLine = false,
		lineProps,
		ditherVariant,
		children
	}: {
		dataKey: string;
		strokeVariant?: StrokeVariant;
		strokeWidth?: number;
		curveType?: CurveType;
		animationType?: LineAnimationType;
		connectNulls?: boolean;
		isClickable?: boolean;
		glowing?: boolean;
		enableBufferLine?: boolean;
		lineProps?: Partial<LineSeriesOption>;
		ditherVariant?: DitherVariant;
		children?: Snippet;
	} = $props();

	const token = $props.id();
	const chart = useEChartsLineChart();
	const slots = setEChartsLineSlots();

	$effect(() =>
		chart.lines.register(token, () => ({
			dataKey,
			strokeVariant,
			strokeWidth,
			curveType,
			animationType,
			connectNulls,
			isClickable,
			glowing,
			enableBufferLine,
			lineProps,
			ditherVariant,
			dotVariant: slots.dots.first?.variant ?? 'none',
			activeDotVariant: slots.activeDots.first?.variant ?? 'none'
		}))
	);
</script>

{@render children?.()}
