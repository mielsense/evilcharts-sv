<script lang="ts">
	/** Ported from `evilcharts/src/app/docs/layout.tsx`. */
	import type { Snippet } from 'svelte';
	import DecorativeBorder from '$site/components/docs/layout/decorative-border.svelte';
	import { DocsHeader, DocsSidebar } from '$site/components/docs/sidebar/index.js';
	import { SidebarInset, SidebarProvider } from '$site/components/ui/sidebar/index.js';
	import { cn } from '$site/lib/utils.js';
	import type { LayoutData } from './$types.js';

	let { data, children }: { data: LayoutData; children?: Snippet } = $props();
</script>

<SidebarProvider>
	<DocsSidebar />
	<div class={cn('w-full bg-sidebar', 'p-0 pl-0 sm:py-2 sm:pr-2')}>
		<DecorativeBorder />
		<div
			class={cn(
				'no-scrollbar overflow-scroll bg-background sm:h-[calc(100vh-1rem)] sm:overscroll-none sm:border',
				// bottom-right is XL to match the macOS browser radius
				'sm:rounded-tl-md sm:rounded-br-xl sm:rounded-bl-md'
			)}
		>
			<SidebarInset>
				<DocsHeader stars={data.stars} />
				{@render children?.()}
			</SidebarInset>
		</div>
	</div>
</SidebarProvider>
