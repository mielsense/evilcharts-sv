<script lang="ts">
	import { getEChartsSharedSlotContext } from '../../ui/echarts-chart/index.js';
	import type { LegendProps, LegendVariant } from '../../ui/echarts-legend/index.js';

	let {
		variant = 'rounded-square',
		align = 'center',
		verticalAlign = 'bottom',
		isClickable = false
	}: LegendProps = $props();

	const token = $props.id();
	const slots = getEChartsSharedSlotContext();
	$effect(() =>
		slots.register('legend', token, () => ({
			variant: variant as LegendVariant,
			align,
			verticalAlign,
			isClickable
		}))
	);
</script>
