<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { scale } from 'svelte/transition';

	let { isLoading }: { isLoading: boolean } = $props();
</script>

{#if isLoading}
	<div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
		<div
			role="status"
			aria-live="polite"
			in:scale={{
				duration: prefersReducedMotion.current ? 0 : 250,
				start: 0.92,
				opacity: 0,
				easing: cubicOut
			}}
			class="flex items-center justify-center gap-2 rounded-md border bg-background px-2 py-0.5 text-sm text-primary"
		>
			<div
				aria-hidden="true"
				class="h-3 w-3 animate-spin rounded-full border border-border border-t-primary motion-reduce:animate-none"
			></div>
			<span>Loading</span>
		</div>
	</div>
{/if}
