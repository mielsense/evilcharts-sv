<script lang="ts">
	/**
	 * `MDXLink` from `evilcharts/src/components/docs/mdx/components/link.tsx`.
	 *
	 * The markdown calls it as `<Link href="…" _blank={true}>`, so the odd `_blank` prop name is
	 * kept as-is.
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let {
		href,
		class: className,
		_blank = false,
		children
	}: { href: string; class?: string; _blank?: boolean; children?: Snippet } = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

<a {href} target={_blank ? '_blank' : '_self'} class={cn(className, 'group hover:text-primary')}>
	<span
		class="underline decoration-primary/50 decoration-1 underline-offset-4 transition-colors duration-100 group-hover:decoration-primary"
	>
		{@render children?.()}
	</span>
	<!-- Lucide's `link` glyph, inline: the reference renders `<LinkIcon>` here. -->
	<svg
		class="mb-0.5 ml-0.5 inline size-2.5 text-muted-foreground duration-100 group-hover:text-primary"
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
</a>
