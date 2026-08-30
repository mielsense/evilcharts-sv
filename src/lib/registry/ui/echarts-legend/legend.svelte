<script lang="ts">
	import { getEChartsSharedSlotContext } from '../echarts-chart/index.js';

	export type LegendVariant =
		| 'square'
		| 'circle'
		| 'circle-outline'
		| 'rounded-square'
		| 'rounded-square-outline'
		| 'vertical-bar'
		| 'horizontal-bar';

	export type LegendProps = {
		variant?: LegendVariant;
		align?: 'left' | 'center' | 'right';
		verticalAlign?: 'top' | 'middle' | 'bottom';
		isClickable?: boolean;
	};

	let {
		variant = 'rounded-square',
		align = 'right',
		verticalAlign = 'top',
		isClickable = false
	}: LegendProps = $props();

	const token = $props.id();
	const slots = getEChartsSharedSlotContext();
	$effect(() =>
		slots.register('legend', token, () => ({ variant, align, verticalAlign, isClickable }))
	);
</script>
