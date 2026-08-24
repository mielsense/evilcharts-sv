<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/docs/charts/component-source.tsx`.
	 *
	 * Two differences, both recorded in plans/DEVIATIONS.md D-3:
	 *
	 * - The source arrives from `/api/source/[name]` rather than being read and highlighted inline,
	 *   because a Svelte component cannot await. The route is prerendered, so the built site serves
	 *   it as a static file.
	 * - An item here is a *directory* of components where the reference is one `.tsx`, so a
	 *   multi-file item gets one tab per file instead of only showing `files[0]`.
	 *
	 * The reference's `src` prop (read an arbitrary path) is dropped: no docs page uses it.
	 */
	import { Tabs, TabsList, TabsPanel, TabsTab } from '$site/components/ui/tabs/index.js';
	import { cn } from '$site/lib/utils.js';
	import CodeBlock from '$site/components/docs/mdx/components/code-block.svelte';
	import CodeCollapsibleWrapper from './code-collapsible-wrapper.svelte';

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

	type SourceFile = {
		path: string;
		target?: string;
		language: string;
		code: string;
		html: string;
	};

	let files = $state<SourceFile[] | null>(null);
	let failed = $state(false);

	$effect(() => {
		if (!name) return;
		let cancelled = false;
		failed = false;
		files = null;

		fetch(`/api/source/${name}`)
			.then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
			.then((data: { files: SourceFile[] }) => {
				if (!cancelled) files = data.files;
			})
			.catch(() => {
				if (!cancelled) failed = true;
			});

		return () => {
			cancelled = true;
		};
	});

	/** A single-file item keeps the reference's behaviour exactly: no tabs, the given title. */
	const single = $derived(files?.length === 1 ? files[0] : undefined);
	const singleLanguage = $derived(
		language ?? title?.split('.').pop() ?? single?.language ?? 'svelte'
	);

	/** Tab labels are the file's path inside the item, which is what the reference's titles name. */
	const active = $state({ value: '' });
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
{:else if !files}
	<!-- Same height as a collapsed block, so the tab does not jump when the source lands. -->
	<div class={cn('mt-4 h-64 w-full animate-pulse rounded-[8px] bg-muted/40', className)}></div>
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
					<CodeBlock
						code={file.code}
						html={file.html}
						language={file.language}
						title={file.target ?? file.path}
						class="rounded-md border bg-background"
					/>
				</TabsPanel>
			{/each}
		</div>
	</Tabs>
{/if}
