<script lang="ts">
	import { EvilAreaChart } from './index.js';
	import { EvilLineChart } from '../layerchart-line-chart/index.js';

	const data = [
		{ phantom: 10_000, month: 'January', desktop: 1, mobile: 20 },
		{ phantom: 10_000, month: 'February', desktop: 20, mobile: 1 }
	];

	// `phantom` is presentation metadata with no mark. `mobile` is deliberately mark-only.
	const config = {
		phantom: { label: 'Phantom', color: '#111827' },
		desktop: { label: 'Desktop', color: '#2563eb' }
	};
</script>

<div class="h-[240px] w-[400px]" data-test="area">
	<EvilAreaChart
		{data}
		{config}
		animationType="none"
		initialDimension={{ width: 400, height: 240 }}
	>
		<EvilAreaChart.Legend />
		<EvilAreaChart.Tooltip defaultIndex={0} />
		<EvilAreaChart.Area dataKey="desktop" variant="solid" />
		<EvilAreaChart.Area dataKey="mobile" variant="solid" />
	</EvilAreaChart>
</div>

<div class="h-[240px] w-[400px]" data-test="line">
	<EvilLineChart
		{data}
		{config}
		animationType="none"
		initialDimension={{ width: 400, height: 240 }}
	>
		<EvilLineChart.Legend />
		<EvilLineChart.Tooltip defaultIndex={0} />
		<EvilLineChart.Line dataKey="desktop" />
		<EvilLineChart.Line dataKey="mobile" />
	</EvilLineChart>
</div>
