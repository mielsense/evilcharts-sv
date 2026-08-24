<script lang="ts">
	/** Ported from `evilcharts/src/components/docs/charts/code-collapsible-wrapper.tsx`. */
	import type { Snippet } from 'svelte';
	import {
		Collapsible,
		CollapsiblePanel,
		CollapsibleTrigger
	} from '$site/components/ui/collapsible/index.js';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<Collapsible class={cn('group/collapsible relative', className)}>
	<CollapsiblePanel
		class="relative h-full overflow-hidden data-closed:max-h-64 [&>figure]:mt-0 [&>figure]:md:mx-0!"
	>
		{@render children?.()}
	</CollapsiblePanel>
	<CollapsibleTrigger
		class="absolute inset-x-0 -bottom-1 flex h-16 cursor-pointer items-end justify-end bg-linear-to-b from-transparent via-50% to-background text-sm font-medium text-muted-foreground transition-colors duration-[0ms] group-data-open/collapsible:hidden hover:text-foreground hover:duration-200 hover:[&>div]:border-primary/50"
	>
		<div
			class="mr-4 mb-4 rounded-md border bg-background px-2 py-0.5 font-normal shadow-[0px_0px_8px_20px_var(--color-background)]/50"
		>
			Expand
		</div>
	</CollapsibleTrigger>
	<CollapsibleTrigger
		class="absolute right-4 bottom-4 hidden cursor-pointer rounded-md border bg-background px-2 py-0.5 text-sm font-normal text-muted-foreground shadow-sm transition-colors duration-[0ms] group-data-open/collapsible:block hover:border-primary/50 hover:text-foreground hover:duration-200"
	>
		Collapse
	</CollapsibleTrigger>
</Collapsible>
