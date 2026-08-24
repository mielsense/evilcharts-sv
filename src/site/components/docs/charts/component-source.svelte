<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/docs/charts/component-source.tsx`.
	 *
	 * This Svelte source viewer differs from the reference in two ways:
	 *
	 * - File metadata arrives from `/api/source/[name]`, then the active file is fetched from the
	 *   prerendered `/api/source-file/[name]/[index]` route. Both responses are cached in the browser,
	 *   so tabs load on demand and repeated documentation pages reuse the same payload.
	 * - An item here is a *directory* of components where the reference is one `.tsx`, so a
	 *   multi-file item gets one tab per file instead of only showing `files[0]`.
	 *
	 * The reference's `src` prop (read an arbitrary path) is dropped: no docs page uses it.
	 */
	import { Tabs, TabsList, TabsPanel, TabsTab } from '$site/components/ui/tabs/index.js';
	import { cn } from '$site/lib/utils.js';
	import CodeBlock from '$site/components/docs/mdx/components/code-block.svelte';
	import CodeCollapsibleWrapper from './code-collapsible-wrapper.svelte';
	import {
		loadSourceFile,
		loadSourceMetadata,
		type SourceFile,
		type SourceFileMeta
	} from './component-source-cache.js';

	let {
		name,
		title,
		language,
		collapsible = true,
		class: className
	}: {
		name?: string;
		title?: string;
		language?: string;
		collapsible?: boolean;
		class?: string;
	} = $props();

	let files = $state<SourceFileMeta[] | null>(null);
	let loadedFiles = $state<Record<string, SourceFile>>({});
	let failed = $state(false);
	const active = $state({ value: '' });

	$effect(() => {
		if (!name) return;
		let cancelled = false;
		failed = false;
		files = null;

		loadSourceMetadata(name)
			.then((data) => {
				if (!cancelled) {
					files = data.files;
					if (!data.files.some((file) => file.path === active.value)) {
						active.value = data.files[0]?.path ?? '';
					}
				}
			})
			.catch(() => {
				if (!cancelled) failed = true;
			});

		return () => {
			cancelled = true;
		};
	});

	const selectedMeta = $derived(files?.find((file) => file.path === active.value));

	$effect(() => {
		const selected = selectedMeta;
		if (!selected || loadedFiles[selected.url]) return;
		let cancelled = false;
		failed = false;

		loadSourceFile(selected.url)
			.then((file) => {
				if (!cancelled) loadedFiles = { ...loadedFiles, [selected.url]: file };
			})
			.catch(() => {
				if (!cancelled) failed = true;
			});

		return () => {
			cancelled = true;
		};
	});

	/** A single-file item keeps the reference's behaviour exactly: no tabs, the given title. */
	const singleMeta = $derived(files?.length === 1 ? files[0] : undefined);
	const single = $derived(singleMeta ? loadedFiles[singleMeta.url] : undefined);
	const singleLanguage = $derived(
		language ?? title?.split('.').pop() ?? singleMeta?.language ?? 'svelte'
	);

	/** Tab labels are the file's path inside the item, which is what the reference's titles name. */
	$effect(() => {
		if (files?.length && !files.some((file) => file.path === active.value)) {
			active.value = files[0].path;
		}
	});
</script>

{#if !name}
	<!-- The reference returns null when given neither `name` nor `src`. -->
{:else if failed}
	<p class="mt-4 text-[13px] leading-6 text-muted-foreground">
		Source for <code
			class="relative mx-1 rounded-md border bg-background px-[0.3rem] py-1 font-mono text-[0.75rem] text-red-500 outline-none"
			>{name}</code
		> could not be loaded.
	</p>
{:else if !files || (files.length === 1 && !single)}
	<!-- Same height as a collapsed block, so the tab does not jump when the source lands. -->
	<div
		class={cn(
			'mt-4 h-64 w-full animate-pulse rounded-[8px] bg-muted/40 motion-reduce:animate-none',
			className
		)}
	></div>
{:else if single}
	{#if collapsible}
		<CodeCollapsibleWrapper class={className}>
			<CodeBlock
				withWrapper
				code={single.code}
				html={single.html}
				language={singleLanguage}
				{title}
			/>
		</CodeCollapsibleWrapper>
	{:else}
		<div class={cn('relative', className)}>
			<CodeBlock code={single.code} html={single.html} language={singleLanguage} {title} />
		</div>
	{/if}
{:else}
	<Tabs
		class={cn('relative', className)}
		value={active.value}
		onValueChange={(value) => (active.value = value)}
	>
		<div class="flex flex-col rounded-[8px] bg-[#F5F5F5] p-1 dark:bg-primary-foreground">
			<TabsList variant="underline" class="max-w-full overflow-x-auto">
				{#each files as file (file.path)}
					<TabsTab class="h-5! px-1.5 hover:bg-transparent!" value={file.path}>
						{file.path}
					</TabsTab>
				{/each}
			</TabsList>
			{#each files as file (file.path)}
				<TabsPanel value={file.path}>
					{#if loadedFiles[file.url]}
						{const source = loadedFiles[file.url]}
						<CodeBlock
							code={source.code}
							html={source.html}
							language={source.language}
							title={source.target ?? source.path}
							class="rounded-md border bg-background"
						/>
					{:else}
						<div
							class="h-64 w-full animate-pulse rounded-md bg-muted/40 motion-reduce:animate-none"
						></div>
					{/if}
				</TabsPanel>
			{/each}
		</div>
	</Tabs>
{/if}
