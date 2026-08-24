<script lang="ts">
	let { isLoading }: { isLoading: boolean } = $props();
</script>

{#if isLoading}
	<div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
		<div
			class="flex items-center justify-center gap-2 rounded-md border bg-background px-2 py-0.5 text-sm text-primary"
		>
			<div class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary"></div>
			<span>Loading</span>
		</div>
	</div>
{/if}
