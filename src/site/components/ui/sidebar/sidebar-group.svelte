<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarGroup`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div
	data-slot="sidebar-group"
	data-sidebar="group"
	class={cn('relative flex w-full min-w-0 flex-col p-2', className)}
>
	{@render children?.()}
</div>
