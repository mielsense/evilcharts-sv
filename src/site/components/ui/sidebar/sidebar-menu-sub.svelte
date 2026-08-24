<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarMenuSub`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<ul
	data-slot="sidebar-menu-sub"
	data-sidebar="menu-sub"
	class={cn(
		'my-1 flex min-w-0 translate-x-px flex-col border-sidebar-border',
		'group-data-[collapsible=icon]:hidden',
		className
	)}
>
	{@render children?.()}
</ul>
