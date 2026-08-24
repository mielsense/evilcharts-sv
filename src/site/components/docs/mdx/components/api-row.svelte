<script lang="ts">
	/** `ApiRow` from `evilcharts/src/components/docs/mdx/components/api-reference.tsx`. */
	import type { Snippet } from 'svelte';

	let {
		name,
		type,
		default: defaultValue,
		required = false,
		children
	}: {
		name: string; // the prop name
		type?: string; // the prop's TypeScript type, written as plain text
		default?: string; // the default value, omit when the prop has none
		required?: boolean; // marks the prop as required
		children?: Snippet; // the prop description
	} = $props();

	/**
	 * String-literal members of a union (e.g. `"solid" | "dotted"`) are shown as badges separated by
	 * `|`; anything else falls back to plain mono text. The reference's `renderType`.
	 */
	const parts = $derived((type ?? '').split('|').map((part) => part.trim()));
	const isLiteralUnion = $derived(
		parts.length > 1 && parts.every((part) => /^"[^"]*"$/.test(part))
	);
</script>

<tr class="border-b">
	<td class="px-4 py-2.5 align-top">
		<span class="font-mono text-[13px] whitespace-nowrap text-primary">
			{name}{#if required}<span class="text-rose-500" title="Required">*</span>{/if}
		</span>
	</td>
	<td class="px-4 py-2.5 align-top">
		{#if !type}
			<span class="text-muted-foreground/40">–</span>
		{:else if isLiteralUnion}
			<span class="flex flex-wrap items-center gap-1.5">
				{#each parts as part, index (part)}
					{#if index > 0}
						<span class="font-mono text-[12px] text-muted-foreground/40">|</span>
					{/if}
					<span
						class="inline-flex items-center rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] dark:bg-muted/40"
					>
						{part.slice(1, -1)}
					</span>
				{/each}
			</span>
		{:else}
			<span class="font-mono text-[12px] text-muted-foreground">{type}</span>
		{/if}
	</td>
	<td class="px-4 py-2.5 align-top">
		{#if defaultValue}
			<span class="font-mono text-[12px] whitespace-nowrap text-muted-foreground">
				{defaultValue}
			</span>
		{:else}
			<span class="text-muted-foreground/40">–</span>
		{/if}
	</td>
	<td class="min-w-[220px] px-4 py-2.5 align-top text-[13px] text-muted-foreground [&>p]:my-0">
		{@render children?.()}
	</td>
</tr>
