<script lang="ts">
	import { EvilBarChart } from './layerchart-bar-chart/index.js';
	import { EvilComposedChart } from './layerchart-composed-chart/index.js';
	import { EvilRadarChart } from './layerchart-radar-chart/index.js';

	let { family }: { family: 'bar' | 'composed' | 'radar' } = $props();

	const cartesianData = [
		{ month: 'January', desktop: 10, mobile: 20, phantom: 10_000 },
		{ month: 'February', desktop: 8, mobile: 16, phantom: 10_000 }
	];
	const radarData = [
		{ skill: 'A', desktop: 10, phantom: 10_000 },
		{ skill: 'B', desktop: 8, phantom: 10_000 },
		{ skill: 'C', desktop: 6, phantom: 10_000 }
	];
	const config = {
		phantom: { label: 'Phantom', color: '#111827' },
		desktop: { label: 'Desktop', color: '#2563eb' },
		mobile: { label: 'Mobile', color: '#db2777' }
	};
</script>

{#if family === 'bar'}
	<div class="h-[240px] w-[400px]" data-test="bar">
		<EvilBarChart data={cartesianData} {config} animationType="none">
			<EvilBarChart.Grid />
			<EvilBarChart.XAxis dataKey="month" />
			<EvilBarChart.Legend />
			<EvilBarChart.Bar dataKey="desktop" />
		</EvilBarChart>
	</div>
{/if}

{#if family === 'composed'}
	<div class="h-[240px] w-[400px]" data-test="composed">
		<EvilComposedChart data={cartesianData} {config} animationType="none">
			<EvilComposedChart.Grid />
			<EvilComposedChart.XAxis dataKey="month" />
			<EvilComposedChart.Legend />
			<EvilComposedChart.Bar dataKey="desktop" />
			<EvilComposedChart.Line dataKey="mobile" animationType="none" />
		</EvilComposedChart>
	</div>
{/if}

{#if family === 'radar'}
	<div class="h-[240px] w-[400px]" data-test="radar">
		<EvilRadarChart data={radarData} {config}>
			<EvilRadarChart.PolarGrid />
			<EvilRadarChart.PolarAngleAxis dataKey="skill" />
			<EvilRadarChart.Legend />
			<EvilRadarChart.Radar dataKey="desktop" />
		</EvilRadarChart>
	</div>
{/if}
