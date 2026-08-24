<script lang="ts">
	/**
	 * `MDXImage` from `evilcharts/src/components/docs/mdx/components/image.tsx`.
	 *
	 * `next/image` becomes a plain `<img>` with the same classes; `width`/`height` stay explicit so
	 * the layout does not shift.
	 */
	import type { HTMLImgAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';

	let {
		src = '',
		class: className,
		width,
		height,
		alt = '',
		...rest
	}: { class?: string } & Omit<HTMLImgAttributes, 'class'> = $props();
</script>

<img
	class={cn('mt-6 rounded-md border', className)}
	{src}
	width={width === undefined ? undefined : Number(width)}
	height={height === undefined ? undefined : Number(height)}
	{alt}
	{...rest}
/>
