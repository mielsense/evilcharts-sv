<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarMenu`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<ul
	data-slot="sidebar-menu"
	data-sidebar="menu"
	class={cn('flex w-full min-w-0 flex-col gap-1', className)}
>
	{@render children?.()}
</ul>
