<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/docs/charts/component-preview.tsx`.
	 *
	 * The reference resolves the example through the generated `Index`, whose entries carry a
	 * `React.lazy` component. Here the lazy lookup lives in `$lib/registry/components.ts` (Vite can
	 * glob, Next cannot), and `__index__.ts` supplies the metadata. See plans/DEVIATIONS.md R-2.
	 */
	import type { Component } from 'svelte';
	import { getRegistryComponent } from '$lib/registry/components.js';
	import { Index } from '$lib/registry/__index__.js';
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

	let resolved = $state<{ name: string; component: Component<Record<string, never>> } | null>(null);

	$effect(() => {
		const current = name;
		const load = loader;
		if (!load) return;
		let cancelled = false;
		load().then((module) => {
			if (!cancelled) resolved = { name: current, component: module.default };
		});
		return () => {
			cancelled = true;
		};
	});

	const component = $derived(resolved?.name === name ? resolved.component : null);
</script>

{#if !loader}
	<p class="mt-4 text-[13px] leading-6 text-muted-foreground">
		Component <code
			class="relative mx-1 rounded-md border bg-background px-[0.3rem] py-1 font-mono text-[0.75rem] text-red-500 outline-none"
			>{name}</code
		>
		not found in registry. Contact the developer to add it.
		<a
			target="_blank"
			href="https://github.com/legions-developer/evilcharts/issues"
			class="text-primary hover:underline">open an issue</a
		>
	</p>
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
