<script lang="ts">
	import type { DotVariant } from '../../ui/echarts-dot/index.js';
	import { useEChartsLineSlots } from './line-slots.svelte.js';

	let { variant = 'default' }: { variant?: DotVariant } = $props();
	const token = $props.id();
	const slots = useEChartsLineSlots();
	$effect(() => slots.activeDots.register(token, () => ({ variant })));
</script>

