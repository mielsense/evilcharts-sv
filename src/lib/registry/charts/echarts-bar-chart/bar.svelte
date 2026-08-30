<script lang="ts">
	import { useEChartsBarChart } from './bar-chart-context.svelte.js';
	import type { DitherVariant } from '../../ui/echarts-dither/index.js';
	import { type BarAnimationType, type BarVariant } from './types.js';
	let {
		dataKey,
		variant = 'default',
		radius,
		animationType,
		isClickable = false,
		enableHoverHighlight = false,
		glowing = false,
		bufferBar = false,
		ditherVariant
	}: {
		dataKey: string;
		variant?: BarVariant;
		radius?: number;
		animationType?: BarAnimationType;
		isClickable?: boolean;
		enableHoverHighlight?: boolean;
		glowing?: boolean;
		bufferBar?: boolean;
		ditherVariant?: DitherVariant;
	} = $props();
	const token = $props.id();
	const chart = useEChartsBarChart();
	$effect(() =>
		chart.bars.register(token, () => ({
			dataKey,
			variant,
			radius,
			animationType,
			isClickable,
			enableHoverHighlight,
			glowing,
			bufferBar,
			ditherVariant
		}))
	);
</script>
