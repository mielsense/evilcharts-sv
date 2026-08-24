<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarHeader`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();
</script>

<div
	data-slot="sidebar-header"
	data-sidebar="header"
	class={cn('flex flex-col gap-2 p-2', className)}
	{...rest}
>
	{@render children?.()}
</div>
