<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { untrack } from 'svelte';
	import DitherCanvas from './dither-canvas.svelte';
	import {
		clipDitherReveal,
		collectDitherDomMarks,
		resolveDitherSeriesColors
	} from './dom-marks.js';
	import { paintDitherStroke, paintDitherVariantPath } from './paint.js';
	import type { DitherBloom, DitherCanvasFrame, DitherRevision, DitherVariant } from './types.js';

	type Props = {
		ditherVariant?: DitherVariant;
		cellSize?: number;
		bloom?: DitherBloom;
		paused?: boolean;
		animate?: boolean;
		animationDuration?: number;
		animationRevision?: DitherRevision;
	};

	let {
		ditherVariant = 'gradient',
		cellSize = 2,
		bloom = 'off',
		paused = false,
		animate = true,
		animationDuration = 1000,
		animationRevision
	}: Props = $props();

	let chartRoot: Element | undefined;
	let domRevision = $state(0);
	let transitionRevision = $state(0);
	let scratch: HTMLCanvasElement | undefined;

	const watchMarks: Attachment<HTMLDivElement> = (node) => {
		const root = node.closest('.lc-root-container') ?? node.parentElement;
		if (!root) return;
		untrack(() => {
			chartRoot = root;
			domRevision += 1;
		});

		const observer = new MutationObserver((mutations) => {
			let changed = false;
			let opacityChanged = false;
			for (const mutation of mutations) {
				if (mutation.target instanceof HTMLCanvasElement) continue;
				changed = true;
				if (
					mutation.attributeName === 'opacity' ||
					mutation.attributeName === 'fill-opacity' ||
					mutation.attributeName === 'stroke-opacity'
				) {
					opacityChanged = true;
				}
			}
			if (changed) domRevision += 1;
			if (opacityChanged) transitionRevision += 1;
		});
		observer.observe(root, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [
				'd',
				'x',
				'y',
				'width',
				'height',
				'transform',
				'style',
				'opacity',
				'fill-opacity',
				'stroke-opacity',
				'stroke-dasharray',
				'stroke-dashoffset',
				'data-evil-dither-mark',
				'data-evil-dither-key',
				'data-evil-dither-variant',
				'data-evil-dither-reveal',
				'data-evil-dither-glow'
			]
		});

		return () => {
			observer.disconnect();
			untrack(() => {
				if (chartRoot === root) chartRoot = undefined;
			});
		};
	};

	function bloomPixels(value: DitherBloom): number {
		if (value === 'low') return 4;
		if (value === 'high') return 9;
		if (value === 'aura') return 16;
		return 0;
	}

	function paintMarks(frame: DitherCanvasFrame, context: CanvasRenderingContext2D) {
		if (!chartRoot) return false;
		const marks = collectDitherDomMarks(chartRoot, frame.canvas, ditherVariant);
		let hasGlow = false;
		for (const mark of marks) {
			const colors = resolveDitherSeriesColors(frame, mark.key);
			if (colors.length === 0 || mark.opacity <= 0) continue;
			hasGlow ||= mark.glow;
			context.save();
			clipDitherReveal(context, mark.bounds, mark.reveal, frame.progress);
			if (mark.kind === 'stroke') {
				paintDitherStroke(context, mark.path, {
					colors,
					lineWidth: Math.max(mark.lineWidth, cellSize),
					cellSize,
					opacity: mark.opacity,
					dash: mark.dash,
					dashOffset: mark.dashOffset
				});
			} else {
				paintDitherVariantPath(context, mark.path, mark.bounds, {
					colors,
					variant: mark.variant,
					cellSize,
					opacity: mark.opacity,
					reverse: mark.reverse
				});
			}
			context.restore();
		}
		return hasGlow;
	}

	function paint(frame: DitherCanvasFrame) {
		scratch ??= document.createElement('canvas');
		if (scratch.width !== frame.backingWidth) scratch.width = frame.backingWidth;
		if (scratch.height !== frame.backingHeight) scratch.height = frame.backingHeight;
		const scratchContext = scratch.getContext('2d');
		if (!scratchContext) return;
		scratchContext.setTransform(frame.scaleX, 0, 0, frame.scaleY, 0, 0);
		scratchContext.clearRect(0, 0, frame.width, frame.height);
		const hasGlow = paintMarks(frame, scratchContext);

		const blur = Math.max(bloomPixels(bloom), hasGlow ? 4 : 0);
		frame.context.save();
		frame.context.setTransform(1, 0, 0, 1, 0, 0);
		if (blur > 0) {
			frame.context.filter = `blur(${Math.round(blur * frame.scaleX)}px)`;
			frame.context.globalAlpha = bloom === 'aura' ? 0.6 : 0.4;
			frame.context.drawImage(scratch, 0, 0);
		}
		frame.context.filter = 'none';
		frame.context.globalAlpha = 1;
		frame.context.drawImage(scratch, 0, 0);
		frame.context.restore();
	}
</script>

<div
	{@attach watchMarks}
	class="pointer-events-none absolute inset-0"
	style="position: absolute; inset: 0; pointer-events: none;"
>
	<DitherCanvas
		{paint}
		dataRevision={domRevision}
		selectionRevision={domRevision}
		hoverRevision={domRevision}
		{transitionRevision}
		{animationRevision}
		{animate}
		{animationDuration}
		{paused}
	/>
</div>
