<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/ui/sidebar.tsx`'s `SidebarMenuButton`.
	 *
	 * Base UI's `render` prop becomes the shadcn-svelte `child` snippet, plus an `href` shortcut for
	 * the common `render={<Link href=…/>}` case. The reference's optional `tooltip` (shown only
	 * while collapsed) has no call site in the docs sidebar and is left out.
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';
	import {
		sidebarMenuButtonVariants,
		type SidebarMenuButtonSize,
		type SidebarMenuButtonVariant
	} from './sidebar-menu-button-variants.js';

	let {
		isActive = false,
		variant = 'default',
		size = 'default',
		class: className,
		href,
		onclick,
		children,
		child
	}: {
		isActive?: boolean;
		variant?: SidebarMenuButtonVariant;
		size?: SidebarMenuButtonSize;
		class?: string;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const attrs = $derived({
		'data-slot': 'sidebar-menu-button',
		'data-sidebar': 'menu-button',
		'data-size': size,
		'data-active': isActive,
		class: cn(sidebarMenuButtonVariants({ variant, size }), className)
	});
</script>

{#if child}
	{@render child({ props: { ...attrs, onclick } })}
{:else if href}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- a docs route from the page tree -->
	<a {href} {onclick} {...attrs}>{@render children?.()}</a>
{:else}
	<button type="button" {onclick} {...attrs}>{@render children?.()}</button>
{/if}
