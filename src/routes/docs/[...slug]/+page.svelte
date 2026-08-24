<script lang="ts">
	/**
	 * Ported from `evilcharts/src/app/docs/[[...slug]]/page.tsx`.
	 *
	 * Same body order: title, sr-only llms.txt pointer, description, the `links` row, the copy-page
	 * control, the compiled markdown, the feedback row, prev/next, and the table of contents.
	 */
	import FeedbackButtons from '$site/components/docs/mdx/components/feedback-buttons.svelte';
	import MdxNavigation from '$site/components/docs/mdx/components/navigation.svelte';
	import DocsTableOfContents from '$site/components/docs/mdx/components/table-of-content.svelte';
	import DocsCopyPage from '$site/components/docs/layout/docs-copy-button.svelte';
	import { absoluteUrl } from '$site/lib/utils.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const Content = $derived(data.content);
	const links = $derived(data.data.links);

	const LINK_ORDER = ['api', 'doc', 'github'] as const;
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

<svelte:head>
	<title>{data.data.title} — EvilCharts</title>
	{#if data.data.description}
		<meta name="description" content={data.data.description} />
	{/if}
	<link rel="canonical" href={absoluteUrl(data.url)} />
	<link
		rel="alternate"
		type="text/markdown"
		href={data.url === '/docs' ? '/docs.md' : `${data.url}.md`}
	/>
	<meta property="og:title" content={data.data.title} />
	{#if data.data.description}
		<meta property="og:description" content={data.data.description} />
	{/if}
	<meta property="og:url" content={absoluteUrl(data.url)} />
	<meta property="og:image" content={absoluteUrl(data.data.image ?? '/og/og-image.png')} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.data.title} />
	{#if data.data.description}
		<meta name="twitter:description" content={data.data.description} />
	{/if}
	<meta name="twitter:image" content={absoluteUrl(data.data.image ?? '/og/og-image.png')} />
</svelte:head>

<div class="relative mt-10 flex sm:mt-0">
	<div class="docs-container flex flex-col py-12 pb-32">
		<div class="flex flex-col items-start gap-6 min-[360px]:flex-row min-[360px]:gap-4">
			<div class="flex flex-1 flex-col gap-1">
				<h1 class="scroll-m-20 text-3xl font-semibold tracking-tight xl:text-4xl">
					{data.data.title}
				</h1>
				<blockquote class="sr-only">
					<h2>Documentation Index</h2>
					<p>
						Fetch the complete documentation index at: <a href="/llms.txt">/llms.txt</a>. Use this
						file to discover all available pages before exploring further.
					</p>
				</blockquote>
				{#if data.data.description}
					<p class="text-[15px] text-muted-foreground">{data.data.description}</p>
				{/if}
				{#if links}
					<div class="mt-3 flex flex-row gap-3 select-none">
						<!--
							Fumadocs parses `links` through a zod object declared `{ api, doc, github }`, so the
							reference renders them in that order regardless of the frontmatter's. Matched here.
						-->
						{#each LINK_ORDER.filter((key) => links[key]) as key (key)}
							{const value = links[key]!}
							<a
								class="flex flex-row items-center gap-2 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground capitalize hover:text-primary"
								href={value}
								target="_blank"
								rel="noreferrer"
							>
								<!-- Lucide's `link` glyph, as the reference renders it. -->
								<svg
									class="size-2.5"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
									<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
								</svg>
								{key}
							</a>
						{/each}
					</div>
				{/if}
			</div>
			<div class="shrink-0">
				<DocsCopyPage mdx={data.markdown} url={absoluteUrl(data.url)} path={data.url} />
			</div>
		</div>
		<div class="mt-8 w-full flex-1 text-[14px] text-primary/80 *:data-[slot=alert]:first:mt-0">
			<Content />
		</div>
		<div class="mt-40 flex flex-col gap-8">
			<div class="flex flex-row items-center justify-between">
				<FeedbackButtons />
			</div>
			<div class="grid grid-cols-2 gap-4 sm:gap-8">
				<div>
					{#if data.neighbours.previous}
						<MdxNavigation
							type="previous"
							title={data.neighbours.previous.title}
							url={data.neighbours.previous.url}
							description={data.neighbours.previous.description}
						/>
					{:else}
						<div class="h-full rounded-md border border-dashed"></div>
					{/if}
				</div>
				<div>
					{#if data.neighbours.next}
						<MdxNavigation
							type="next"
							title={data.neighbours.next.title}
							url={data.neighbours.next.url}
							description={data.neighbours.next.description}
						/>
					{:else}
						<div class="h-full rounded-md border border-dashed"></div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="sticky top-26 hidden h-fit self-start xl:flex">
		{#if data.toc.length}
			<div class="no-scrollbar w-72 overflow-y-auto px-8">
				<DocsTableOfContents toc={data.toc} />
			</div>
		{/if}
	</div>
</div>
