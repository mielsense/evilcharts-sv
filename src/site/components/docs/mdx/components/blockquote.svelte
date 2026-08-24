<script lang="ts">
	/** `Blockquote` from `evilcharts/src/components/docs/mdx/components/blockquote.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLQuoteElement>,
		'class' | 'children'
	> = $props();
</script>

<blockquote class={cn('mt-6 border-l-2 pl-6 italic', className)} {...rest}>
	{@render children?.()}
</blockquote>
