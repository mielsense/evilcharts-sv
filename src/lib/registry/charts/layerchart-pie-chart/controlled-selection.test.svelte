<script lang="ts">
	import { EvilPieChart } from './index.js';
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';

	let { controlled = true }: { controlled?: boolean } = $props();

	const data = [
		{ browser: 'chrome', visitors: 275 },
		{ browser: 'safari', visitors: 200 }
	];
	const config = {
		chrome: { label: 'Chrome', colors: { light: ['#2563eb'] } },
		safari: { label: 'Safari', colors: { light: ['#10b981'] } }
	} satisfies ChartConfig;

	let selected = $state<string | null>('safari');
	let callbackValue = $state('none');
</script>

<button type="button" data-select="chrome" onclick={() => (selected = 'chrome')}>chrome</button>
<button type="button" data-select="none" onclick={() => (selected = null)}>none</button>
<output data-callback>{callbackValue}</output>

<div class="h-[240px] w-[400px]">
	{#if controlled}
		<EvilPieChart
			{data}
			{config}
			dataKey="visitors"
			nameKey="browser"
			selectedSector={selected}
			defaultSelectedSector="safari"
			onSelectionChange={(selection) => (callbackValue = selection?.dataKey ?? 'none')}
		>
			<EvilPieChart.Pie isClickable />
		</EvilPieChart>
	{:else}
		<EvilPieChart
			{data}
			{config}
			dataKey="visitors"
			nameKey="browser"
			defaultSelectedSector="safari"
			onSelectionChange={(selection) => (callbackValue = selection?.dataKey ?? 'none')}
		>
			<EvilPieChart.Pie isClickable />
		</EvilPieChart>
	{/if}
</div>
