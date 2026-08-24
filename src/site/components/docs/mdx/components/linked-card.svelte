<script lang="ts">
	/** `LinkedCard` from `evilcharts/src/components/docs/mdx/components/linked-card.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		href,
		children,
		...rest
	}: { class?: string; href: string; children?: Snippet } & Omit<
		HTMLAnchorAttributes,
		'class' | 'children' | 'href'
	> = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

<a
	{href}
	class={cn(
		'bg-surface text-surface-foreground hover:bg-surface/80 flex w-full flex-col items-center rounded-xl p-6 transition-colors sm:p-10',
		className
	)}
	{...rest}
>
	{@render children?.()}
</a>
