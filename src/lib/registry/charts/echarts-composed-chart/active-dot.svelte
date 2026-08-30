<script lang="ts">
	import type { DotVariant } from '../../ui/echarts-dot/index.js';
	import { useEChartsComposedLineSlots } from './line-slots.svelte.js';
	let { variant = 'default' }: { variant?: DotVariant } = $props();
	const token = $props.id();
	const slots = useEChartsComposedLineSlots();
	$effect(() => slots.activeDots.register(token, () => ({ variant })));
</script>
