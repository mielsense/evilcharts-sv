<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ChartDot from './chart-dot.svelte';

	let props: ComponentProps<typeof ChartDot> = $props();
</script>

<svg data-testid="host" width="200" height="100">
	<ChartDot {...props} />
</svg>
