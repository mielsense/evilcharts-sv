<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/docs/mdx/components/copy-button.tsx`.
	 *
	 * `@mantine/hooks`' `useClipboard({ timeout: 1000 })` becomes a local timer with the same
	 * 1000 ms reset.
	 */
	import { CheckIcon, CopyIcon } from '$site/assets/icons/index.js';
	import { Button } from '$site/components/ui/button/index.js';
	import { cn } from '$site/lib/utils.js';

	let {
		code,
		withBlurBg = false,
		class: className
	}: { code: string; withBlurBg?: boolean; class?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 1000);
		} catch {
			// A denied clipboard permission must not break the docs.
		}
	}

	$effect(() => () => clearTimeout(timer));
</script>

<Button
	class={cn(
		'h-6 w-6 rounded active:scale-90 dark:hover:bg-[#232323]!',
		withBlurBg && 'bg-background',
		className
	)}
	variant="ghost"
	size="icon"
	aria-label="Copy code"
	onclick={copy}
>
	{#if copied}
		<CheckIcon />
	{:else}
		<CopyIcon />
	{/if}
</Button>
