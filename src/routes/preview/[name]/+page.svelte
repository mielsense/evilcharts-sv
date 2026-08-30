<script lang="ts">
	import { page } from '$app/state';
	import { getRegistryComponent } from '$lib/registry/components.js';
	import { cn } from '$lib/utils.js';
	import type { Component } from 'svelte';
	import { parsePreviewDimension, PREVIEW_HEIGHT, PREVIEW_WIDTH } from './dimensions.js';

	const name = $derived(page.params.name!);
	const width = $derived(parsePreviewDimension(page.url.searchParams.get('w'), PREVIEW_WIDTH));
	const height = $derived(parsePreviewDimension(page.url.searchParams.get('h'), PREVIEW_HEIGHT));

	type PreviewLoadState =
		| { status: 'loading'; name: string; retryToken: number }
		| {
				status: 'ready';
				name: string;
				retryToken: number;
				component: Component<Record<string, never>>;
		  }
		| { status: 'missing'; name: string; retryToken: number }
		| { status: 'failed'; name: string; retryToken: number };

	let retryToken = $state(0);
	let loadState = $state<PreviewLoadState | null>(null);

	$effect(() => {
		const current = name;
		const currentRetryToken = retryToken;
		const loader = getRegistryComponent(current);
		loadState = loader
			? { status: 'loading', name: current, retryToken: currentRetryToken }
			: { status: 'missing', name: current, retryToken: currentRetryToken };
		if (!loader) {
			return;
		}

		let cancelled = false;
		const isCurrentRequest = () => name === current && retryToken === currentRetryToken;
		loader()
			.then((module) => {
				if (!cancelled && isCurrentRequest()) {
					loadState = {
						status: 'ready',
						name: current,
						retryToken: currentRetryToken,
						component: module.default
					};
				}
			})
			.catch(() => {
				if (!cancelled && isCurrentRequest()) {
					loadState = { status: 'failed', name: current, retryToken: currentRetryToken };
				}
			});

		return () => {
			cancelled = true;
		};
	});

	const currentState = $derived(
		loadState?.name === name && loadState.retryToken === retryToken ? loadState : null
	);
	const Preview = $derived(currentState?.status === 'ready' ? currentState.component : null);
	const previewError = $derived(
		currentState?.status === 'missing' || currentState?.status === 'failed'
			? currentState.status
			: undefined
	);
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
	behaves the same way, and its docs card never grows.
-->
<div class="flex min-h-dvh w-full items-center justify-center bg-sidebar p-1">
	<div
		class={cn('w-full overflow-hidden rounded-[5px] border bg-background')}
		style:max-width={`${width}px`}
	>
		<div
			class="flex w-full items-center justify-center overflow-y-auto"
			style:height={`${height}px`}
		>
			<div
				class="no-scrollbar h-full w-full [&>svg]:select-none"
				data-slot="preview"
				data-preview-ready={Preview ? 'true' : undefined}
				data-preview-error={previewError}
			>
				{#if Preview}
					<Preview />
				{:else if currentState?.status === 'missing'}
					<p
						role="alert"
						class="flex size-full items-center justify-center text-[13px] text-muted-foreground"
					>
						Component <code
							class="relative mx-1 rounded-md border bg-background px-[0.3rem] py-1 font-mono text-[0.75rem] text-red-500 outline-none"
							>{name}</code
						> not found in registry.
					</p>
				{:else if currentState?.status === 'failed'}
					<div
						role="alert"
						class="flex size-full flex-col items-center justify-center gap-3 text-[13px] text-muted-foreground"
					>
						<p>
							Component <code
								class="relative mx-1 rounded-md border bg-background px-[0.3rem] py-1 font-mono text-[0.75rem] text-red-500 outline-none"
								>{name}</code
							>
							could not be loaded.
						</p>
						<button
							type="button"
							class="rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
							onclick={() => (retryToken += 1)}>Try again</button
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
