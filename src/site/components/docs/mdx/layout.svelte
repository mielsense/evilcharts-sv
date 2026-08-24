<script lang="ts">
	/**
	 * The layout every `.md` page is compiled into.
	 *
	 * Fumadocs supplies its MDX component map through a provider; mdsvex has no such hook, so the
	 * map is injected as context here and the markdown's bare tags are resolved by
	 * `mdx/index.ts`.
	 */
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
