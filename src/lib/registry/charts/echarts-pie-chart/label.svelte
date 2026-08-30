<script lang="ts">
	import { useEChartsPieSlots } from './pie-slots.svelte.js';
	import type { LabelPosition } from './types.js';

	let { dataKey, position = 'inside' }: { dataKey?: string; position?: LabelPosition } = $props();
	const token = $props.id();
	const slots = useEChartsPieSlots();
	$effect(() => slots.labels.register(token, () => ({ dataKey, position })));
</script>
