<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/collapsible.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { useCollapsible } from './collapsible-context.svelte.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLButtonAttributes,
		'class' | 'children'
	> = $props();

	const state = useCollapsible();
</script>

<button
	type="button"
	aria-expanded={state.open}
	class={cn('cursor-pointer', className)}
	data-slot="collapsible-trigger"
	onclick={() => state.toggle()}
	{...rest}
>
	{@render children?.()}
</button>
