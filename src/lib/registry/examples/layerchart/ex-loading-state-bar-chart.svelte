<script lang="ts">
	import { EvilBarChart } from '$lib/registry/charts/layerchart-bar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const chartConfig = {
		desktop: {
			label: 'Desktop',
			colors: {
				light: ['#047857'],
				dark: ['#10b981']
			}
		},
		mobile: {
			label: 'Mobile',
			colors: {
				light: ['#be123c'],
				dark: ['#f43f5e']
			}
		}
	} satisfies ChartConfig;
</script>

<!-- [!code highlight:6] -->
<EvilBarChart data={[]} config={chartConfig} class="h-full w-full p-4" isLoading={true}>
	<EvilBarChart.Grid />
	<EvilBarChart.XAxis dataKey="month" tickFormatter={(value) => String(value).substring(0, 3)} />
	<EvilBarChart.Legend />
	<EvilBarChart.Tooltip />
	<EvilBarChart.Bar dataKey="desktop" variant="default" />
	<EvilBarChart.Bar dataKey="mobile" variant="default" />
</EvilBarChart>
