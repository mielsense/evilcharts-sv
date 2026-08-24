<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern {id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
	<path
		class="text-border dark:text-border"
		d="M 8 4 L 8 12 M 4 8 L 12 8"
		fill="none"
		stroke="currentColor"
		stroke-width="0.5"
		stroke-linecap="round"
	/>
</pattern>
