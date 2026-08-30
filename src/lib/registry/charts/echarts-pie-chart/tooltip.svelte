<script lang="ts">
	import { getEChartsSharedSlotContext } from '../../ui/echarts-chart/index.js';
	import type {
		TooltipPosition,
		TooltipRoundness,
		TooltipVariant
	} from '../../ui/echarts-tooltip/index.js';

	let {
		variant = 'default',
		roundness = 'lg',
		defaultIndex,
		position = 'variable'
	}: {
		variant?: TooltipVariant;
		roundness?: TooltipRoundness;
		defaultIndex?: number;
		position?: TooltipPosition;
	} = $props();

	const token = $props.id();
	const slots = getEChartsSharedSlotContext();
	$effect(() =>
		slots.register('tooltip', token, () => ({ variant, roundness, defaultIndex, position }))
	);
</script>
