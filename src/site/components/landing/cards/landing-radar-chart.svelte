<script lang="ts">
	/** `LandingRadarChart` from the reference's `src/components/landing/landing-chart-cards.tsx`. */
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
	const radarConfig = {
		core: {
			label: 'Core',
			colors: {
				light: ['#e11d48', '#f97316', '#eab308'],
				dark: ['#fb7185', '#fb923c', '#fde047']
			}
		},
		edge: {
			label: 'Edge',
			colors: {
				light: ['#0ea5e9', '#6366f1', '#a855f7'],
				dark: ['#38bdf8', '#818cf8', '#c084fc']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilRadarChart data={radarData} config={radarConfig} class="h-full w-full p-3">
	<EvilRadarChart.PolarGrid />
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
