<script lang="ts">
	/** `LandingLinesRadarChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
	import { EvilRadarChart } from '$lib/registry/charts/layerchart-radar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const radarData = [
		{ axis: 'Speed', core: 92, edge: 74 },
		{ axis: 'Uptime', core: 86, edge: 95 },
		{ axis: 'Scale', core: 78, edge: 88 },
		{ axis: 'DX', core: 95, edge: 70 },
		{ axis: 'A11y', core: 82, edge: 79 },
		{ axis: 'Theming', core: 90, edge: 84 }
	];
	const linesRadarConfig = {
		core: {
			label: 'Current',
			colors: {
				light: ['#7c3aed', '#c026d3'],
				dark: ['#a78bfa', '#e879f9']
			}
		},
		edge: {
			label: 'Target',
			colors: {
				light: ['#4d7c0f', '#059669'],
				dark: ['#a3e635', '#34d399']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilRadarChart data={radarData} config={linesRadarConfig} class="h-full w-full p-3">
	<EvilRadarChart.PolarGrid />
	<EvilRadarChart.PolarAngleAxis dataKey="axis" />
	<EvilRadarChart.Tooltip />
	<EvilRadarChart.Radar dataKey="core" variant="lines">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
	<EvilRadarChart.Radar dataKey="edge" variant="lines">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
</EvilRadarChart>
