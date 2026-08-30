<script lang="ts">
	import { EChartsAreaChart } from '../../charts/echarts-area-chart/index.js';
	import type { ChartConfig } from './types.js';

	const data = [
		{ month: 'January', desktop: 12 },
		{ month: 'February', desktop: 20 }
	];
	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#ff0000'] } }
	} satisfies ChartConfig;
	let localTheme = $state(false);
</script>

<button type="button" data-local-theme onclick={() => (localTheme = true)}>local theme</button>

<div class="h-[240px] w-[400px]">
	<EChartsAreaChart
		{data}
		{config}
		xDataKey="month"
		renderer="svg"
		animation={false}
		class={['h-full', localTheme && 'local-echarts-theme'].filter(Boolean).join(' ')}
	>
		<EChartsAreaChart.Area dataKey="desktop" variant="solid" />
	</EChartsAreaChart>
</div>

<style>
	:global(.local-echarts-theme) {
		--color-desktop-0: #0000ff !important;
	}

	:global([data-slot='echarts-host']) {
		width: 400px;
		height: 240px;
	}
</style>
