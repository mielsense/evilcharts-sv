<script lang="ts">
	/**
	 * `SidebarSections` from `evilcharts/src/components/docs/sidebar/sidebar-sections.tsx`.
	 *
	 * The provider-aware half of the sidebar. The active provider comes from the pathname; on
	 * shared pages it stays on the engine the reader was last in, tracked in a module singleton
	 * mirrored to localStorage.
	 */
	import { page } from '$app/state';
	import {
		DocumentationOptions,
		getChartComponentOptions,
		getStartedOptions
	} from '$site/globals/constants/docs-sidebar.js';
	import { DEFAULT_PROVIDER, providerFromPathname } from '$site/globals/constants/providers.js';
	import {
		rememberProvider,
		useLastProvider
	} from '$site/globals/functions/last-provider.svelte.js';
	import { flattenTree, type PageTree } from '$site/lib/source.js';
	import NavMain from './nav-main.svelte';
	import ProviderSwitcher from './provider-switcher.svelte';
	import RenderDefaultOptions from './render-default-options.svelte';

	let { tree }: { tree: PageTree } = $props();

	const pathProvider = $derived(providerFromPathname(page.url.pathname));

	$effect(() => {
		if (pathProvider) rememberProvider(pathProvider);
	});

	const provider = $derived(pathProvider ?? useLastProvider() ?? DEFAULT_PROVIDER);

	// The groups below are hand-written lists, not derived from content, so they would happily link
	// to pages a provider does not have yet. Checking each URL against the tree keeps a half-built
	// provider from showing links that 404.
	const existingUrls = $derived(new Set(flattenTree(tree.children).map((item) => item.url)));
</script>

<div class="px-2 group-data-[collapsible=icon]:hidden">
	<ProviderSwitcher {existingUrls} activeProvider={provider} onProviderChange={rememberProvider} />
</div>
<RenderDefaultOptions options={getStartedOptions(provider)} label="Get Started" {existingUrls} />
<NavMain {tree} {provider} />
<RenderDefaultOptions
	options={getChartComponentOptions(provider)}
	label="Chart Components"
	{existingUrls}
/>
<RenderDefaultOptions options={DocumentationOptions} label="Documentation" {existingUrls} />
