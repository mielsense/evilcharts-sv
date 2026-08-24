<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarMenuItem`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<li
	data-slot="sidebar-menu-item"
	data-sidebar="menu-item"
	class={cn('group/menu-item relative', className)}
>
	{@render children?.()}
</li>
