<script lang="ts">
	/**
	 * `CodeBlock` from `evilcharts/src/components/docs/mdx/components/code.tsx`.
	 *
	 * The reference is an async server component that highlights inline. A Svelte component cannot
	 * await, so the caller passes the already-highlighted `html` — `<ComponentSource>` fetches it
	 * from `/api/source/[name]`, and the markdown's own fences are highlighted at build time by
	 * `mdsvex-highlight.ts`.
	 */
	import LanguageIcon from '$site/assets/language/language-icon.svelte';
	import { cn } from '$site/lib/utils.js';
	import CopyButton from './copy-button.svelte';

	let {
		/** The raw source, for the copy button. Already stripped of `[!code …]` annotations. */
		code,
		/** The highlighted markup for `code`. */
		html,
		language,
		title,
		class: className,
		copyButton = true,
		withWrapper = false,
		wrapperClassName
	}: {
		code: string;
		html: string;
		language: string;
		title?: string;
		class?: string;
		copyButton?: boolean;
		withWrapper?: boolean;
		wrapperClassName?: string;
	} = $props();
</script>

{#if withWrapper}
	<div class={cn('rounded-[10px] bg-[#F5F5F5] p-1 dark:bg-primary-foreground', wrapperClassName)}>
		<div class="flex h-7 justify-between px-1">
			<!--
				Outside a `<figure>`, exactly as the reference lays it out: the caption row sits above
				the frame and the `<figure>` wraps only the code. Kept for class-for-class parity.
			-->
			<!-- svelte-ignore a11y_figcaption_parent -->
			<figcaption
				class="-mt-1 flex items-center gap-1.5 text-xs text-muted-foreground dark:text-muted-foreground/80 [&_svg]:size-3.5"
				data-language={language}
				data-rehype-pretty-code-title=""
			>
				<LanguageIcon {language} />
				<span class="font-mono">{title}</span>
			</figcaption>
			{#if copyButton}
				<CopyButton {code} />
			{/if}
		</div>
		<figure data-rehype-pretty-code-figure="">
			<div class={cn('rounded-md border bg-background', className)}>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time Shiki output -->
				{@html html}
			</div>
		</figure>
	</div>
{:else}
	<figure class="relative" data-rehype-pretty-code-figure="">
		{#if title}
			<figcaption
				class="flex items-center gap-1.5 text-xs text-muted-foreground/50 [&_svg]:size-3.5"
				data-language={language}
				data-rehype-pretty-code-title=""
			>
				<LanguageIcon {language} />
				<span class="font-mono">{title}</span>
			</figcaption>
		{/if}
		{#if copyButton}
			<div class="sticky top-0 z-10 flex h-0 justify-end">
				<CopyButton withBlurBg {code} class="mt-2 mr-2" />
			</div>
		{/if}
		<div class={cn(className)}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time Shiki output -->
			{@html html}
		</div>
	</figure>
{/if}
