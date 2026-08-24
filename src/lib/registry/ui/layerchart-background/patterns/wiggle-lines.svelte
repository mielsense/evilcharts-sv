<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern
	{id}
	x="0"
	y="0"
	width="52"
	height="26"
	patternUnits="userSpaceOnUse"
	patternTransform="scale(0.6)"
>
	<path
		class="text-border dark:text-border"
		d="M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z"
		fill="currentColor"
		fill-opacity="0.4"
	/>
</pattern>
