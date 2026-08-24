<script lang="ts">
	import { EvilRadarChart } from '$lib/registry/charts/layerchart-radar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const data = [
		{ skill: 'JavaScript', desktop: 186, mobile: 80 },
		{ skill: 'TypeScript', desktop: 305, mobile: 200 },
		{ skill: 'React', desktop: 237, mobile: 120 },
		{ skill: 'Node.js', desktop: 173, mobile: 190 },
		{ skill: 'CSS', desktop: 209, mobile: 130 },
		{ skill: 'Python', desktop: 214, mobile: 140 }
	];

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: {
				light: ['#3b82f6'],
				dark: ['#60a5fa']
			}
		},
		mobile: {
			label: 'Mobile',
			colors: {
				light: ['#10b981'],
				dark: ['#34d399']
			}
		}
	} satisfies ChartConfig;
</script>

<EvilRadarChart {data} config={chartConfig} class="h-full w-full p-4">
	<!-- [!code highlight:2] -->
	<EvilRadarChart.PolarGrid gridType="circle" />
	<EvilRadarChart.PolarAngleAxis dataKey="skill" />
	<EvilRadarChart.Legend />
	<EvilRadarChart.Tooltip />
	<EvilRadarChart.Radar dataKey="desktop" variant="filled">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
	<EvilRadarChart.Radar dataKey="mobile" variant="filled">
		<EvilRadarChart.Dot variant="colored-border" />
		<EvilRadarChart.ActiveDot variant="default" />
	</EvilRadarChart.Radar>
</EvilRadarChart>
