<script lang="ts">
	import type { PatternProps } from '../types.js';
	let { id }: PatternProps = $props();
</script>

<pattern {id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
	<circle class="text-border dark:text-border" cx="2" cy="2" r="1" fill="currentColor" />
</pattern>
