<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/ui/button.tsx`.
	 *
	 * The reference renders Base UI's `<Button>` primitive, which is a plain `<button>` plus a
	 * `render` escape hatch for rendering as another element. Here that escape hatch is the
	 * `child` snippet — the shadcn-svelte convention — and `href` renders an `<a>`, which is what
	 * every `render={<a …/>}` call site in the reference does.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { buttonVariants, type ButtonSize, type ButtonVariant } from './button-variants.js';

	type Props = {
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		href?: string;
		children?: Snippet;
		/** Renders the button's classes onto caller-supplied markup instead of a `<button>`. */
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		ref?: HTMLElement | null;
	} & Omit<HTMLButtonAttributes, 'class' | 'children'> &
		Omit<HTMLAnchorAttributes, 'class' | 'children'>;

	let {
		variant = 'default',
		size = 'default',
		class: className,
		href,
		children,
		child,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const attrs = $derived({
		'data-slot': 'button',
		'data-variant': variant,
		'data-size': size,
		class: cn(buttonVariants({ variant, size }), className),
		...rest
	});
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs here come from content or
     props: in-page anchors, docs routes and external links, none of which `resolve()` covers. -->

{#if child}
	{@render child({ props: { ...attrs, href } })}
{:else if href}
	<a bind:this={ref} {href} {...attrs}>{@render children?.()}</a>
{:else}
	<button bind:this={ref} type={rest.type ?? 'button'} {...attrs}>{@render children?.()}</button>
{/if}
