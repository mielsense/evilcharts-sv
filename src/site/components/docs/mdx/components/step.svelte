<script lang="ts">
	/**
	 * `Step` from `evilcharts/src/components/docs/mdx/components/steps.tsx`, plus the connector
	 * `<div>` and positioning wrapper its parent adds by cloning. See `steps-context.svelte.ts`.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$site/lib/utils.js';
	import { useSteps } from './steps-context.svelte.js';

	let {
		class: className,
		children,
		...rest
	}: { class?: string; children?: Snippet } & Omit<
		HTMLAttributes<HTMLDivElement>,
		'class' | 'children'
	> = $props();

	const steps = useSteps();
	const id = $props.id();

	$effect.pre(() => {
		steps?.register(id);
		return () => steps?.unregister(id);
	});

	const index = $derived(steps ? steps.indexOf(id) : 0);
	const stepNumber = $derived(index + 1);
	const isLastStep = $derived(steps ? index === steps.count - 1 : true);
</script>

<div class="relative">
	<div
		class={cn(
			'absolute top-[26px] left-[12px] h-full w-px bg-border',
			isLastStep && 'bg-gradient-to-b from-border via-border/50 to-transparent'
		)}
		aria-hidden="true"
	></div>
	<div class={cn('mt-6 pl-9', className, 'relative')} {...rest}>
		<!-- Step number circle -->
		<div
			class="jetbrains absolute top-0.5 left-0 flex size-6 items-center justify-center rounded-md bg-border text-xs text-primary"
		>
			{stepNumber}
		</div>
		<div>{@render children?.()}</div>
	</div>
</div>
