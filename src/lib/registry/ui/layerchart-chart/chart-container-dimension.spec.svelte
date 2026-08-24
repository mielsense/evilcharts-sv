<script lang="ts">
	import ChartContainer from './chart-container.svelte';
	import type { ChartConfig } from './chart-config.js';

	const config: ChartConfig = { value: { label: 'Value' } };
	let width = $state(0);
	let dimension = $state({ width: 0, height: 0 });
</script>

<button type="button" onclick={() => (width = 480)}>resize</button>
<output>{dimension.width}x{dimension.height}</output>
<div data-test="dimension-host" style:width={`${width}px`} style:height="240px">
	<ChartContainer {config} initialDimension={{ width: 640, height: 360 }} bind:dimension>
		<div style="height: 240px"></div>
	</ChartContainer>
</div>
