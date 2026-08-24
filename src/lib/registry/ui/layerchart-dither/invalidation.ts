export type DitherInvalidationReason =
	'animation' | 'data' | 'hover' | 'selection' | 'size' | 'theme' | 'visibility';

export type DitherPaintFrame = {
	now: number;
	reasons: ReadonlySet<DitherInvalidationReason>;
	progress: number;
	animating: boolean;
};

export type FrameDriver = {
	request: (callback: (now: number) => void) => number;
	cancel: (id: number) => void;
};

export type DitherInvalidator = {
	invalidate: (reason: DitherInvalidationReason) => void;
	startAnimation: (duration: number) => void;
	setPaused: (paused: boolean) => void;
	setReducedMotion: (reducedMotion: boolean) => void;
	destroy: () => void;
};

type CreateDitherInvalidatorOptions = {
	frameDriver: FrameDriver;
	paint: (frame: DitherPaintFrame) => void;
};

export function createDitherInvalidator({
	frameDriver,
	paint
}: CreateDitherInvalidatorOptions): DitherInvalidator {
	const reasons = new Set<DitherInvalidationReason>();
	let frameId: number | null = null;
	let paused = false;
	let reducedMotion = false;
	let destroyed = false;
	let animationDuration = 0;
	let animationStartedAt: number | null = null;
	let animationActive = false;

	function schedule(): void {
		if (destroyed || paused || frameId !== null) return;
		if (reasons.size === 0 && !animationActive) return;
		frameId = frameDriver.request(onFrame);
	}

	function onFrame(now: number): void {
		frameId = null;
		if (destroyed || paused) return;

		let progress = 1;
		if (animationActive && !reducedMotion) {
			animationStartedAt ??= now;
			progress = Math.min(1, Math.max(0, (now - animationStartedAt) / animationDuration));
		}

		if (reducedMotion || progress >= 1) animationActive = false;

		const frameReasons = new Set(reasons);
		reasons.clear();
		paint({ now, reasons: frameReasons, progress, animating: animationActive });

		if (animationActive) reasons.add('animation');
		schedule();
	}

	return {
		invalidate(reason) {
			if (destroyed) return;
			reasons.add(reason);
			schedule();
		},
		startAnimation(duration) {
			if (destroyed) return;
			animationDuration = Math.max(0, Number.isFinite(duration) ? duration : 0);
			animationStartedAt = null;
			animationActive = animationDuration > 0 && !reducedMotion;
			reasons.add('animation');
			schedule();
		},
		setPaused(nextPaused) {
			if (destroyed || paused === nextPaused) return;
			paused = nextPaused;
			if (paused && frameId !== null) {
				frameDriver.cancel(frameId);
				frameId = null;
			}
			if (!paused) {
				animationStartedAt = null;
				schedule();
			}
		},
		setReducedMotion(nextReducedMotion) {
			if (destroyed || reducedMotion === nextReducedMotion) return;
			reducedMotion = nextReducedMotion;
			if (reducedMotion && animationActive) reasons.add('animation');
			schedule();
		},
		destroy() {
			if (destroyed) return;
			destroyed = true;
			animationActive = false;
			reasons.clear();
			if (frameId !== null) frameDriver.cancel(frameId);
			frameId = null;
		}
	};
}
