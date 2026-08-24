<script lang="ts">
	/** Ported from `evilcharts/src/components/docs/sidebar/render-default-options.tsx`. */
	import { page } from '$app/state';
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		useSidebar
	} from '$site/components/ui/sidebar/index.js';
	import type { SidebarOption } from '$site/globals/constants/docs-sidebar.js';
	import { OPTION_ICONS } from '$site/globals/functions/nav-item-icon.js';
	import { cn } from '$site/lib/utils.js';

	let {
		options,
		label,
		existingUrls
	}: {
		options: SidebarOption[];
		label: string;
		/** URLs present in the page tree; options pointing elsewhere are dropped. */
		existingUrls?: Set<string>;
	} = $props();

	const sidebar = useSidebar();

	function handleLinkClick() {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
	}

	const visibleOptions = $derived(
		existingUrls ? options.filter((item) => existingUrls.has(item.url)) : options
	);
</script>

{#if visibleOptions.length}
	<SidebarGroup class="group-data-[collapsible=icon]:hidden">
		<SidebarGroupLabel>{label}</SidebarGroupLabel>
		<SidebarMenu>
			{#each visibleOptions as item (item.name)}
				{const isActive = page.url.pathname === item.url}
				{const Icon = OPTION_ICONS[item.id]}
				<SidebarMenuItem>
					<SidebarMenuButton
						href={item.url}
						onclick={handleLinkClick}
						class={cn(
							!isActive &&
								'text-muted-foreground/90 hover:text-primary dark:text-muted-foreground/80 dark:hover:text-primary'
						)}
						{isActive}
					>
						<Icon />
						<span>{item.name}</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			{/each}
		</SidebarMenu>
	</SidebarGroup>
{/if}
