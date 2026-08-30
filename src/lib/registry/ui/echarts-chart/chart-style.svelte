<script lang="ts">
	import { buildChartCss } from './colors.js';
	import type { ChartConfig } from './types.js';

	let { id, config }: { id: string; config: ChartConfig } = $props();
	const css = $derived(buildChartCss(id, config));
</script>

{#if css}
	<svelte:element this={'style'}>{css}</svelte:element>
{/if}

