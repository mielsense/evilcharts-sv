<script lang="ts">
	/** `CardShell` from `evilcharts/src/components/landing/chart-stage.tsx`. */
	import type { Snippet } from 'svelte';
	import LanguageIcon from '$site/assets/language/language-icon.svelte';

	let { title, children }: { title: string; children?: Snippet } = $props();
</script>

<div class="flex h-full w-full flex-col rounded-[8px] bg-[#F5F5F5] p-1 dark:bg-primary-foreground">
	<div class="flex h-7 shrink-0 items-center px-2">
		<span
			class="flex items-center gap-1.5 font-mono text-xs text-muted-foreground dark:text-muted-foreground/80 [&_svg]:size-3.5"
		>
			<LanguageIcon language="component" />
			<span class="line-clamp-1">{title}</span>
		</span>
	</div>
	<div class="min-h-0 flex-1 overflow-hidden rounded-[5px] border bg-background">
		{@render children?.()}
	</div>
</div>
