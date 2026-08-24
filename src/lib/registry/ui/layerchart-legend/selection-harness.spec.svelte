<script lang="ts">
	import ChartContainer from '../layerchart-chart/chart-container.svelte';
	import type { ChartConfig } from '../layerchart-chart/chart-config.js';
	import ChartLegendContent from './legend-content.svelte';

	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#047857'] } },
		mobile: { label: 'Mobile', colors: { light: ['#be123c'] } }
	} satisfies ChartConfig;

	let selected = $state<string | null>(null);
	const payload = [
		{ dataKey: 'desktop', value: 'desktop' },
		{ dataKey: 'mobile', value: 'mobile' }
	];
</script>

<button data-set onclick={() => (selected = 'desktop')}>set</button>
<ChartContainer {config} id="react-harness">
	<ChartLegendContent {payload} {selected} isClickable onSelectChange={(s) => (selected = s)} />
</ChartContainer>
