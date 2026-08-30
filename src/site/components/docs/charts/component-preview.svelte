<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/docs/charts/component-preview.tsx`.
	 *
	 * The reference resolves the example through the generated `Index`, whose entries carry a
	 * `React.lazy` component. Here the lazy lookup lives in `$lib/registry/components.ts` (Vite can
	 * glob, Next cannot), and `__index__.ts` supplies the metadata.
	 */
	import type { Component } from 'svelte';
	import { getRegistryComponent } from '$lib/registry/components.js';
	import { Index } from '$lib/registry/__index__.js';
	import { PORT_ISSUES_URL } from '$site/globals/constants/site.js';
	import { cn } from '$site/lib/utils.js';
	import ComponentPreviewTabs from './component-preview-tabs.svelte';
	import ComponentSource from './component-source.svelte';

	let {
		name,
		class: className,
		align = 'center',
		hideCode = false,
		title,
		containerClassName
	}: {
		name: string;
		class?: string;
		align?: 'center' | 'start' | 'end';
		hideCode?: boolean;
		title?: string;
		containerClassName?: string;
	} = $props();

	const loader = $derived(getRegistryComponent(name));
	const metaClassName = $derived(Index[name]?.meta?.className as string | undefined);

	type PreviewLoadState =
		| { status: 'loading' }
		| { status: 'ready'; name: string; component: Component<Record<string, never>> }
		| { status: 'missing' }
		| { status: 'failed' };

	let retryToken = $state(0);
	let loadState = $state<PreviewLoadState>({ status: 'loading' });

	$effect(() => {
		const current = name;
		const load = loader;
		void retryToken;
		loadState = load ? { status: 'loading' } : { status: 'missing' };
		if (!load) return;

		let cancelled = false;
		load()
			.then((module) => {
				if (!cancelled) loadState = { status: 'ready', name: current, component: module.default };
			})
			.catch(() => {
				if (!cancelled) loadState = { status: 'failed' };
			});

		return () => {
			cancelled = true;
		};
	});

	const component = $derived(
		loadState.status === 'ready' && loadState.name === name ? loadState.component : null
	);
</script>

{#if !loader || loadState.status === 'missing'}
	<p class="mt-4 text-[13px] leading-6 text-muted-foreground">
		The <code
			class="relative mx-1 rounded-md border bg-background px-[0.3rem] py-1 font-mono text-[0.75rem] text-red-500 outline-none"
			>{name}</code
		>
		component is missing from the registry.
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External issue tracker. -->
		<a target="_blank" href={PORT_ISSUES_URL} class="text-primary hover:underline">Open an issue</a
		>.
	</p>
{:else if loadState.status === 'failed'}
	<div
		class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] leading-6 text-muted-foreground"
	>
		<p>
			The <code
				class="relative mx-1 rounded-md border bg-background px-[0.3rem] py-1 font-mono text-[0.75rem] text-red-500 outline-none"
				>{name}</code
			>
			component could not be loaded.
		</p>
		<button
			type="button"
			class="rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
			onclick={() => (retryToken += 1)}>Try again</button
		>
	</div>
{:else if component}
	<ComponentPreviewTabs
		{align}
		class={cn(metaClassName, className)}
		{containerClassName}
		{component}
		{hideCode}
		{title}
	>
		{#snippet source()}
			<ComponentSource collapsible={false} {name} />
		{/snippet}
	</ComponentPreviewTabs>
{/if}
