<script lang="ts">
	/**
	 * `DocsHeader` from `evilcharts/src/components/docs/sidebar/header.tsx`.
	 *
	 * The reference awaits its star count on the server and rebuilds daily; here the count arrives
	 * as a prop from the docs layout's load, which is the same once-per-build fetch.
	 */
	import { GithubIcon } from '$site/assets/icons/index.js';
	import { Button } from '$site/components/ui/button/index.js';
	import { SidebarHeader, SidebarTrigger } from '$site/components/ui/sidebar/index.js';
	import { UPSTREAM_NAME, UPSTREAM_REPO_URL } from '$site/globals/constants/site.js';
	import ThemeSwitcher from './theme-switcher.svelte';

	let { stars }: { stars?: number | null } = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external URLs (the upstream repo,
     GitHub), which `resolve()` does not cover. -->

<SidebarHeader
	class="pointer-events-none fixed top-0 z-50 flex h-14 w-full flex-row justify-between border-b bg-background p-0 sm:sticky sm:h-[35px] sm:border-b-0 sm:bg-transparent"
>
	<div class="pointer-events-auto flex min-w-0 items-center gap-1.5 pl-3">
		<SidebarTrigger class="sidebar:hidden" />
		<span class="truncate text-[11px] font-medium text-[#ff3e00] sm:hidden">Svelte 5 port</span>
	</div>
	<div class="pointer-events-auto relative z-10 flex h-full items-center gap-2 pl-6">
		<!--
			Added by the port: every docs page carries a link back to the project this is a translation
			of. The reference has no such line because it *is* the original.
		-->
		<a
			class="hidden text-[11px] whitespace-nowrap text-muted-foreground/70 duration-100 hover:text-primary sm:inline"
			href={UPSTREAM_REPO_URL}
			target="_blank"
			rel="noreferrer"
		>
			Svelte port of <span class="underline decoration-1 underline-offset-2">{UPSTREAM_NAME}</span>
		</a>
		<span class="hidden text-muted sm:inline">|</span>
		{#if stars}
			<a href="https://github.com/legions-developer/evilcharts" target="_blank" rel="noreferrer">
				<Button variant="link" size="sm">
					<GithubIcon /> <span class="text-xs text-primary">{stars}</span>
				</Button>
			</a>
			<span class="text-muted">|</span>
		{/if}
		<ThemeSwitcher />
		<a class="hidden sm:block" href="https://x.com/legionsdev" target="_blank" rel="noreferrer">
			<Button class="group" size="sm" variant="ghost">
				<span class="text-xs text-muted-foreground group-hover:text-primary">
					Built by Gurbinder
				</span>
			</Button>
		</a>
	</div>
</SidebarHeader>
