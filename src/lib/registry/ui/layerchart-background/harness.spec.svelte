<script lang="ts">
	import ChartBackground from './chart-background.svelte';
	import type { BackgroundVariant } from './types.js';

	let { variant, twice = false }: { variant: BackgroundVariant; twice?: boolean } = $props();
</script>

<svg data-testid="host" width="200" height="100">
	<ChartBackground {variant} />
	{#if twice}
		<ChartBackground {variant} />
	{/if}
</svg>
