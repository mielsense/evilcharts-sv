<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern {id} x="0" y="0" width="18" height="36" patternUnits="userSpaceOnUse">
	<path
		class="text-border dark:text-border"
		d="M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z"
		transform="scale(0.5)"
		fill="currentColor"
		fill-opacity="0.4"
	/>
</pattern>
