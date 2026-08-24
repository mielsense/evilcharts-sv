<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/tabs.tsx` (Base UI `Tabs.Tab`). */
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { useTabs } from './tabs-context.svelte.js';

	let {
		value,
		class: className,
		children,
		...rest
	}: { value: string; class?: string; children?: Snippet } & Omit<
		HTMLButtonAttributes,
		'class' | 'children' | 'value'
	> = $props();

	const tabs = useTabs();
	const active = $derived(tabs.value === value);
</script>

<button
	type="button"
	role="tab"
	aria-selected={active}
	data-slot="tabs-trigger"
	data-orientation={tabs.orientation}
	data-active={active ? '' : undefined}
	class={cn(
		"flex shrink-0 grow cursor-pointer items-center justify-center rounded-md text-xs font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
		'not-data-active:hover:text-primary data-active:text-foreground',
		'h-6 gap-1.5 px-[calc(--spacing(2.5)-1px)]',
		'data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start',
		className
	)}
	onclick={() => tabs.select(value)}
	{...rest}
>
	{@render children?.()}
</button>
