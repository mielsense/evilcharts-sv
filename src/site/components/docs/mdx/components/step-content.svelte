<script lang="ts">
	/** `StepContent` from `evilcharts/src/components/docs/mdx/components/steps.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();
</script>

<div class={cn('flex flex-col gap-4 py-4', className)} {...rest}>
	{@render children?.()}
</div>
