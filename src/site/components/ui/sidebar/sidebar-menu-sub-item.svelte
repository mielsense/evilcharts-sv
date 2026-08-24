<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarMenuSubItem`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<li
	data-slot="sidebar-menu-sub-item"
	data-sidebar="menu-sub-item"
	class={cn('group/menu-sub-item relative', className)}
>
	{@render children?.()}
</li>
