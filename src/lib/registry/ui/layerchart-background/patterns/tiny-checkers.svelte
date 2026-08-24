<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern {id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
	<path
		class="text-border dark:text-border"
		fill-rule="evenodd"
		d="M0 0h4v4H0V0zm4 4h4v4H4V4z"
		fill="currentColor"
		fill-opacity="0.2"
	/>
</pattern>
