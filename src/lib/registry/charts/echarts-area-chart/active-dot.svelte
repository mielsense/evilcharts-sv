<script lang="ts">
	import type { DotVariant } from '../../ui/echarts-dot/index.js';
	import { useEChartsAreaSlots } from './area-slots.svelte.js';
	let { variant = 'default' }: { variant?: DotVariant } = $props();
	const token = $props.id();
	const slots = useEChartsAreaSlots();
	$effect(() => slots.activeDots.register(token, () => ({ variant })));
</script>
