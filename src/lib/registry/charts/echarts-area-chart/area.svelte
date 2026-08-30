<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useEChartsAreaChart } from './area-chart-context.svelte.js';
	import type { DitherVariant } from '../../ui/echarts-dither/index.js';
	import { setEChartsAreaSlots } from './area-slots.svelte.js';
	import {
		STROKE_WIDTH,
		type AreaAnimationType,
		type AreaVariant,
		type CurveType,
		type StrokeVariant
	} from './types.js';

	let {
		dataKey,
		variant = 'gradient',
		strokeVariant = 'dashed',
		strokeWidth = STROKE_WIDTH,
		curveType,
		animationType,
		connectNulls = false,
		isClickable = false,
		enableBufferLine = false,
		ditherVariant,
		children
	}: {
		dataKey: string;
		variant?: AreaVariant;
		strokeVariant?: StrokeVariant;
		strokeWidth?: number;
		curveType?: CurveType;
		animationType?: AreaAnimationType;
		connectNulls?: boolean;
		isClickable?: boolean;
		enableBufferLine?: boolean;
		ditherVariant?: DitherVariant;
		children?: Snippet;
	} = $props();

	const token = $props.id();
	const chart = useEChartsAreaChart();
	const slots = setEChartsAreaSlots();
	$effect(() =>
		chart.areas.register(token, () => ({
			dataKey,
			variant,
			strokeVariant,
			strokeWidth,
			curveType,
			animationType,
			connectNulls,
			isClickable,
			enableBufferLine,
			ditherVariant,
			dotVariant: slots.dots.first?.variant ?? 'none',
			activeDotVariant: slots.activeDots.first?.variant ?? 'none'
		}))
	);
</script>

{@render children?.()}
