<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/collapsible.tsx` (Base UI `Collapsible.Root`). */
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CollapsibleState, setCollapsibleContext } from './collapsible-context.svelte.js';

	let {
		class: className,
		/** Open on mount. Read once, as the reference's `defaultOpen` is mount-only. */
		defaultOpen = false,
		children,
		...rest
	}: { class?: string; defaultOpen?: boolean; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();

	const state = setCollapsibleContext(new CollapsibleState());
	state.open = untrack(() => defaultOpen);
</script>

<div
	data-slot="collapsible"
	data-open={state.open ? '' : undefined}
	data-closed={state.open ? undefined : ''}
	class={className}
	{...rest}
>
	{@render children?.()}
</div>
