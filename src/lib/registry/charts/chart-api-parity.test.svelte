<script lang="ts">
	import { EvilPieChart } from './layerchart-pie-chart/index.js';
	import { EvilRadialChart } from './layerchart-radial-chart/index.js';
	import { EvilSankeyChart } from './layerchart-sankey-chart/index.js';

	const polarData = [
		{ name: 'Alpha', value: 60 },
		{ name: 'Beta', value: 40 }
	];
	const polarConfig = {
		Alpha: { label: 'Alpha', colors: { light: ['#2563eb'], dark: ['#60a5fa'] } },
		Beta: { label: 'Beta', colors: { light: ['#db2777'], dark: ['#f472b6'] } }
	};
	const sankeyData = {
		nodes: [{ name: 'Alpha' }, { name: 'Beta' }],
		links: [{ source: 0, target: 1, value: 10 }]
	};
</script>

<div class="h-[240px] w-[400px]" data-test="pie">
	<EvilPieChart config={polarConfig} data={polarData} dataKey="value" nameKey="name">
		<EvilPieChart.Pie
			arcProps={{ 'data-parity-prop': 'legacy-pie' }}
			pieProps={{ 'data-parity-prop': 'pie' }}
		>
			<EvilPieChart.Label
				labelProps={{ 'data-parity-label': 'legacy-pie-label' }}
				labelListProps={{ 'data-parity-label': 'pie-label' }}
			/>
		</EvilPieChart.Pie>
	</EvilPieChart>
</div>

<div class="h-[240px] w-[400px]" data-test="radial">
	<EvilRadialChart config={polarConfig} data={polarData} nameKey="name">
		<EvilRadialChart.RadialBar
			dataKey="value"
			arcProps={{ 'data-parity-prop': 'legacy-radial' }}
			radialBarProps={{ 'data-parity-prop': 'radial' }}
		/>
	</EvilRadialChart>
</div>

<div class="h-[240px] w-[400px]" data-test="sankey">
	<EvilSankeyChart
		config={polarConfig}
		data={sankeyData}
		chartProps={{ 'data-parity-prop': 'legacy-sankey' }}
		sankeyProps={{ 'data-parity-prop': 'sankey' }}
	>
		<EvilSankeyChart.Node />
		<EvilSankeyChart.Link />
	</EvilSankeyChart>
</div>
