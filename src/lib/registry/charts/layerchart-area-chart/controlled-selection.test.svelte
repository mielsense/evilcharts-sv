<script lang="ts">
	import { EvilAreaChart } from './index.js';
	import type { ChartConfig } from '../../ui/layerchart-chart/index.js';

	let { controlled = true }: { controlled?: boolean } = $props();

	const data = [
		{ month: 'January', desktop: 12, mobile: 18 },
		{ month: 'February', desktop: 20, mobile: 14 }
	];
	const config = {
		desktop: { label: 'Desktop', colors: { light: ['#2563eb'] } },
		mobile: { label: 'Mobile', colors: { light: ['#db2777'] } }
	} satisfies ChartConfig;

	let selected = $state<string | null>('mobile');
	let callbackValue = $state('none');
</script>

<button type="button" data-select="desktop" onclick={() => (selected = 'desktop')}>desktop</button>
<button type="button" data-select="none" onclick={() => (selected = null)}>none</button>
<output data-callback>{callbackValue}</output>

<div class="h-[240px] w-[400px]">
	{#if controlled}
		<EvilAreaChart
			{data}
			{config}
			xDataKey="month"
			animationType="none"
			selectedDataKey={selected}
			defaultSelectedDataKey="mobile"
			onSelectionChange={(key) => (callbackValue = key ?? 'none')}
		>
			<EvilAreaChart.Area dataKey="desktop" variant="solid" isClickable />
			<EvilAreaChart.Area dataKey="mobile" variant="solid" isClickable />
		</EvilAreaChart>
	{:else}
		<EvilAreaChart
			{data}
			{config}
			xDataKey="month"
			animationType="none"
			defaultSelectedDataKey="mobile"
			onSelectionChange={(key) => (callbackValue = key ?? 'none')}
		>
			<EvilAreaChart.Area dataKey="desktop" variant="solid" isClickable />
			<EvilAreaChart.Area dataKey="mobile" variant="solid" isClickable />
		</EvilAreaChart>
	{/if}
</div>
