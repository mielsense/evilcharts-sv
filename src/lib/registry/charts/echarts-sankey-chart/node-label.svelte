<script lang="ts">
	import { useEChartsSankeyNodeSlots } from './node-slots.svelte.js';
	import type { NodeLabelPosition } from './types.js';

	let {
		position,
		showValues = false,
		valueFormatter
	}: {
		position?: NodeLabelPosition;
		showValues?: boolean;
		valueFormatter?: (value: number) => string;
	} = $props();
	const token = $props.id();
	const slots = useEChartsSankeyNodeSlots();
	$effect(() => slots.labels.register(token, () => ({ position, showValues, valueFormatter })));
</script>
