<script lang="ts">
	import { EvilRadarChart } from '$lib/registry/charts/layerchart-radar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

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

<!-- [!code highlight] -->
<EvilRadarChart data={[]} config={chartConfig} class="h-full w-full p-4" isLoading={true}>
	<EvilRadarChart.PolarGrid />
	<EvilRadarChart.PolarAngleAxis dataKey="skill" />
	<EvilRadarChart.Legend />
	<EvilRadarChart.Tooltip />
	<EvilRadarChart.Radar dataKey="desktop" variant="filled" />
	<EvilRadarChart.Radar dataKey="mobile" variant="filled" />
</EvilRadarChart>
