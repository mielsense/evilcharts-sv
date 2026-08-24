<script lang="ts">
	/** `LandingCircleRadarChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
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
	const circleRadarConfig = {
		core: {
			label: 'Q3',
			colors: {
				light: ['#d97706', '#dc2626'],
				dark: ['#fbbf24', '#f87171']
			}
		},
		edge: {
			label: 'Q4',
			colors: {
				light: ['#059669', '#0891b2'],
				dark: ['#34d399', '#22d3ee']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilRadarChart data={radarData} config={circleRadarConfig} class="h-full w-full p-3">
	<EvilRadarChart.PolarGrid gridType="circle" />
	<EvilRadarChart.PolarAngleAxis dataKey="axis" />
	<EvilRadarChart.Tooltip />
	<EvilRadarChart.Radar dataKey="core" variant="filled">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
	<EvilRadarChart.Radar dataKey="edge" variant="filled">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
</EvilRadarChart>
