<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern {id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
	<polygon
		class="text-border dark:text-border"
		fill-rule="evenodd"
		points="5 3 8 4 5 5 4 8 3 5 0 4 3 3 4 0 5 3"
		fill="currentColor"
		fill-opacity="0.4"
	/>
</pattern>
