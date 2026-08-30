<script lang="ts">
	import { untrack } from 'svelte';
	import BrushControls from '../registry/ui/echarts-brush/brush-controls.svelte';

	let {
		initialStart = 1,
		initialEnd = 3,
		totalPoints = 5
	}: { initialStart?: number; initialEnd?: number; totalPoints?: number } = $props();
	let range = $state({
		startIndex: untrack(() => initialStart),
		endIndex: untrack(() => initialEnd)
	});
</script>

<BrushControls
	startIndex={range.startIndex}
	endIndex={range.endIndex}
	{totalPoints}
	formatLabel={(index) => `Point ${index}`}
	onChange={(next) => (range = next)}
/>
<output data-test="range">{range.startIndex}:{range.endIndex}</output>
