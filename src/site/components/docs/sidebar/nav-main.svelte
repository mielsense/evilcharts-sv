<script lang="ts">
	/**
	 * `NavMain` from `evilcharts/src/components/docs/sidebar/nav-main.tsx`.
	 *
	 * Charts sit one level deeper since the provider split: the tree's top level is the provider
	 * folders, and the chart folders are their children.
	 *
	 * The reference freezes `defaultOpen` on first render, because Base UI warns when an
	 * uncontrolled Collapsible's default changes after init (`hasActiveChild` flips on navigation).
	 * Our `<Collapsible>` is state-driven, so the folder is opened once on mount and then left to
	 * the reader — same behaviour, no special case.
	 */
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '$site/components/ui/collapsible/index.js';
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarMenuSub,
		SidebarMenuSubButton,
		SidebarMenuSubItem,
		sidebarMenuButtonVariants,
		useSidebar
	} from '$site/components/ui/sidebar/index.js';
	import { isExcludedPage } from '$site/globals/constants/docs-sidebar.js';
	import type { Provider } from '$site/globals/constants/providers.js';
	import { getNavItemIcon } from '$site/globals/functions/nav-item-icon.js';
	import type { PageTree, PageTreeFolder, PageTreePage } from '$site/lib/source.js';
	import { cn } from '$site/lib/utils.js';
	import TreeIndicator from './tree-indicator.svelte';

	let { tree, provider }: { tree: PageTree; provider: Provider } = $props();

	const sidebar = useSidebar();

	function handleLinkClick() {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
	}

	const providerChildren = $derived.by(() => {
		const folder = tree.children.find(
			(item) => item.type === 'folder' && item.index?.url.startsWith(`/docs/${provider}`)
		);
		// The provider folder has no index page of its own, so fall back to matching its children.
		const byChild = tree.children.find(
			(item) =>
				item.type === 'folder' &&
				item.children.some((child) => urlOf(child)?.startsWith(`/docs/${provider}/`))
		);
		const resolved = folder ?? byChild;
		return resolved?.type === 'folder' ? resolved.children : [];
	});

	function urlOf(item: PageTreePage | PageTreeFolder): string | undefined {
		return item.type === 'page' ? item.url : item.index?.url;
	}

	/**
	 * The active child's index within its folder, derived from the pathname so it resets when the
	 * reader navigates away. Every folder page is indexed by url once, so the lookup is O(1).
	 */
	const activeTrigger = $derived.by(() => {
		// A plain record, not a Map: it is built and read inside this derivation, so there is nothing
		// for `SvelteMap`'s reactivity to add.
		const pageIndex: Record<string, number> = {};

		for (const item of providerChildren) {
			if (item.type !== 'folder') continue;
			item.children.forEach((child, index) => {
				if (child.type === 'page') pageIndex[child.url] = index;
			});
		}

		const index = pageIndex[page.url.pathname];
		return { url: index === undefined ? '' : page.url.pathname, index: index ?? -1 };
	});

	/** The pages a folder shows: its children, minus anything the hard-coded groups already list. */
	function visibleChildren(folder: PageTreeFolder): PageTreePage[] {
		return folder.children.filter(
			(child): child is PageTreePage => child.type === 'page' && !isExcludedPage(child.url)
		);
	}

	/** A chart's own page is labelled "Default", as the reference relabels it. */
	function childLabel(folder: PageTreeFolder, child: PageTreePage): string {
		return folder.name === child.name ? 'Default' : child.name;
	}

	const folders = $derived(
		providerChildren.filter((item): item is PageTreeFolder => item.type === 'folder')
	);

	/** Opened once on mount for the folder holding the current page; the reader owns it after that. */
	const initiallyOpen = untrack(
		() =>
			new Set(
				folders
					.filter((folder) => folder.children.some((child) => urlOf(child) === page.url.pathname))
					.map((folder) => folder.name)
			)
	);
</script>

<!-- A provider with no chart folders yet renders nothing — not a bare heading. -->
{#if folders.length}
	<SidebarGroup>
		<SidebarGroupLabel>Components</SidebarGroupLabel>
		<SidebarMenu>
			{#each folders as folder (folder.name)}
				{@const visible = visibleChildren(folder)}
				{#if visible.length}
					{@const Icon = getNavItemIcon(folder.index?.url ?? visible[0].url)}
					{@const hasActiveChild = folder.children.some(
						(child) => child.type === 'page' && child.url === activeTrigger.url
					)}
					{#if visible.length === 1}
						<!-- Only one child: show it directly as a clickable element. -->
						{@const single = visible[0]}
						{@const isActive = single.url === page.url.pathname}
						<SidebarMenuItem>
							<SidebarMenuButton
								class={cn(
									!isActive &&
										'text-muted-foreground/90 hover:text-primary dark:text-muted-foreground/80 dark:hover:text-primary'
								)}
								{isActive}
								href={single.url}
								onclick={handleLinkClick}
							>
								{#if Icon}<Icon />{/if}
								<span class="capitalize">{folder.name}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					{:else}
						<SidebarMenuItem>
							<Collapsible class="group/collapsible" defaultOpen={initiallyOpen.has(folder.name)}>
								<!--
									The reference renders the trigger *as* a `<SidebarMenuButton>` through Base UI's
									`render` prop; here the button's own classes go on the trigger, which produces the
									same element with the same `data-*` attributes.
								-->
								<CollapsibleTrigger
									data-slot="sidebar-menu-button"
									data-sidebar="menu-button"
									data-size="default"
									data-active={hasActiveChild}
									class={cn(
										sidebarMenuButtonVariants({ variant: 'default', size: 'default' }),
										!hasActiveChild &&
											'text-muted-foreground/90 hover:text-primary dark:text-muted-foreground/80 dark:hover:text-primary'
									)}
								>
									{#if Icon}<Icon />{/if}
									<span class="capitalize">{folder.name}</span>
									<ChevronRight
										class={cn(
											'ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90',
											hasActiveChild ? 'opacity-100' : 'opacity-60'
										)}
									/>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										<TreeIndicator activeIndex={activeTrigger.index} {hasActiveChild} />
										{#each visible as child (child.url)}
											{@const isActive = activeTrigger.url === child.url}
											<SidebarMenuSubItem class="relative flex w-full">
												<SidebarMenuSubButton
													class={cn(
														'w-full pl-8',
														!isActive &&
															'text-muted-foreground/90 hover:text-primary dark:text-muted-foreground/80 dark:hover:text-primary'
													)}
													href={child.url}
													onclick={handleLinkClick}
													{isActive}
												>
													<span>{childLabel(folder, child)}</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										{/each}
									</SidebarMenuSub>
								</CollapsibleContent>
							</Collapsible>
						</SidebarMenuItem>
					{/if}
				{/if}
			{/each}
		</SidebarMenu>
	</SidebarGroup>
{/if}
