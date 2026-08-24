/**
 * The sidebar primitive, ported from `evilcharts/src/components/ui/sidebar.tsx`.
 *
 * Only the parts the docs shell mounts are ported. The reference's `SidebarInput`,
 * `SidebarFooter`, `SidebarSeparator`, `SidebarGroupAction`, `SidebarGroupContent`,
 * `SidebarMenuAction` and `SidebarMenuBadge` have no call site here.
 */
export { default as SidebarProvider } from './sidebar-provider.svelte';
export { default as Sidebar } from './sidebar.svelte';
export { default as SidebarTrigger } from './sidebar-trigger.svelte';
export { default as SidebarRail } from './sidebar-rail.svelte';
export { default as SidebarInset } from './sidebar-inset.svelte';
export { default as SidebarHeader } from './sidebar-header.svelte';
export { default as SidebarContent } from './sidebar-content.svelte';
export { default as SidebarGroup } from './sidebar-group.svelte';
export { default as SidebarGroupLabel } from './sidebar-group-label.svelte';
export { default as SidebarMenu } from './sidebar-menu.svelte';
export { default as SidebarMenuItem } from './sidebar-menu-item.svelte';
export { default as SidebarMenuButton } from './sidebar-menu-button.svelte';
export { default as SidebarMenuSub } from './sidebar-menu-sub.svelte';
export { default as SidebarMenuSubItem } from './sidebar-menu-sub-item.svelte';
export { default as SidebarMenuSubButton } from './sidebar-menu-sub-button.svelte';
export { SidebarState, useSidebar } from './sidebar-context.svelte.js';
export {
	sidebarMenuButtonVariants,
	type SidebarMenuButtonSize,
	type SidebarMenuButtonVariant
} from './sidebar-menu-button-variants.js';
