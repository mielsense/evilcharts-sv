<script lang="ts">
	import { getEChartsSharedSlotContext } from '../echarts-chart/index.js';

	export type BrushProps = {
		height?: number;
		formatLabel?: (value: string, index: number) => string;
		onChange?: (range: { startIndex: number; endIndex: number }) => void;
	};

	let { height, formatLabel, onChange }: BrushProps = $props();
	const token = $props.id();
	const slots = getEChartsSharedSlotContext();
	$effect(() => slots.register('brush', token, () => ({ height, formatLabel, onChange })));
</script>

