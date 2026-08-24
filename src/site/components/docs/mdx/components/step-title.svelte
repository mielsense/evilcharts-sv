<script lang="ts">
	/** `StepTitle` from `evilcharts/src/components/docs/mdx/components/steps.tsx`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<h3 class={cn(className, 'pt-0.5 text-[15px]! font-medium text-primary not-first:mt-2')}>
	{@render children?.()}
</h3>
