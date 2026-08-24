<script lang="ts">
	/** `DocsSidebar` from `evilcharts/src/components/docs/sidebar/index.tsx`. */
	import { resolve } from '$app/paths';
	import EvilChartWordmark from '$site/assets/logos/evilchart-wordmark.svelte';
	import { Sidebar, SidebarContent, SidebarHeader } from '$site/components/ui/sidebar/index.js';
	import { pageTree } from '$site/lib/source.js';
	import { cn } from '$site/lib/utils.js';
	import SidebarSections from './sidebar-sections.svelte';
</script>

<Sidebar collapsible="icon">
	<SidebarHeader class="px-4 pt-6 pb-3">
		<a
			href={resolve('/docs/[...slug]', { slug: '' })}
			aria-label="EvilCharts docs home"
			class="w-fit rounded-sm transition-opacity outline-none hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
		>
			<EvilChartWordmark height="20" width="130" class="z-10" />
		</a>
	</SidebarHeader>
	<SidebarContent class={cn('scroll-fade select-none', 'pt-2 pb-14')}>
		<SidebarSections tree={pageTree} />
	</SidebarContent>
</Sidebar>
