<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `Sidebar`. */
	import type { Snippet } from 'svelte';
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle
	} from '../sheet/index.js';
	import { cn } from '$site/lib/utils.js';
	import { useSidebar, SIDEBAR_WIDTH_MOBILE } from './sidebar-context.svelte.js';

	let {
		side = 'left',
		variant = 'sidebar',
		collapsible = 'offcanvas',
		class: className,
		children
	}: {
		side?: 'left' | 'right';
		variant?: 'sidebar' | 'floating' | 'inset';
		collapsible?: 'offcanvas' | 'icon' | 'none';
		class?: string;
		children?: Snippet;
	} = $props();

	const sidebar = useSidebar();
</script>

{#if collapsible === 'none'}
	<div
		data-slot="sidebar"
		class={cn(
			'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
			className
		)}
	>
		{@render children?.()}
	</div>
{:else if sidebar.isMobile}
	<Sheet open={sidebar.openMobile} onOpenChange={(value) => sidebar.setOpenMobile(value)}>
		<SheetContent
			data-sidebar="sidebar"
			data-slot="sidebar"
			data-mobile="true"
			class="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
			style={`--sidebar-width:${SIDEBAR_WIDTH_MOBILE}`}
			{side}
		>
			<SheetHeader class="sr-only">
				<SheetTitle>Sidebar</SheetTitle>
				<SheetDescription>Displays the mobile sidebar.</SheetDescription>
			</SheetHeader>
			<div class="flex h-full w-full flex-col">{@render children?.()}</div>
		</SheetContent>
	</Sheet>
{:else}
	<div
		class="group peer hidden text-sidebar-foreground md:block"
		data-state={sidebar.state}
		data-collapsible={sidebar.state === 'collapsed' ? collapsible : ''}
		data-variant={variant}
		data-side={side}
		data-slot="sidebar"
	>
		<!-- This is what handles the sidebar gap on desktop -->
		<div
			data-slot="sidebar-gap"
			class={cn(
				'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
				'group-data-[collapsible=offcanvas]:w-0',
				'group-data-[side=right]:rotate-180',
				variant === 'floating' || variant === 'inset'
					? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
					: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
			)}
		></div>
		<div
			data-slot="sidebar-container"
			class={cn(
				'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
				side === 'left'
					? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
					: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
				// Adjust the padding for floating and inset variants.
				variant === 'floating' || variant === 'inset'
					? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
					: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
				className
			)}
		>
			<div
				data-sidebar="sidebar"
				data-slot="sidebar-inner"
				class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
