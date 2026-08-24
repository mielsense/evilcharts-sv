<script lang="ts">
	/**
	 * Ported from `evilcharts/src/components/ui/tabs.tsx` (Base UI `Tabs.Root`). Class strings and
	 * `data-slot` values are verbatim; the state lives in `tabs-context.svelte.ts`.
	 */
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { setTabsContext, TabsState, type TabsOrientation } from './tabs-context.svelte.js';

	let {
		class: className,
		value,
		defaultValue,
		onValueChange,
		orientation = 'horizontal',
		children,
		...rest
	}: {
		class?: string;
		/** Controlled value. Omit for an uncontrolled tab set seeded by `defaultValue`. */
		value?: string;
		defaultValue?: string;
		onValueChange?: (value: string) => void;
		orientation?: TabsOrientation;
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> = $props();

	const state = setTabsContext(new TabsState());
	// Seeded once, then kept in step below. `untrack` because reading a prop here would only ever
	// capture its initial value anyway, and the effects are what track it.
	state.value = untrack(() => value ?? defaultValue ?? '');

	// A controlled `value` wins on every change, as it does in the reference.
	$effect.pre(() => {
		if (value !== undefined) state.value = value;
	});
	$effect.pre(() => {
		state.onValueChange = onValueChange;
		state.orientation = orientation;
	});
</script>

<div
	class={cn('flex flex-col gap-2 data-[orientation=vertical]:flex-row', className)}
	data-slot="tabs"
	data-orientation={orientation}
	{...rest}
>
	{@render children?.()}
</div>
