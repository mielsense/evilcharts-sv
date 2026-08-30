<script lang="ts">
	/**
	 * `DocsHeader` from `evilcharts/src/components/docs/sidebar/header.tsx`.
	 *
	 * The star count belongs to this Svelte port. Upstream attribution stays separate.
	 */
	import { GithubIcon } from '$site/assets/icons/index.js';
	import { Button } from '$site/components/ui/button/index.js';
	import { SidebarHeader, SidebarTrigger } from '$site/components/ui/sidebar/index.js';
	import {
		PORT_AUTHOR,
		PORT_AUTHOR_URL,
		PORT_REPO_URL,
		UPSTREAM_NAME,
		UPSTREAM_REPO_URL,
		formatGithubStarsLabel
	} from '$site/globals/constants/site.js';
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
		<a
			class="truncate rounded-sm text-[11px] font-semibold text-[#ff3e00] outline-none focus-visible:ring-[3px] focus-visible:ring-[#ff3e00]/35 sm:hidden"
			href={PORT_REPO_URL}
			target="_blank"
			rel="noreferrer">Svelte 5 port</a
		>
	</div>
	<div class="pointer-events-auto relative z-10 flex h-full shrink-0 items-center gap-2 pr-2 pl-6">
		<a
			class="hidden shrink-0 rounded-sm bg-[#ff3e00] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white outline-none hover:bg-[#e63800] focus-visible:ring-[3px] focus-visible:ring-[#ff3e00]/35 sm:inline"
			href={PORT_REPO_URL}
			target="_blank"
			rel="noreferrer">Svelte 5 port</a
		>
		<a
			class="hidden shrink-0 text-[11px] whitespace-nowrap text-muted-foreground/70 duration-100 hover:text-primary lg:inline"
			href={UPSTREAM_REPO_URL}
			target="_blank"
			rel="noreferrer"
		>
			Based on <span class="underline decoration-1 underline-offset-2">{UPSTREAM_NAME}</span>
		</a>
		<span class="hidden text-muted md:inline">|</span>
		{#if stars !== null && stars !== undefined}
			<a
				href={PORT_REPO_URL}
				target="_blank"
				rel="noreferrer"
				aria-label={formatGithubStarsLabel(stars)}
			>
				<Button variant="link" size="sm">
					<GithubIcon /> <span class="text-xs text-primary">{stars}</span>
				</Button>
			</a>
			<span class="text-muted">|</span>
		{/if}
		<ThemeSwitcher />
		<a class="hidden xl:block" href={PORT_AUTHOR_URL} target="_blank" rel="noreferrer">
			<Button class="group" size="sm" variant="ghost">
				<span class="text-[11px] text-muted-foreground group-hover:text-primary">
					Svelte port by {PORT_AUTHOR}
				</span>
			</Button>
		</a>
	</div>
</SidebarHeader>
