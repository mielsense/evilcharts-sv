<script lang="ts">
	/**
	 * `ApiHeading` from `evilcharts/src/components/docs/mdx/components/api-reference.tsx`.
	 *
	 * Section header for a single component's API reference (e.g. `<Area />`). Renders like an h3
	 * but is intentionally NOT a markdown heading, so these per-component entries stay out of the
	 * page's table of contents.
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div
	class={cn(
		'font-heading mt-8 scroll-m-10 text-base font-medium tracking-tight text-primary select-none [&+p]:mt-4!',
		className
	)}
>
	{@render children?.()}
</div>
