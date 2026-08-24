<script lang="ts">
	/**
	 * `ApiTable` from `evilcharts/src/components/docs/mdx/components/api-reference.tsx`.
	 *
	 * Table wrapper for a component's API reference. Renders the column header
	 * (Prop / Type / Default / Description) and frames the `<ApiRow>` rows.
	 */
	import type { Snippet } from 'svelte';
	import { cn } from '$site/lib/utils.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();
</script>

<div class="my-6 no-scrollbar w-full overflow-x-auto rounded-lg border">
	<table class={cn('w-full border-none text-sm', className)}>
		<thead>
			<tr class="border-b bg-muted dark:bg-muted/30">
				<th class="px-4 py-2 text-left text-[12px] font-medium text-muted-foreground">Prop</th>
				<th class="px-4 py-2 text-left text-[12px] font-medium text-muted-foreground">Type</th>
				<th class="px-4 py-2 text-left text-[12px] font-medium text-muted-foreground">Default</th>
				<th class="px-4 py-2 text-left text-[12px] font-medium text-muted-foreground">
					Description
				</th>
			</tr>
		</thead>
		<tbody class="[&_tr:last-child]:border-b-0">{@render children?.()}</tbody>
	</table>
</div>
