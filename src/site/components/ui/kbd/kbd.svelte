<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/kbd.tsx`; class strings verbatim. */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLElement>,
		'class' | 'children'
	> = $props();
</script>

<kbd
	data-slot="kbd"
	class={cn(
		'pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none',
		"[&_svg:not([class*='size-'])]:size-3",
		'[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10',
		className
	)}
	{...rest}>{@render children?.()}</kbd
>
