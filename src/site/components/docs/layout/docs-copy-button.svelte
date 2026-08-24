<script lang="ts">
	/**
	 * `DocsCopyPage` from `evilcharts/src/components/docs/layout/docs-copy-button.tsx`
	 * (which the reference in turn took from the shadcn docs).
	 *
	 * `@mantine/hooks`' `useClipboard` becomes a local flag. The reference wraps the row in a
	 * `<Popover>` with a bare `<PopoverAnchor/>` and no popover content at all — that pairing has no
	 * effect, so it is dropped here. `@carbon/icons-react`'s `CaretDown` becomes Lucide's.
	 * See plans/DEVIATIONS.md D-5.
	 */
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { CheckIcon, CopyIcon } from '$site/assets/icons/index.js';
	import { Button } from '$site/components/ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$site/components/ui/dropdown-menu/index.js';
	import { cn } from '$site/lib/utils.js';

	let { mdx, url, path }: { mdx: string; url: string; path: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(mdx);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2000);
		} catch {
			// A denied clipboard permission must not break the docs.
		}
	}

	$effect(() => () => clearTimeout(timer));

	function promptUrl(baseURL: string) {
		return `${baseURL}?q=${encodeURIComponent(
			`I’m looking at this evilcharts documentation: ${url}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.
  `
		)}`;
	}

	/**
	 * The same five entries as the reference. `markdown` is deliberately a **relative** href so it
	 * works on localhost and previews too; the AI links genuinely want the absolute production URL.
	 */
	const items = $derived([
		{ key: 'markdown', label: 'View as Markdown', href: `${path}.md` },
		{ key: 'v0', label: 'Open in v0', href: promptUrl('https://v0.dev') },
		{ key: 'chatgpt', label: 'Open in ChatGPT', href: promptUrl('https://chatgpt.com') },
		{ key: 'claude', label: 'Open in Claude', href: promptUrl('https://claude.ai/new') },
		{ key: 'scira', label: 'Open in Scira', href: promptUrl('https://scira.ai/') }
	]);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

<div
	class="group/buttons relative flex rounded-lg bg-[#F5F5F5] p-[2px] select-none *:data-[slot=button]:focus-visible:relative *:data-[slot=button]:focus-visible:z-10 dark:bg-primary-foreground"
>
	<Button
		aria-label="Copy page"
		variant="secondary"
		size="sm"
		class="border bg-background px-1.5! text-xs text-muted-foreground duration-0 hover:border-primary/20 hover:bg-background hover:text-primary"
		onclick={copy}
	>
		{#if copied}
			<CheckIcon />
		{:else}
			<CopyIcon />
		{/if}
		<span class={cn(copied && 'opacity-0')}>Copy Page</span>
		<span class={cn('absolute opacity-0', copied && 'opacity-100')}>Copied</span>
	</Button>
	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="secondary"
					size="sm"
					aria-label="Open dropdown menu"
					class="peer bg-transparent px-1! text-muted-foreground hover:bg-transparent hover:text-primary focus-visible:ring-0!"
				>
					<ChevronDown />
				</Button>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" class="rounded-lg bg-background">
			{#each items as item (item.key)}
				<DropdownMenuItem
					class="cursor-pointer text-[13px] text-muted-foreground/80 hover:bg-muted/50! hover:text-primary!"
				>
					{#snippet child({ props })}
						<a {...props} href={item.href} target="_blank" rel="noopener noreferrer">
							{item.label}
						</a>
					{/snippet}
				</DropdownMenuItem>
			{/each}
		</DropdownMenuContent>
	</DropdownMenu>
</div>
