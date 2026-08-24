<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarMenuSubButton`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let {
		size = 'md',
		isActive = false,
		class: className,
		href,
		onclick,
		children
	}: {
		size?: 'sm' | 'md';
		isActive?: boolean;
		class?: string;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	} = $props();

	const CLASSES = cn(
		'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7.5 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-3 text-[13px] outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
		'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
		'group-data-[collapsible=icon]:hidden'
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- a docs route from the page tree -->
<a
	{href}
	{onclick}
	data-slot="sidebar-menu-sub-button"
	data-sidebar="menu-sub-button"
	data-size={size}
	data-active={isActive}
	class={cn(CLASSES, className)}
>
	{@render children?.()}
</a>
