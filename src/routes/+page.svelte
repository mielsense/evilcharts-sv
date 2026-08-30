<script lang="ts">
	/**
	 * Ported from `evilcharts/src/app/page.tsx`.
	 *
	 * The hero links the upstream design and ordered-dither inspiration without making a
	 * maintenance claim.
	 */
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import EvilChartWordmark from '$site/assets/logos/evilchart-wordmark.svelte';
	import ChartStage from '$site/components/landing/chart-stage.svelte';
	import { Button } from '$site/components/ui/button/index.js';
	import {
		PORT_REPO_URL,
		SITE_DESCRIPTION,
		SITE_TITLE,
		UPSTREAM_NAME,
		UPSTREAM_REPO_URL
	} from '$site/globals/constants/site.js';
	import { absoluteUrl } from '$site/lib/utils.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	/** `1234` → `1.2k`, as the reference formats it. */
	const formatStars = (count: number) =>
		count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(count);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external URLs (the upstream repo,
     GitHub), which `resolve()` does not cover. -->

<svelte:head>
	<title>{SITE_TITLE}</title>
	<meta name="description" content={SITE_DESCRIPTION} />
	<link rel="canonical" href={absoluteUrl('/')} />
	<meta property="og:title" content={SITE_TITLE} />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:url" content={absoluteUrl('/')} />
	<meta property="og:image" content={absoluteUrl('/og/og-image.png')} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={SITE_TITLE} />
	<meta name="twitter:description" content={SITE_DESCRIPTION} />
	<meta name="twitter:image" content={absoluteUrl('/og/og-image.png')} />
</svelte:head>

<main class="relative flex min-h-dvh flex-col overflow-hidden bg-background lg:h-dvh">
	<section
		class="relative z-10 flex flex-col justify-center px-6 pt-20 pb-10 sm:px-12 lg:h-full lg:w-[44%] lg:min-w-105 lg:items-center lg:px-12 lg:pt-0 lg:pb-0"
	>
		<div class="flex w-full max-w-md flex-col gap-7">
			<h1 class="flex flex-wrap items-center gap-3">
				<EvilChartWordmark class="h-9 w-auto text-foreground" />
				<span class="sr-only">Evil Charts for Svelte</span>
				<a
					href={PORT_REPO_URL}
					target="_blank"
					rel="noreferrer"
					class="inline-flex h-7 items-center rounded-md bg-[#ff3e00] px-2.5 text-xs font-semibold text-white outline-none hover:bg-[#e63800] focus-visible:ring-[3px] focus-visible:ring-[#ff3e00]/35"
				>
					Svelte 5 port
				</a>
			</h1>
			<p class="text-[15px] text-muted-foreground">
				A Svelte 5 port of
				<a
					class="text-[#ff3e00] underline decoration-[#ff3e00]/50 decoration-1 underline-offset-4 hover:decoration-[#ff3e00]"
					href={UPSTREAM_REPO_URL}
					target="_blank"
					rel="noreferrer">{UPSTREAM_NAME}</a
				>
				with LayerChart and Apache ECharts providers. It also includes ordered-dither styles inspired
				by
				<a
					class="text-[#ff3e00] underline decoration-[#ff3e00]/50 decoration-1 underline-offset-4 hover:decoration-[#ff3e00]"
					href="https://github.com/Boring-Software-Inc/dither-kit"
					target="_blank"
					rel="noreferrer">Dither Kit</a
				>. Install each chart as source through shadcn-svelte.
			</p>
			<div class="flex flex-wrap items-center gap-3">
				<Button href="/docs">
					Browse Charts <ArrowRight />
				</Button>
				<Button variant="outline" href={PORT_REPO_URL} target="_blank" rel="noreferrer">
					<!-- GitHub's mark, as the reference inlines it. -->
					<svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.54-.01 2.77-.01 3.15 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
						/>
					</svg>
					Star on GitHub
					{#if data.stars !== null}
						<span class="border-l pl-1.5 font-mono text-xs text-muted-foreground tabular-nums">
							{formatStars(data.stars)}
						</span>
					{/if}
				</Button>
			</div>
		</div>
	</section>
	<div class="relative h-[56dvh] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]">
		<ChartStage class="absolute inset-0" />
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b easing-gradient from-background lg:hidden"
		></div>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-y-0 left-0 hidden w-1/5 bg-linear-to-r easing-gradient from-background lg:block"
		></div>
	</div>
</main>
