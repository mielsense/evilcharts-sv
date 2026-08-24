<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarProvider`. */
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useIsMobile } from '$site/hooks/use-mobile.svelte.js';
	import { cn } from '$site/lib/utils.js';
	import {
		setSidebarContext,
		SidebarState,
		SIDEBAR_KEYBOARD_SHORTCUT,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON
	} from './sidebar-context.svelte.js';

	let {
		defaultOpen = true,
		open,
		onOpenChange,
		class: className,
		style = '',
		children,
		...rest
	}: {
		defaultOpen?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		class?: string;
		style?: string;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'style'> = $props();

	// Seeded once; the effects below keep it in step. `untrack` because reading a prop here would
	// only ever capture its initial value anyway.
	const sidebar = setSidebarContext(
		new SidebarState(
			untrack(() => open ?? defaultOpen),
			(value) => onOpenChange?.(value)
		)
	);
	const isMobile = useIsMobile();

	$effect.pre(() => {
		sidebar.isMobile = isMobile.current;
	});
	// A controlled `open` wins, as it does in the reference.
	$effect.pre(() => {
		if (open !== undefined) sidebar.open = open;
	});

	/** Cmd/Ctrl+B toggles the sidebar, as in the reference. */
	$effect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				sidebar.toggleSidebar();
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div
	data-slot="sidebar-wrapper"
	style={`--sidebar-width:${SIDEBAR_WIDTH};--sidebar-width-icon:${SIDEBAR_WIDTH_ICON};${style}`}
	class={cn(
		'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
