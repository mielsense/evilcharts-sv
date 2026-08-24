<script lang="ts">
	/**
	 * `ChartStage` from `evilcharts/src/components/landing/chart-stage.tsx`.
	 *
	 * The camera arithmetic, the flight easing, the focus cadence and the per-card opacity/scale
	 * springs are the reference's; `motion/react`'s `animate`, `useReducedMotion` and `motion.div`
	 * become their `@humanspeak/svelte-motion` equivalents. The card grid is re-flowed for one
	 * provider — see `chart-stage.svelte.ts`.
	 */
	import { animate, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { untrack, type Component } from 'svelte';
	import { cn } from '$site/lib/utils.js';
	import * as Cards from './cards/index.js';
	import CardShell from './card-shell.svelte';
	import {
		CANVAS_H,
		CANVAS_W,
		CARDS,
		clamp,
		flightDurationFor,
		flightPanEase,
		flightZoomOutFor,
		FOCUS_INTERVAL_MS,
		hopDistance,
		MIN_HOP_DISTANCE,
		shuffled,
		START_INDEX
	} from './chart-stage.svelte.js';

	let { class: className }: { class?: string } = $props();

	const cardComponents = Cards as unknown as Record<string, Component<Record<string, never>>>;

	let viewportEl = $state<HTMLDivElement | null>(null);
	let canvasEl = $state<HTMLDivElement | null>(null);
	let viewport = $state({ w: 0, h: 0 });
	let active = $state(START_INDEX);
	let prevActive = $state(START_INDEX);
	let hovered = $state<number | null>(null);
	let paused = $state(false);
	/*
		False until the first focus change: the camera must render already settled on page load — any
		mount-time tween reads as the camera lurching into place.
	*/
	let engaged = $state(false);

	let queue: number[] = [];
	let lastPick = START_INDEX;
	let shown = START_INDEX;
	let flight: { stop: () => void } | null = null;

	const reducedMotion = useReducedMotion();

	$effect(() => {
		const element = viewportEl;
		if (!element) return;
		const measure = () => (viewport = { w: element.clientWidth, h: element.clientHeight });
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (reducedMotion.current || paused) return;

		const timer = setInterval(() => {
			if (queue.length === 0) queue = shuffled(CARDS.length);

			const current = lastPick;
			// First queued card that is far enough away; when the cycle's tail only holds nearby cards,
			// take the farthest of them instead of stalling.
			let pickAt = queue.findIndex((i) => hopDistance(i, current) >= MIN_HOP_DISTANCE);
			if (pickAt === -1) {
				pickAt = queue.reduce(
					(best, i, k, list) =>
						hopDistance(i, current) > hopDistance(list[best], current) ? k : best,
					0
				);
			}

			const next = queue.splice(pickAt, 1)[0];
			prevActive = current;
			lastPick = next;
			engaged = true;
			active = next;
		}, FOCUS_INTERVAL_MS);

		return () => clearInterval(timer);
	});

	const measured = $derived(viewport.w > 0 && viewport.h > 0);
	const scale = $derived(
		measured ? clamp(0.5, Math.min(viewport.w / 1050, viewport.h / 950), 0.9) : 0.7
	);
	const focus = $derived(CARDS[active]);
	const prevFocus = $derived(CARDS[prevActive]);

	// Estimated flight length, used only for the highlight timing below — the flight itself measures
	// its true start from the live transform.
	const estimatedDistance = $derived(
		Math.hypot(
			(focus.x + focus.w / 2 - prevFocus.x - prevFocus.w / 2) * scale,
			(focus.y + focus.h / 2 - prevFocus.y - prevFocus.h / 2) * scale
		)
	);
	// The incoming card lights up only as the camera descends onto it.
	const focusDelay = $derived(
		!reducedMotion.current && engaged ? flightDurationFor(estimatedDistance) * 0.65 : 0
	);

	$effect.pre(() => {
		const element = canvasEl;
		if (!element || !measured) return;

		const setCamera = (lookX: number, lookY: number, s: number) => {
			element.style.transform = `translate(${viewport.w / 2 - lookX * s}px, ${
				viewport.h / 2 - lookY * s
			}px) scale(${s})`;
		};

		const targetX = focus.x + focus.w / 2;
		const targetY = focus.y + focus.h / 2;

		flight?.stop();

		// `untrack`: the tween reads the live transform and would otherwise restart every frame.
		untrack(() => {
			if (!engaged || reducedMotion.current || shown === active) {
				// First paint, reduced motion, or a viewport resize: settle instantly.
				setCamera(targetX, targetY, scale);
			} else {
				// Recover the current camera from the live transform (the matrix is [s 0 0 s tx ty],
				// because translate is applied before scale).
				const computed = getComputedStyle(element).transform;
				const matrix = computed !== 'none' ? new DOMMatrix(computed) : null;
				const fromScale = matrix ? matrix.a : scale;
				const fromX = matrix ? (viewport.w / 2 - matrix.e) / fromScale : targetX;
				const fromY = matrix ? (viewport.h / 2 - matrix.f) / fromScale : targetY;

				const distance = Math.hypot((targetX - fromX) * scale, (targetY - fromY) * scale);
				const duration = flightDurationFor(distance);
				const zoomDepth = scale * (1 - flightZoomOutFor(distance));

				flight = animate(0, 1, {
					duration,
					ease: 'linear',
					onUpdate: (t: number) => {
						const pan = flightPanEase(t);
						const dip = Math.sin(Math.PI * t) ** 2;
						setCamera(
							fromX + (targetX - fromX) * pan,
							fromY + (targetY - fromY) * pan,
							fromScale + (scale - fromScale) * pan - zoomDepth * dip
						);
					}
				});
			}
			shown = active;
		});
	});
</script>

<div
	bind:this={viewportEl}
	class={cn('relative overflow-hidden', className)}
	role="presentation"
	onpointerenter={() => (paused = true)}
	onpointerleave={() => {
		paused = false;
		hovered = null;
	}}
>
	{#if measured}
		<div
			bind:this={canvasEl}
			class="absolute top-0 left-0 will-change-transform"
			style={`width:${CANVAS_W}px;height:${CANVAS_H}px;transform-origin:0 0`}
		>
			<div
				aria-hidden="true"
				class="absolute -inset-[1600px] bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-[size:26px_26px] opacity-50 will-change-transform"
			></div>
			{#each CARDS as card, index (card.id)}
				{@const isFocused = index === active}
				{@const isLifted = isFocused || (!reducedMotion.current && hovered === index)}
				{@const Card = cardComponents[card.card]}
				<motion.div
					class={cn(
						'absolute rounded-[8px] transition-shadow duration-500',
						isFocused ? 'shadow-2xl' : 'shadow-md'
					)}
					style={{
						left: `${card.x}px`,
						top: `${card.y}px`,
						width: `${card.w}px`,
						height: `${card.h}px`,
						zIndex: isFocused ? 10 : hovered === index ? 5 : 1
					}}
					initial={false}
					animate={{
						opacity: reducedMotion.current || isLifted ? 1 : 0.3,
						scale: !reducedMotion.current && isFocused ? 1.06 : 1
					}}
					transition={{
						opacity: { duration: 0.9, ease: 'easeInOut', delay: isFocused ? focusDelay : 0 },
						scale: {
							type: 'spring',
							stiffness: 170,
							damping: 26,
							delay: isFocused ? focusDelay : 0
						}
					}}
					onpointerenter={() => (hovered = index)}
					onpointerleave={() => {
						if (hovered === index) hovered = null;
					}}
				>
					<CardShell title={card.title}>
						<Card />
					</CardShell>
				</motion.div>
			{/each}
		</div>
	{/if}
</div>
