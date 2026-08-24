<script lang="ts">
	/**
	 * `ProviderSwitcher` from `evilcharts/src/components/docs/sidebar/provider-switcher.tsx`.
	 *
	 * Each engine wears its own mark in its own brand colour. This port ships one provider, so the
	 * menu has one entry — the switching machinery is kept intact, because that is how a second
	 * engine would be added without touching this file.
	 */
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { Component } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { CheckIcon, ReactIcon } from '$site/assets/icons/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$site/components/ui/dropdown-menu/index.js';
	import {
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		useSidebar
	} from '$site/components/ui/sidebar/index.js';
	import {
		PROVIDER_META,
		providerFromPathname,
		providerHref,
		type Provider
	} from '$site/globals/constants/providers.js';
	import { cn } from '$site/lib/utils.js';

	let {
		existingUrls,
		activeProvider,
		onProviderChange
	}: {
		existingUrls: Set<string>;
		/** Resolved provider — from the pathname, or sticky on shared pages. */
		activeProvider: Provider;
		/** Persists the selection so shared pages keep showing this engine. */
		onProviderChange: (provider: Provider) => void;
	} = $props();

	const sidebar = useSidebar();

	// LayerChart renders through Svelte, so it gets the framework mark; the reference gives
	// Recharts the React logo in React blue for the same reason.
	const PROVIDER_ICONS: Record<Provider, Component<Record<string, unknown>>> = {
		layerchart: ReactIcon as Component<Record<string, unknown>>
	};
	const PROVIDER_TINT: Record<Provider, string> = { layerchart: 'text-[#FF3E00]' };

	// Menu display order only — PROVIDERS' order elsewhere (redirects, llms.txt sections) is
	// intentionally untouched.
	const MENU_ORDER: Provider[] = ['layerchart'];

	const displayed = $derived(PROVIDER_META[activeProvider]);
	const DisplayedIcon = $derived(PROVIDER_ICONS[activeProvider]);

	async function selectProvider(provider: Provider) {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
		onProviderChange(provider);

		const pathProvider = providerFromPathname(page.url.pathname);

		// Shared pages (/docs, /docs/chart-config) belong to both engines — stay put; only the
		// selection flips.
		if (!pathProvider || pathProvider === provider) return;

		// Hold your place across the switch when the counterpart page exists. Otherwise the provider
		// landing is the only destination we can promise.
		const candidate = page.url.pathname.replace(`/docs/${pathProvider}`, `/docs/${provider}`);
		const target = existingUrls.has(candidate) ? candidate : providerHref(provider);
		// `resolve` with the docs route id keeps the URL typed even though the slug is computed.
		await goto(resolve('/docs/[...slug]', { slug: target.replace(/^\/docs\/?/, '') }));
	}
</script>

<SidebarMenu>
	<SidebarMenuItem>
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<SidebarMenuButton
						size="lg"
						class={cn(
							'data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground',
							'border border-border/60'
						)}
					>
						{#snippet child({ props: buttonProps })}
							<button type="button" {...buttonProps} {...props}>
								<DisplayedIcon
									class={cn(PROVIDER_TINT[displayed.id], 'size-7!')}
									aria-hidden="true"
								/>
								<div class="ml-0.5 grid flex-1 text-left leading-tight">
									<span class="truncate text-sm font-medium">{displayed.name}</span>
									<span class="truncate text-[11px] text-muted-foreground">{displayed.tagline}</span
									>
								</div>
								<ChevronDown class="ml-auto opacity-60" />
							</button>
						{/snippet}
					</SidebarMenuButton>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				side="bottom"
				sideOffset={4}
				class="w-(--anchor-width) bg-background"
			>
				<div class="px-2 py-1.5 text-xs text-muted-foreground">Rendering engine</div>
				{#each MENU_ORDER as id (id)}
					{@const meta = PROVIDER_META[id]}
					{@const Icon = PROVIDER_ICONS[id]}
					<DropdownMenuItem class="gap-2 p-2" onclick={() => selectProvider(id)}>
						<Icon class={cn(PROVIDER_TINT[id], 'size-6!')} aria-hidden="true" />
						<div class="ml-0.5 grid flex-1 leading-tight">
							<span class="flex items-center gap-1.5 text-sm">
								{meta.name}
								{#if !meta.available}
									<span
										class="rounded-sm border border-border px-1 py-px text-[9px] tracking-wide text-muted-foreground uppercase"
									>
										New
									</span>
								{/if}
							</span>
							<span class="text-[11px] text-muted-foreground">{meta.tagline}</span>
						</div>
						{#if activeProvider === id}
							<CheckIcon class="size-3.5" />
						{/if}
					</DropdownMenuItem>
				{/each}
			</DropdownMenuContent>
		</DropdownMenu>
	</SidebarMenuItem>
</SidebarMenu>
