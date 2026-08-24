<script lang="ts">
	// ─── Brush Handle ───────────────────────────────────────────────────────────
	import { motion } from '@humanspeak/svelte-motion';
	import type { MotionValue } from '@humanspeak/svelte-motion';
	import { cn } from '$lib/utils.js';
	import type { BrushDragHandlers } from './use-brush-drag.svelte.js';

	let {
		side,
		position,
		label,
		bind,
		value,
		min,
		max,
		onkeydown
	}: {
		side: 'left' | 'right';
		position: MotionValue<string>;
		label?: string;
		bind: BrushDragHandlers;
		value: number;
		min: number;
		max: number;
		onkeydown: (event: KeyboardEvent) => void;
	} = $props();

	const isLeft = $derived(side === 'left');
</script>

<motion.div class="absolute inset-y-0 z-10" style={{ left: position }}>
	<div
		class={cn(
			"group absolute inset-y-0 flex w-3 cursor-ew-resize touch-none items-center justify-center after:absolute after:inset-y-0 after:-left-4 after:w-11 after:content-['']",
			isLeft ? '' : '-translate-x-full'
		)}
		role="slider"
		tabindex="0"
		aria-label={`${isLeft ? 'Start' : 'End'} of selected chart range`}
		aria-orientation="horizontal"
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={label ?? String(value)}
		{onkeydown}
		{...bind}
	>
		<div
			class={cn(
				'relative flex h-4 w-1.5 items-center justify-center rounded-md bg-muted-foreground transition-colors group-hover:bg-foreground',
				isLeft ? '-left-[5.5px]' : '-right-[5.5px]'
			)}
		>
			<div class="flex flex-col gap-[2px]">
				<div class="h-[2px] w-[2px] rounded-full bg-background/70"></div>
				<div class="h-[2px] w-[2px] rounded-full bg-background/70"></div>
				<div class="h-[2px] w-[2px] rounded-full bg-background/70"></div>
			</div>
		</div>
	</div>

	{#if label}
		<div
			class={cn(
				'pointer-events-none absolute -bottom-3 -translate-y-1/2 rounded-[3px] bg-foreground px-1 py-px text-[8px] leading-tight font-medium whitespace-nowrap text-background opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
				isLeft ? 'left-1.5' : 'right-1.5'
			)}
		>
			{label}
		</div>
	{/if}
</motion.div>
