<script lang="ts">
	/** Ported from `evilcharts/src/components/ui/sheet.tsx`. */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div data-slot="sheet-header" class={cn('flex flex-col gap-1.5 p-4', className)}>
	{@render children?.()}
</div>
