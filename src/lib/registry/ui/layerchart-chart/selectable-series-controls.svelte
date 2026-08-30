<script lang="ts">
	let {
		items,
		selectedKey,
		onToggle
	}: {
		items: { key: string; label: string }[];
		selectedKey: string | null;
		onToggle: (key: string) => void;
	} = $props();
</script>

{#if items.length > 0}
	<div
		class="pointer-events-none absolute inset-0 z-50"
		role="group"
		aria-label="Selectable chart series"
	>
		{#each items as item (item.key)}
			<button
				type="button"
				aria-pressed={selectedKey === item.key}
				class="sr-only focus:pointer-events-auto focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
				onclick={() => onToggle(item.key)}
			>
				{item.label}
			</button>
		{/each}
	</div>
{/if}
