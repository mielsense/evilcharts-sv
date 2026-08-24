<script lang="ts">
	/** `Steps` from `evilcharts/src/components/docs/mdx/components/steps.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { setStepsContext, StepsState } from './steps-context.svelte.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();

	setStepsContext(new StepsState());
</script>

<div class={cn('relative mt-4', className)} {...rest}>
	{@render children?.()}
</div>
