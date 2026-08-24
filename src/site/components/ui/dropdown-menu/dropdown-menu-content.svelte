<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/dropdown-menu.tsx`. */
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		sideOffset = 4,
		side,
		align,
		alignOffset,
		children
	}: {
		class?: string;
		sideOffset?: number;
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		alignOffset?: number;
		children?: Snippet;
	} = $props();
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.Content
		{side}
		{sideOffset}
		{align}
		{alignOffset}
		data-slot="dropdown-menu-content"
		class={cn(
			'z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition ease-in-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2 data-[side=top]:data-starting-style:translate-y-2',
			className
		)}
	>
		{@render children?.()}
	</DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Portal>
