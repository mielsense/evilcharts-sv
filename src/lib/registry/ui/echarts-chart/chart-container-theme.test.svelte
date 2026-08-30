<script lang="ts">
	import ChartContainer from './chart-container.svelte';
	import type { ChartConfig } from './types.js';

	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#ff0000'] } }
	} satisfies ChartConfig;
	let themeRevision = $state(0);
</script>

<ChartContainer {config} bind:themeRevision>
	<span data-descendant>content</span>
</ChartContainer>
<output data-revision>{themeRevision}</output>
