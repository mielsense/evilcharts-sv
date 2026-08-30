<script lang="ts">
	import type { ChartConfig } from '../../ui/echarts-chart/index.js';
	import { EChartsSankeyChart, type SankeyData } from './index.js';

	let { unexpected = false }: { unexpected?: boolean } = $props();

	const cyclicData = {
		nodes: [{ name: 'Source' }, { name: 'Target' }],
		links: [
			{ source: 0, target: 1, value: 1 },
			{ source: 1, target: 0, value: 1 }
		]
	} satisfies SankeyData;
	const unexpectedData = {
		get nodes(): SankeyData['nodes'] {
			throw new RangeError('Unexpected data failure.');
		},
		links: [{ source: 0, target: 1, value: 1 }]
	} satisfies SankeyData;
	const chartData = $derived(unexpected ? unexpectedData : cyclicData);
	const config = {
		Source: { label: 'Source', colors: { light: ['#3b82f6'] } },
		Target: { label: 'Target', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;
</script>

<div style="height: 200px; width: 320px;">
	<EChartsSankeyChart
		data={chartData}
		{config}
		initialDimension={{ width: 320, height: 200 }}
		class="h-full"
	>
		<EChartsSankeyChart.Node isClickable />
		<EChartsSankeyChart.Link />
	</EChartsSankeyChart>
</div>

<style>
	:global([data-slot='echarts-host']) {
		width: 320px;
		height: 200px;
	}
</style>
