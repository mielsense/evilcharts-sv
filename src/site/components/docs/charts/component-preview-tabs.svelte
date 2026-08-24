<script lang="ts">
	/** Ported from `evilcharts/src/components/docs/charts/component-preview-tabs.tsx`. */
	import type { Component, Snippet } from 'svelte';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import LanguageIcon from '$site/assets/language/language-icon.svelte';
	import { Tabs, TabsList, TabsPanel, TabsTab } from '$site/components/ui/tabs/index.js';
	import { useBreakpoint } from '$site/hooks/use-breakpoint.svelte.js';
	import { cn } from '$site/lib/utils.js';
	import LazyMount from './lazy-mount.svelte';

	let {
		class: className,
		containerClassName,
		align = 'center',
		hideCode = false,
		component,
		source,
		title
	}: {
		class?: string;
		containerClassName?: string;
		align?: 'center' | 'start' | 'end';
		hideCode?: boolean;
		/** The example itself. A component rather than a snippet, so the reload key can remount it. */
		component: Component<Record<string, never>>;
		source?: Snippet;
		title?: string;
	} = $props();

	const isMobile = useBreakpoint(768);
	const displayTitle = $derived(
		title?.includes('=') && isMobile.current ? title.split('=')[0] : title
	);

	let reloadKey = $state(0);
</script>

<div class={cn('group relative mt-4 mb-12', className)}>
	<Tabs defaultValue="preview" class="relative w-full">
		<div
			class={cn(
				'flex flex-col rounded-[8px] bg-[#F5F5F5] p-1 dark:bg-primary-foreground',
				containerClassName
			)}
		>
			<div class="flex flex-row items-center justify-between px-2">
				<span
					class="flex items-center gap-1.5 font-mono text-xs text-muted-foreground dark:text-muted-foreground/80 [&_svg]:size-3.5"
				>
					<LanguageIcon language="component" />
					<span class="line-clamp-1">{displayTitle}</span>
				</span>
				<div class="flex items-center gap-1.5">
					<button
						type="button"
						onclick={() => reloadKey++}
						aria-label="Reload preview"
						class="flex size-3 shrink-0 translate-x-1 cursor-pointer items-center justify-center text-muted-foreground opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 hover:text-foreground"
					>
						<RotateCw
							class="size-4! transition-transform duration-500 ease-out"
							style={`transform: rotate(${reloadKey * 360}deg)`}
						/>
					</button>
					{#if !hideCode}
						<TabsList variant="underline">
							<TabsTab class="h-5! px-1.5 hover:bg-transparent!" value="code">Code</TabsTab>
							<TabsTab class="h-5! px-1.5 hover:bg-transparent!" value="preview">Preview</TabsTab>
						</TabsList>
					{/if}
				</div>
			</div>

			<div class="overflow-hidden rounded-[5px] border bg-background">
				<TabsPanel value="preview">
					<div
						class="flex h-64 w-full justify-center overflow-y-auto data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start sm:h-90"
						data-align={align}
					>
						<div class="no-scrollbar h-full w-full [&>svg]:select-none" data-slot="preview">
							<LazyMount>
								{#snippet fallback()}
									<div class="flex size-full items-center justify-center"></div>
								{/snippet}
								<!-- Keyed on the reload counter, which is what the reference's `<Fragment key>` does. -->
								{#key reloadKey}
									{@const Preview = component}
									<Preview />
								{/key}
							</LazyMount>
						</div>
					</div>
				</TabsPanel>

				<TabsPanel value="code">
					<div class="flex h-64 w-full flex-col overflow-hidden sm:h-90">
						<div class="relative no-scrollbar size-full overflow-y-auto">
							{@render source?.()}
						</div>
					</div>
				</TabsPanel>
			</div>
		</div>
	</Tabs>
</div>
