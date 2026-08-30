<script lang="ts">
	import type { DotVariant } from '../../ui/echarts-dot/index.js';
	import { useEChartsRadarSlots } from './radar-slots.svelte.js';

	let { variant = 'default' }: { variant?: DotVariant } = $props();
	const token = $props.id();
	const slots = useEChartsRadarSlots();
	$effect(() => slots.activeDots.register(token, () => ({ variant })));
</script>
