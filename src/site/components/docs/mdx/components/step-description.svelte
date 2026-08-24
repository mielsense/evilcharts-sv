<script lang="ts">
	/** `StepDescription` from `evilcharts/src/components/docs/mdx/components/steps.tsx`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div
	class={cn(
		className,
		'text-sm font-normal text-muted-foreground not-first:mt-4 [&>p]:leading-relaxed'
	)}
>
	{@render children?.()}
</div>
