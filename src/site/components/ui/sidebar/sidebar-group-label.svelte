<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarGroupLabel`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div
	data-slot="sidebar-group-label"
	data-sidebar="group-label"
	class={cn(
		'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
		'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
		className
	)}
>
	{@render children?.()}
</div>
