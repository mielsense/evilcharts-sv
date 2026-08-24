<script lang="ts">
	/** `Description` from `evilcharts/src/components/docs/mdx/components/text.tsx`. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLParagraphElement>,
		'class' | 'children'
	> = $props();
</script>

<p class={cn('text-muted-foreground', className)} {...rest}>{@render children?.()}</p>
