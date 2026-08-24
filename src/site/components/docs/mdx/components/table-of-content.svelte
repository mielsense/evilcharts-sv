<script lang="ts">
	/**
	 * `DocsTableOfContents` from
	 * `evilcharts/src/components/docs/mdx/components/table-of-content.tsx`.
	 *
	 * Both variants are ported. The row measuring stays in this parent, as it does in the
	 * reference: the indicator renders before the list, so measuring from inside it would read a
	 * not-yet-attached sibling.
	 *
	 * The dropdown variant renders a `<details>`/`<summary>` pair rather than the reference's
	 * Base UI dropdown — the docs never mount it (only the `list` variant is used), so a whole
	 * dropdown primitive would be dead weight.
	 */
	import Menu from '@lucide/svelte/icons/menu';
	import type { TocEntry } from '$site/lib/source.js';
	import { cn } from '$site/lib/utils.js';
	import TocIndicator from './toc-indicator.svelte';
	import { sameRows, selectActiveHeading, type RowMetrics } from './toc-indicator.svelte.js';

	const ACTIVE_HEADING_OFFSET = 96;

	let {
		toc,
		variant = 'list',
		class: className
	}: { toc: TocEntry[]; variant?: 'dropdown' | 'list'; class?: string } = $props();

	const itemIds = $derived(toc.map((item) => item.url.replace('#', '')));

	let wrapper = $state<HTMLDivElement | null>(null);
	let list = $state<HTMLDivElement | null>(null);
	let rows = $state<RowMetrics[]>([]);
	let activeHeading = $state<string | null>(null);

	/**
	 * Each row measured against the wrapper the indicator is stretched over, so both share one
	 * coordinate system. Re-measures on anything that can rewrap a heading: the sidebar resizing, a
	 * font landing late, the toc itself changing.
	 */
	$effect(() => {
		const origin = wrapper;
		const container = list;
		if (!origin || !container) return;
		// Read so a changed toc re-measures.
		void toc.length;

		let measureFrame = 0;
		const measure = () => {
			measureFrame = 0;
			const originY = origin.getBoundingClientRect().top;
			const next = [...container.children].map((child) => {
				const rect = child.getBoundingClientRect();
				return { top: rect.top - originY, height: rect.height };
			});
			// Bail when nothing moved: the observer fires on our own re-render too.
			if (!sameRows(rows, next)) rows = next;
		};
		const scheduleMeasure = () => {
			if (!measureFrame) measureFrame = requestAnimationFrame(measure);
		};

		scheduleMeasure();

		const observer = new ResizeObserver(scheduleMeasure);
		observer.observe(container);
		for (const child of container.children) observer.observe(child);
		return () => {
			observer.disconnect();
			if (measureFrame) cancelAnimationFrame(measureFrame);
		};
	});

	/** Follow headings inside the nested docs scroller using a stable offset below its header. */
	$effect(() => {
		const ids = itemIds;
		const anchor = wrapper;
		if (ids.length === 0 || !anchor) return;

		let parent = anchor.parentElement;
		let scrollRoot: HTMLElement | null = null;
		while (parent) {
			const overflowY = getComputedStyle(parent).overflowY;
			if (/(auto|scroll)/.test(overflowY) && parent.scrollHeight > parent.clientHeight) {
				scrollRoot = parent;
				break;
			}
			parent = parent.parentElement;
		}

		let activeFrame = 0;
		const updateActiveHeading = () => {
			activeFrame = 0;
			const rootTop = scrollRoot?.getBoundingClientRect().top ?? 0;
			const positions = ids.flatMap((id) => {
				const element = document.getElementById(id);
				return element ? [{ id, top: element.getBoundingClientRect().top - rootTop }] : [];
			});
			activeHeading = selectActiveHeading(ids, positions, ACTIVE_HEADING_OFFSET);
		};
		const scheduleActiveHeading = () => {
			if (!activeFrame) activeFrame = requestAnimationFrame(updateActiveHeading);
		};

		const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
		scrollTarget.addEventListener('scroll', scheduleActiveHeading, { passive: true });
		window.addEventListener('resize', scheduleActiveHeading, { passive: true });
		scheduleActiveHeading();

		return () => {
			scrollTarget.removeEventListener('scroll', scheduleActiveHeading);
			window.removeEventListener('resize', scheduleActiveHeading);
			if (activeFrame) cancelAnimationFrame(activeFrame);
		};
	});

	const activeIndex = $derived(activeHeading ? itemIds.indexOf(activeHeading) : -1);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

{#if toc.length}
	{#if variant === 'dropdown'}
		<details class={cn('group', className)}>
			<summary
				class="flex h-8 cursor-pointer items-center rounded-md border bg-background px-3 text-[13px] font-medium hover:bg-accent hover:text-accent-foreground md:h-7"
			>
				On This Page
			</summary>
			<div
				class="mt-1 no-scrollbar max-h-[70svh] overflow-y-auto rounded-md border bg-background p-1"
			>
				{#each toc as item (item.url)}
					<a
						href={item.url}
						data-depth={item.depth}
						class="block cursor-pointer rounded px-2 py-1 text-[13px] text-muted-foreground/80 hover:bg-muted/50 hover:text-primary data-[depth=3]:pl-6 data-[depth=4]:pl-8"
					>
						{item.title}
					</a>
				{/each}
			</div>
		</details>
	{:else}
		<div class={cn('flex flex-col px-4 pt-0 text-sm select-none', className)}>
			<div class="flex h-6 flex-row items-center gap-[5px]">
				<Menu size={14} class="text-muted-foreground" />
				<p class="sticky top-0 bg-background text-xs text-muted-foreground/75">On This Page</p>
			</div>
			<div bind:this={wrapper} class="relative flex flex-row">
				<TocIndicator {toc} {activeIndex} {rows} />
				<div bind:this={list} class="flex h-fit flex-col gap-2 pt-2">
					{#each toc as item (item.url)}
						<a
							href={item.url}
							class="text-[0.8rem] text-muted-foreground/75 no-underline transition-colors duration-200 empty:hidden hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground data-[depth=1]:pl-5 data-[depth=2]:pl-5 data-[depth=3]:pl-8 data-[depth=4]:pl-11"
							data-active={item.url === `#${activeHeading}`}
							data-depth={item.depth}
						>
							{item.title}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}
{/if}
