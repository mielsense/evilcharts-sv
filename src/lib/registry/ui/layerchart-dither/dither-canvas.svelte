<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import type { HTMLCanvasAttributes } from 'svelte/elements';
	import { getCanvasBackingSize, type CanvasBackingSize } from './backing-size.js';
	import { resolveDitherColor } from './color.js';
	import { createDitherInvalidator, type DitherInvalidator } from './invalidation.js';
	import type { DitherCanvasPainter, DitherRevision } from './types.js';

	type Props = Omit<HTMLCanvasAttributes, 'children' | 'height' | 'width'> & {
		paint: DitherCanvasPainter;
		dataRevision?: DitherRevision;
		selectionRevision?: DitherRevision;
		hoverRevision?: DitherRevision;
		themeRevision?: DitherRevision;
		animationRevision?: DitherRevision;
		transitionRevision?: DitherRevision;
		animate?: boolean;
		animationDuration?: number;
		transitionDuration?: number;
		pixelRatio?: number;
		maxPixelRatio?: number;
		maxPixels?: number;
		paused?: boolean;
		reducedMotion?: boolean;
	};

	let {
		paint,
		dataRevision,
		selectionRevision,
		hoverRevision,
		themeRevision,
		animationRevision,
		transitionRevision,
		animate = true,
		animationDuration = 500,
		transitionDuration = 200,
		pixelRatio,
		maxPixelRatio = 2,
		maxPixels = 16_777_216,
		paused = false,
		reducedMotion,
		class: className,
		...restProps
	}: Props = $props();

	let invalidator = $state.raw<DitherInvalidator>();
	let size: CanvasBackingSize = {
		cssWidth: 0,
		cssHeight: 0,
		width: 0,
		height: 0,
		scaleX: 0,
		scaleY: 0
	};
	let pageVisible = true;
	let intersecting = true;

	function syncPausedState(target = invalidator) {
		target?.setPaused(paused || !pageVisible || !intersecting || size.width === 0);
	}

	$effect(() => {
		void paint;
		void dataRevision;
		invalidator?.invalidate('data');
	});

	$effect(() => {
		void selectionRevision;
		invalidator?.invalidate('selection');
	});

	$effect(() => {
		void hoverRevision;
		invalidator?.invalidate('hover');
	});

	$effect(() => {
		void themeRevision;
		invalidator?.invalidate('theme');
	});

	$effect(() => {
		void animationRevision;
		if (!invalidator) return;
		if (animate) invalidator.startAnimation(animationDuration);
		else invalidator.invalidate('animation');
	});

	$effect(() => {
		void transitionRevision;
		if (!invalidator || transitionRevision === undefined) return;
		if (transitionDuration > 0) invalidator.startAnimation(transitionDuration);
		else invalidator.invalidate('transition');
	});

	$effect(() => {
		invalidator?.setReducedMotion(reducedMotion ?? prefersReducedMotion.current);
	});

	$effect(() => {
		void paused;
		syncPausedState();
	});

	function setupCanvas(canvas: HTMLCanvasElement) {
		const context = canvas.getContext('2d');
		if (!context) return undefined;
		context.imageSmoothingEnabled = false;

		const runtime = createDitherInvalidator({
			frameDriver: {
				request: (callback) => window.requestAnimationFrame(callback),
				cancel: (id) => window.cancelAnimationFrame(id)
			},
			paint: (frame) => {
				if (size.width === 0 || size.height === 0) return;
				context.setTransform(size.scaleX, 0, 0, size.scaleY, 0, 0);
				context.clearRect(0, 0, size.cssWidth, size.cssHeight);
				const styles = getComputedStyle(canvas);
				paint({
					...frame,
					canvas,
					context,
					width: size.cssWidth,
					height: size.cssHeight,
					backingWidth: size.width,
					backingHeight: size.height,
					scaleX: size.scaleX,
					scaleY: size.scaleY,
					resolveColor: (value) =>
						resolveDitherColor(value, (name) => styles.getPropertyValue(name))
				});
			}
		});
		invalidator = runtime;

		const resizeTarget = canvas.parentElement ?? canvas;
		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries.at(-1);
			if (!entry) return;
			const nextSize = getCanvasBackingSize({
				width: entry.contentRect.width,
				height: entry.contentRect.height,
				pixelRatio: pixelRatio ?? window.devicePixelRatio,
				maxPixelRatio,
				maxPixels
			});
			if (
				nextSize.width === size.width &&
				nextSize.height === size.height &&
				nextSize.cssWidth === size.cssWidth &&
				nextSize.cssHeight === size.cssHeight
			) {
				return;
			}

			size = nextSize;
			canvas.width = size.width;
			canvas.height = size.height;
			context.imageSmoothingEnabled = false;
			runtime.invalidate('size');
			syncPausedState(runtime);
		});
		resizeObserver.observe(resizeTarget);

		const intersectionObserver =
			typeof IntersectionObserver === 'undefined'
				? null
				: new IntersectionObserver((entries) => {
						const entry = entries.at(-1);
						if (!entry) return;
						intersecting = entry.isIntersecting;
						runtime.invalidate('visibility');
						syncPausedState(runtime);
					});
		intersectionObserver?.observe(canvas);

		const themeObserver = new MutationObserver(() => runtime.invalidate('theme'));
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class', 'style']
		});
		const themeHost = canvas.closest('[data-chart]');
		if (themeHost && themeHost !== document.documentElement) {
			themeObserver.observe(themeHost, {
				attributes: true,
				attributeFilter: ['class', 'style']
			});
		}

		function onVisibilityChange() {
			pageVisible = !document.hidden;
			runtime.invalidate('visibility');
			syncPausedState(runtime);
		}
		document.addEventListener('visibilitychange', onVisibilityChange);
		pageVisible = !document.hidden;

		return () => {
			resizeObserver.disconnect();
			intersectionObserver?.disconnect();
			themeObserver.disconnect();
			document.removeEventListener('visibilitychange', onVisibilityChange);
			runtime.destroy();
			if (invalidator === runtime) invalidator = undefined;
		};
	}
</script>

<canvas
	{@attach setupCanvas}
	data-slot="dither-canvas"
	aria-hidden="true"
	class={['pointer-events-none absolute inset-0 block h-full w-full', className]}
	{...restProps}
></canvas>
