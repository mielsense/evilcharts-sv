<script lang="ts">
	import { EvilBarChart } from '$lib/registry/charts/layerchart-bar-chart/index.js';
	import { type ChartConfig } from '$lib/registry/ui/layerchart-chart/index.js';

	const data = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 305 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 173 },
		{ month: 'May', desktop: 209 },
		{ month: 'June', desktop: 214 }
	];

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
<EvilBarChart {data} config={chartConfig} class="h-full w-full p-4" layout="horizontal">
	<EvilBarChart.Grid />
	<!-- [!code highlight] -->
	<EvilBarChart.YAxis dataKey="month" tickFormatter={(value) => String(value).substring(0, 3)} />
	<EvilBarChart.Legend />
	<EvilBarChart.Tooltip />
	<EvilBarChart.Bar dataKey="desktop" variant="default" />
</EvilBarChart>
