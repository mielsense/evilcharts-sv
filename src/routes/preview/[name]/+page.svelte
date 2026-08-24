<script lang="ts">
	import { page } from '$app/state';
	import { getRegistryComponent } from '$lib/registry/components.js';
	import { cn } from '$lib/utils.js';
	import type { Component } from 'svelte';

	/** The reference's `ComponentPreview` box, measured on its running docs site. */
	const REFERENCE_CARD_WIDTH = 630;
	const REFERENCE_CARD_HEIGHT = 360;

	const name = $derived(page.params.name!);
	const width = $derived(page.url.searchParams.get('w'));
	const height = $derived(page.url.searchParams.get('h'));

	let resolved = $state<{ name: string; component: Component<Record<string, never>> | null }>({
		name: '',
		component: null
	});

	$effect(() => {
		const current = name;
		const loader = getRegistryComponent(current);
		if (!loader) {
			resolved = { name: current, component: null };
			return;
		}
		let cancelled = false;
		loader().then((mod) => {
			if (!cancelled) resolved = { name: current, component: mod.default };
		});
		return () => {
			cancelled = true;
		};
	});

	const ready = $derived(resolved.name === name);
	const Preview = $derived(ready ? resolved.component : null);
</script>

<svelte:head>
	<title>{name} — preview</title>
</svelte:head>

<!--
	Mirrors the inner preview box of `component-preview-tabs.tsx`: the bordered `bg-background` panel
	with the `h-64 sm:h-90` centred content area. Kept free of docs chrome so screenshots line up 1:1
	with the reference's preview card.

	The default box is the reference's measured card — 630x360 — because that is the only size the
	reference ever renders at. Several of its examples pin geometry in **pixels**
	(`innerRadius={60}`, `cornerRadius={99}`, `barSize={14}`, `strokeWidth={5}`) while the outer
	radius is a percentage of the plot, so those charts are only comparable at this size. `?w=`/`?h=`
	override it for debugging; expect fixed-pixel geometry to read differently there — Recharts
	behaves the same way, its docs card just never grows. See plans/DEVIATIONS.md P-1.
-->
<div class="flex min-h-dvh w-full items-center justify-center bg-sidebar p-1">
	<div
		class={cn('w-full overflow-hidden rounded-[5px] border bg-background')}
		style={`max-width:${width ?? REFERENCE_CARD_WIDTH}px`}
	>
		<div
			class="flex w-full items-center justify-center overflow-y-auto"
			style={`height:${height ?? REFERENCE_CARD_HEIGHT}px`}
		>
			<div
				class="no-scrollbar h-full w-full [&>svg]:select-none"
				data-slot="preview"
				data-preview-ready={ready && Preview ? 'true' : undefined}
			>
				{#if Preview}
					<Preview />
				{:else if ready}
					<p class="flex size-full items-center justify-center text-[13px] text-muted-foreground">
						Component <code
							class="relative mx-1 rounded-md border bg-background px-[0.3rem] py-1 font-mono text-[0.75rem] text-red-500 outline-none"
							>{name}</code
						> not found in registry.
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>
