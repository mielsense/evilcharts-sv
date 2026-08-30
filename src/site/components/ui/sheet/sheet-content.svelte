<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sheet.tsx`. */
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let {
		class: className,
		side = 'right',
		style,
		children,
		...rest
	}: {
		class?: string;
		side?: 'top' | 'right' | 'bottom' | 'left';
		style?: string;
		children?: Snippet;
	} & Record<string, unknown> = $props();
</script>

<SheetPrimitive.Portal>
	<SheetPrimitive.Overlay
		data-slot="sheet-overlay"
		class="fixed inset-0 z-50 bg-black/50 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0"
	/>
	<SheetPrimitive.Content
		data-slot="sheet-content"
		{style}
		class={cn(
			'fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-open:duration-500 data-closed:duration-300',
			side === 'right' &&
				'inset-y-0 right-0 h-full w-3/4 border-l data-ending-style:translate-x-full data-starting-style:translate-x-full sm:max-w-sm',
			side === 'left' &&
				'inset-y-0 left-0 h-full w-3/4 border-r data-ending-style:-translate-x-full data-starting-style:-translate-x-full sm:max-w-sm',
			side === 'top' &&
				'inset-x-0 top-0 h-auto border-b data-ending-style:-translate-y-full data-starting-style:-translate-y-full',
			side === 'bottom' &&
				'inset-x-0 bottom-0 h-auto border-t data-ending-style:translate-y-full data-starting-style:translate-y-full',
			className
		)}
		{...rest}
	>
		{@render children?.()}
		<SheetPrimitive.Close
			class="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-open:bg-secondary"
		>
			<HugeiconsIcon icon={Cancel01Icon} aria-hidden="true" class="size-4" />
			<span class="sr-only">Close</span>
		</SheetPrimitive.Close>
	</SheetPrimitive.Content>
</SheetPrimitive.Portal>
