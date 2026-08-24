<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern {id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
	<path
		class="text-border dark:text-border"
		d="M 20 0 L 0 0 0 20"
		fill="none"
		stroke="currentColor"
		stroke-width="0.5"
	/>
</pattern>
