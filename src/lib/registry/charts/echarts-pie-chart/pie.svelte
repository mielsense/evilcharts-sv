<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useEChartsPieChart } from './pie-chart-context.svelte.js';
	import { setEChartsPieSlots } from './pie-slots.svelte.js';
	import {
		DEFAULT_CORNER_RADIUS,
		DEFAULT_END_ANGLE,
		DEFAULT_INNER_RADIUS,
		DEFAULT_OUTER_RADIUS,
		DEFAULT_PADDING_ANGLE,
		DEFAULT_START_ANGLE,
		type PieVariant
	} from './types.js';

	let {
		variant = 'gradient',
		innerRadius = DEFAULT_INNER_RADIUS,
		outerRadius = DEFAULT_OUTER_RADIUS,
		cornerRadius = DEFAULT_CORNER_RADIUS,
		paddingAngle = DEFAULT_PADDING_ANGLE,
		startAngle = DEFAULT_START_ANGLE,
		endAngle = DEFAULT_END_ANGLE,
		isClickable = false,
		children
	}: {
		variant?: PieVariant;
		innerRadius?: number | string;
		outerRadius?: number | string;
		cornerRadius?: number;
		paddingAngle?: number;
		startAngle?: number;
		endAngle?: number;
		isClickable?: boolean;
		children?: Snippet;
	} = $props();

	const token = $props.id();
	const chart = useEChartsPieChart();
	const slots = setEChartsPieSlots();

	$effect(() =>
		chart.pies.register(token, () => {
			const label = slots.labels.first;
			return {
				variant,
				innerRadius,
				outerRadius,
				cornerRadius,
				paddingAngle,
				startAngle,
				endAngle,
				isClickable,
				labelDataKey: label ? (label.dataKey ?? '') : null,
				labelPosition: label?.position ?? 'inside'
			};
		})
	);
</script>

{@render children?.()}
