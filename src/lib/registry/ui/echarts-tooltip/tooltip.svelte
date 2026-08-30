<script lang="ts">
	import { getEChartsSharedSlotContext } from '../echarts-chart/index.js';
	import type { TooltipPosition, TooltipRoundness, TooltipVariant } from './tooltip.js';

	export type TooltipProps = {
		variant?: TooltipVariant;
		roundness?: TooltipRoundness;
		cursor?: boolean;
		defaultIndex?: number;
		position?: TooltipPosition;
	};

	let {
		variant = 'default',
		roundness = 'lg',
		cursor,
		defaultIndex,
		position = 'variable'
	}: TooltipProps = $props();

	const token = $props.id();
	const slots = getEChartsSharedSlotContext();

	$effect(() =>
		slots.register('tooltip', token, () => ({
			variant,
			roundness,
			cursor,
			defaultIndex,
			position
		}))
	);
</script>

