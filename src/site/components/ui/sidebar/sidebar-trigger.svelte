<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarTrigger`. */
	import { SidebarLeft } from '$site/assets/icons/index.js';
	import { Button } from '../button/index.js';
	import { cn } from '$site/lib/utils.js';
	import { useSidebar } from './sidebar-context.svelte.js';

	let { class: className, onclick }: { class?: string; onclick?: (event: MouseEvent) => void } =
		$props();

	const sidebar = useSidebar();
</script>

<Button
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant="ghost"
	size="icon"
	class={cn('size-7', className)}
	onclick={(event: MouseEvent) => {
		onclick?.(event);
		sidebar.toggleSidebar();
	}}
>
	<SidebarLeft class="text-muted-foreground" />
	<span class="sr-only">Toggle Sidebar</span>
</Button>
