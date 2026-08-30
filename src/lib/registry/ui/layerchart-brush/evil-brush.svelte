<script lang="ts">
	// ─── EvilBrush ────────────────────────────────────────────────────────────
	import {
		motion,
		useMotionValue,
		useMotionValueEvent,
		useReducedMotion,
		useSpring,
		useTransform
	} from '@humanspeak/svelte-motion';
	import { onDestroy, untrack } from 'svelte';
	import { cn } from '$lib/utils.js';
	import ChartStyle from '../layerchart-chart/chart-style.svelte';
	import BrushHandle from './brush-handle.svelte';
	import MiniChart from './mini-chart.svelte';
	import { BrushDrag } from './use-brush-drag.svelte.js';
	import { clampRange, panRange } from './clamp.js';
	import {
		SPRING_CONFIG,
		type DragType,
		type EvilBrushProps,
		type EvilBrushRange
	} from './types.js';

	let {
		data,
		chartConfig,
		dataKeys,
		xDataKey,
		variant = 'area',
		height = 56,
		class: className,
		stacked = false,
		strokeVariant = 'solid',
		connectNulls = false,
		barRadius,
		startIndex: controlledStart,
		endIndex: controlledEnd,
		defaultStartIndex = 0,
		defaultEndIndex,
		onChange,
		formatLabel,
		curveType = 'monotone',
		minSpan = 2,
		showLabels = true,
		skipStyle = false
	}: EvilBrushProps = $props();

	let containerRef = $state<HTMLDivElement>();
	// @humanspeak/svelte-motion writes `ref` back into the props proxy, which throws unless the caller
	// binds it.
	const keys = $derived(dataKeys ?? Object.keys(chartConfig));
	const totalPoints = $derived(data.length);
	const chartId = $props.id();
	const shouldReduceMotion = useReducedMotion();

	// ── Controlled vs uncontrolled ──────────────────────────────────────────

	const isControlled = $derived(controlledStart !== undefined && controlledEnd !== undefined);

	// `untrack` marks these reads as deliberate one-time initialisation, mirroring the
	// reference's `useState(() => …)` initialiser.
	let internalRange = $state<EvilBrushRange>(
		untrack(() => ({
			startIndex: Math.max(0, Math.min(defaultStartIndex, data.length - 1)),
			endIndex: Math.max(0, Math.min(defaultEndIndex ?? data.length - 1, data.length - 1))
		}))
	);

	// Track the last committed range to avoid duplicate updates when small
	// mouse movements don't produce index changes (e.g., at boundaries)
	let lastCommitted: EvilBrushRange = untrack(() => ({ ...internalRange }));

	// Shrink the range when the dataset shrinks. The reference's `useEffect` only re-runs when
	// `totalPoints` changes; Svelte effects re-run on every dependency, so this must not write
	// unconditionally — assigning a fresh object every pass would loop forever.
	$effect(() => {
		if (isControlled) return;
		const max = Math.max(0, totalPoints - 1);
		const startIndex = Math.min(internalRange.startIndex, max);
		const endIndex = Math.min(internalRange.endIndex, max);
		if (startIndex === internalRange.startIndex && endIndex === internalRange.endIndex) return;
		const adjusted = { startIndex, endIndex };
		lastCommitted = adjusted;
		internalRange = adjusted;
	});

	// ── Clamping & committing ───────────────────────────────────────────────

	function commit(next: EvilBrushRange, mode?: DragType) {
		const clamped = clampRange(next, { totalPoints, minSpan, mode });

		// Only update if the range has actually changed — avoids unnecessary
		// re-renders when the brush is at a boundary and small mouse movements
		// don't produce index changes
		if (
			lastCommitted.startIndex === clamped.startIndex &&
			lastCommitted.endIndex === clamped.endIndex
		) {
			return;
		}

		lastCommitted = clamped;
		internalRange = clamped;
		// The reference defers this with React.startTransition; Svelte's fine-grained
		// updates make the extra scheduling unnecessary.
		onChange?.(clamped);
	}

	function handleKey(event: KeyboardEvent, mode: DragType) {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();

		const max = Math.max(0, totalPoints - 1);
		if (mode === 'middle') {
			const delta =
				event.key === 'ArrowLeft'
					? -1
					: event.key === 'ArrowRight'
						? 1
						: event.key === 'Home'
							? -range.startIndex
							: max - range.endIndex;
			commit(panRange(range, delta, totalPoints), 'middle');
			return;
		}

		if (mode === 'left') {
			const startIndex =
				event.key === 'Home'
					? 0
					: event.key === 'End'
						? range.endIndex - minSpan
						: range.startIndex + (event.key === 'ArrowLeft' ? -1 : 1);
			commit({ startIndex, endIndex: range.endIndex }, 'left');
			return;
		}

		const endIndex =
			event.key === 'Home'
				? range.startIndex + minSpan
				: event.key === 'End'
					? max
					: range.endIndex + (event.key === 'ArrowLeft' ? -1 : 1);
		commit({ startIndex: range.startIndex, endIndex }, 'right');
	}

	// ── Drag ────────────────────────────────────────────────────────────────

	const drag = new BrushDrag({
		range: () => internalRange,
		totalPoints: () => totalPoints,
		container: () => containerRef,
		commit
	});

	// Position always driven by internalRange (never lags behind controlled props)
	const range = $derived(internalRange);
	const maximumWindowStart = $derived(
		Math.max(0, totalPoints - 1 - Math.max(0, range.endIndex - range.startIndex))
	);

	// Sync internalRange with controlled props when not dragging
	$effect(() => {
		if (!isControlled || drag.isDragging) return;
		if (controlledStart === internalRange.startIndex && controlledEnd === internalRange.endIndex) {
			return;
		}
		const synced = { startIndex: controlledStart!, endIndex: controlledEnd! };
		lastCommitted = synced;
		internalRange = synced;
	});

	// ── Computed positions (%) ──────────────────────────────────────────────

	const leftPct = $derived(totalPoints > 1 ? (range.startIndex / (totalPoints - 1)) * 100 : 0);
	const rightPct = $derived(totalPoints > 1 ? (range.endIndex / (totalPoints - 1)) * 100 : 100);

	// Drive all moving brush UI from the same springed edge values.
	const leftTarget = useMotionValue(untrack(() => leftPct));
	const rightTarget = useMotionValue(untrack(() => rightPct));
	$effect.pre(() => {
		if (leftTarget.get() !== leftPct) leftTarget.set(leftPct);
		if (rightTarget.get() !== rightPct) rightTarget.set(rightPct);
	});

	const leftSpring = useSpring(leftTarget, SPRING_CONFIG);
	const rightSpring = useSpring(rightTarget, SPRING_CONFIG);
	const leftSpringPosition = useTransform(leftSpring, (v) => `${v}%`);
	const rightSpringPosition = useTransform(rightSpring, (v) => `${v}%`);
	const leftDirectPosition = useTransform(leftTarget, (v) => `${v}%`);
	const rightDirectPosition = useTransform(rightTarget, (v) => `${v}%`);
	const leftSpringOverlayWidth = useTransform(leftSpring, (v) => `${v}%`);
	const rightSpringOverlayWidth = useTransform(
		rightSpring,
		(v) => `${Math.max(0, 100 - Number(v))}%`
	);
	const leftDirectOverlayWidth = useMotionValue(untrack(() => `${leftPct}%`));
	const rightDirectOverlayWidth = useMotionValue(untrack(() => `${Math.max(0, 100 - rightPct)}%`));
	const animatedSelectedWidth = useMotionValue(
		untrack(() => `${Math.max(0, rightPct - leftPct)}%`)
	);
	const directSelectedWidth = useMotionValue(untrack(() => `${Math.max(0, rightPct - leftPct)}%`));
	const leftPosition = $derived(
		shouldReduceMotion.current ? leftDirectPosition : leftSpringPosition
	);
	const rightPosition = $derived(
		shouldReduceMotion.current ? rightDirectPosition : rightSpringPosition
	);
	const leftOverlayWidth = $derived(
		shouldReduceMotion.current ? leftDirectOverlayWidth : leftSpringOverlayWidth
	);
	const rightOverlayWidth = $derived(
		shouldReduceMotion.current ? rightDirectOverlayWidth : rightSpringOverlayWidth
	);
	const selectedWidth = $derived(
		shouldReduceMotion.current ? directSelectedWidth : animatedSelectedWidth
	);

	function updateSelectedWidth() {
		animatedSelectedWidth.set(
			`${Math.max(0, Number(rightSpring.get()) - Number(leftSpring.get()))}%`
		);
	}

	const stopLeftWidthSync = useMotionValueEvent(leftSpring, 'change', updateSelectedWidth);
	const stopRightWidthSync = useMotionValueEvent(rightSpring, 'change', updateSelectedWidth);
	onDestroy(() => {
		stopLeftWidthSync();
		stopRightWidthSync();
	});
	$effect.pre(() => {
		directSelectedWidth.set(`${Math.max(0, rightPct - leftPct)}%`);
		leftDirectOverlayWidth.set(`${leftPct}%`);
		rightDirectOverlayWidth.set(`${Math.max(0, 100 - rightPct)}%`);
	});

	function getLabel(idx: number) {
		if (!xDataKey) return String(idx);
		const v = data[idx]?.[xDataKey];
		return formatLabel ? formatLabel(v, idx) : String(v ?? idx);
	}
