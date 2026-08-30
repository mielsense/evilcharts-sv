<script lang="ts">
	import type { BarSeriesOption } from 'echarts/charts';
	import type { DitherVariant } from '../../ui/echarts-dither/index.js';
	import { useEChartsComposedChart } from './composed-chart-context.svelte.js';
	import type { BarVariant, ComposedAnimationType } from './types.js';
	let {
		dataKey,
		variant = 'default',
		radius = 4,
		glow = false,
		animationType,
		isClickable = false,
		enableHoverHighlight = false,
		barProps,
		ditherVariant
	}: {
		dataKey: string;
		variant?: BarVariant;
		radius?: number;
		glow?: boolean;
		animationType?: ComposedAnimationType;
		isClickable?: boolean;
		enableHoverHighlight?: boolean;
		barProps?: Partial<BarSeriesOption>;
		ditherVariant?: DitherVariant;
	} = $props();
	const token = $props.id();
	const chart = useEChartsComposedChart();
	$effect(() =>
		chart.bars.register(token, () => ({
			dataKey,
			variant,
			radius,
			glow,
			animationType,
			isClickable,
			enableHoverHighlight,
			barProps,
			ditherVariant
		}))
	);
</script>
