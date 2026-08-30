<script lang="ts">
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';
	import { EvilSankeyChart, type SankeyData } from './index.js';

	let { unexpected = false }: { unexpected?: boolean } = $props();

	const cyclicData = {
		nodes: [{ name: 'Source' }, { name: 'Target' }],
		links: [
			{ source: 0, target: 1, value: 1 },
			{ source: 1, target: 0, value: 1 }
		]
	} satisfies SankeyData;
	let unexpectedNodeReads = 0;
	const unexpectedData = {
		get nodes() {
			if (unexpectedNodeReads++ === 0) throw new RangeError('Unexpected layout failure.');
			return [{ name: 'Source' }, { name: 'Target' }];
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
	<EvilSankeyChart data={chartData} {config} initialDimension={{ width: 320, height: 200 }}>
		<EvilSankeyChart.Node isClickable />
		<EvilSankeyChart.Link />
	</EvilSankeyChart>
</div>