</script>

<!-- ── Render ────────────────────────────────────────────────────────────── -->
{#if totalPoints !== 0}
	<div
		bind:this={containerRef}
		data-slot="brush"
		data-chart={skipStyle ? undefined : chartId}
		class={cn('group relative select-none', className)}
		style:height={`${height}px`}
	>
		{#if !skipStyle}
			<ChartStyle id={chartId} config={chartConfig} />
		{/if}

		<!-- Mini chart – always shows all data -->
		<div class="absolute inset-0 overflow-hidden rounded-md">
			<MiniChart
				{data}
				{keys}
				{chartConfig}
				{variant}
				{curveType}
				{chartId}
				{stacked}
				strokeVariant={strokeVariant === 'animated-dashed' ? 'dashed' : strokeVariant}
				{connectNulls}
				{barRadius}
			/>
		</div>

		<!-- Dim overlay – left -->
		<motion.div
			class="pointer-events-none absolute inset-y-0 left-0 rounded-l-md bg-background/70 backdrop-blur-[2px]"
			style={{ width: leftOverlayWidth }}
		/>
		<!-- Dim overlay – right -->
		<motion.div
			class="pointer-events-none absolute inset-y-0 right-0 rounded-r-md bg-background/70 backdrop-blur-[2px]"
			style={{ width: rightOverlayWidth }}
		/>

		<!-- Selected region – draggable to pan -->
		<motion.div
			class="absolute inset-y-0 cursor-grab touch-none rounded-sm border active:cursor-grabbing"
			style={{ left: leftPosition, width: selectedWidth }}
			role="slider"
			tabindex="0"
			aria-label="Selected chart range"
			aria-orientation="horizontal"
			aria-valuemin="0"
			aria-valuemax={maximumWindowStart}
			aria-valuenow={range.startIndex}
			aria-valuetext={`${getLabel(range.startIndex)} to ${getLabel(range.endIndex)}`}
			onkeydown={(event: KeyboardEvent) => handleKey(event, 'middle')}
			{...drag.bind('middle')}
		/>

		<!-- Left handle -->
		<BrushHandle
			side="left"
			position={leftPosition}
			label={showLabels ? getLabel(range.startIndex) : undefined}
			value={range.startIndex}
			min={0}
			max={Math.max(0, range.endIndex - minSpan)}
			onkeydown={(event) => handleKey(event, 'left')}
			bind={drag.bind('left')}
		/>

		<!-- Right handle -->
		<BrushHandle
			side="right"
			position={rightPosition}
			label={showLabels ? getLabel(range.endIndex) : undefined}
			value={range.endIndex}
			min={Math.min(Math.max(0, totalPoints - 1), range.startIndex + minSpan)}
			max={Math.max(0, totalPoints - 1)}
			onkeydown={(event) => handleKey(event, 'right')}
			bind={drag.bind('right')}
		/>
	</div>
{/if}
