<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/tabs.tsx` (Base UI `Tabs.Panel`). */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { useTabs } from './tabs-context.svelte.js';

	let {
		value,
		class: className,
		children,
		...rest
	}: { value: string; class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();

	const tabs = useTabs();
</script>

{#if tabs.value === value}
	<div
		role="tabpanel"
		class={cn('flex-1 outline-none', className)}
		data-slot="tabs-content"
		{...rest}
	>
		{@render children?.()}
	</div>
{/if}
