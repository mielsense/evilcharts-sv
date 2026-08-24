<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sheet.tsx`. */
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<SheetPrimitive.Title
	data-slot="sheet-title"
	class={cn('font-semibold text-foreground', className)}
>
	{@render children?.()}
</SheetPrimitive.Title>
