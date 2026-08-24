<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern
	{id}
	x="0"
	y="0"
	width="6"
	height="6"
	patternUnits="userSpaceOnUse"
	patternTransform="rotate(45)"
>
	<line
		class="text-border dark:text-border"
		x1="0"
		y1="0"
		x2="0"
		y2="6"
		stroke="currentColor"
		stroke-width="0.5"
	/>
</pattern>
