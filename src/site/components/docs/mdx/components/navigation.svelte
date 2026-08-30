<script lang="ts">
	/** `MDXNavigation` from `evilcharts/src/components/docs/mdx/components/navigation.tsx`. */
	import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { cn } from '$site/lib/utils.js';

	let {
		type,
		title,
		description,
		url
	}: {
		type: 'previous' | 'next';
		title: string;
		description?: string;
		url: string;
	} = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

<a href={url}>
	<div
		class={cn(
			'group flex cursor-pointer rounded-md bg-[#F5F5F5] p-[2px] text-muted-foreground dark:bg-primary-foreground',
			type === 'previous' ? 'flex-row-reverse' : 'flex-row'
		)}
	>
		<div
			class="flex flex-1 flex-col gap-0.5 rounded-md border bg-background p-3 duration-200 group-hover:border-primary/20"
		>
			<span class="line-clamp-1 text-[13px] capitalize duration-200 group-hover:text-primary">
				{title}
			</span>
			<span class="line-clamp-1 text-xs text-muted-foreground/70">{description}</span>
		</div>
		<div class="flex items-center duration-200 group-hover:text-primary sm:px-2">
			{#if type === 'previous'}
				<HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} aria-hidden="true" class="size-5" />
			{:else}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					strokeWidth={1.5}
					aria-hidden="true"
					class="size-5"
				/>
			{/if}
		</div>
	</div>
</a>
