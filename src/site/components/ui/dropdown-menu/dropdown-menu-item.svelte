<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/dropdown-menu.tsx`. */
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		inset,
		variant = 'default',
		onclick,
		children,
		child
	}: {
		class?: string;
		inset?: boolean;
		variant?: 'default' | 'destructive';
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		/** The reference's `render={<a …/>}` escape hatch. */
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();
</script>

<DropdownMenuPrimitive.Item
	data-slot="dropdown-menu-item"
	data-inset={inset}
	data-variant={variant}
	class={cn(
		"relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
		className
	)}
	{onclick}
	{child}
>
	{@render children?.()}
</DropdownMenuPrimitive.Item>
