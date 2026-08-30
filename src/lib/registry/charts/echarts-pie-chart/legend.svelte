<script lang="ts">
	import { getEChartsSharedSlotContext } from '../../ui/echarts-chart/index.js';
	import type { LegendVariant } from '../../ui/echarts-legend/index.js';

	let {
		variant = 'rounded-square',
		align = 'center',
		verticalAlign = 'bottom',
		isClickable = false
	}: {
		variant?: LegendVariant;
		align?: 'left' | 'center' | 'right';
		verticalAlign?: 'top' | 'middle' | 'bottom';
		isClickable?: boolean;
	} = $props();

	const token = $props.id();
	const slots = getEChartsSharedSlotContext();
	$effect(() =>
		slots.register('legend', token, () => ({ variant, align, verticalAlign, isClickable }))
	);
</script>
