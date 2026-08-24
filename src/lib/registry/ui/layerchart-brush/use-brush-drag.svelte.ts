import { panRange } from './clamp.js';
import type { DragState, DragType, EvilBrushRange } from './types.js';

type Options = {
	range: () => EvilBrushRange;
	totalPoints: () => number;
	container: () => HTMLDivElement | undefined;
	commit: (next: EvilBrushRange, mode?: DragType) => void;
};

export type BrushDragHandlers = {
	onpointerdown: (event: PointerEvent) => void;
	onpointermove: (event: PointerEvent) => void;
	onpointerup: (event: PointerEvent) => void;
};

/**
 * Pointer-capture drag state for the brush handles and the pannable selection.
 *
 * A direct port of the reference's `useBrushDrag`: the same index-delta maths, the same
 * three drag modes, and the same `setPointerCapture` routing so mouse, touch and pen all
 * work without global listeners.
 */
export class BrushDrag {
	#drag: DragState | null = null;
	#options: Options;

	isDragging = $state(false);

	constructor(options: Options) {
		this.#options = options;
	}

	#toIndexDelta(px: number) {
		const container = this.#options.container();
		const totalPoints = this.#options.totalPoints();
		if (!container || totalPoints <= 1) return 0;
		return Math.round((px / container.getBoundingClientRect().width) * (totalPoints - 1));
	}

	#onPointerDown(event: PointerEvent, type: DragType) {
		event.preventDefault();
		(event.target as HTMLElement).setPointerCapture(event.pointerId);
		this.#drag = { type, originX: event.clientX, originRange: { ...this.#options.range() } };
		this.isDragging = true;
	}

	#onPointerMove = (event: PointerEvent) => {
		const d = this.#drag;
		if (!d) return;

		const delta = this.#toIndexDelta(event.clientX - d.originX);
		const { type, originRange: o } = d;
		const totalPoints = this.#options.totalPoints();

		if (type === 'left') {
			this.#options.commit({ startIndex: o.startIndex + delta, endIndex: o.endIndex }, 'left');
		} else if (type === 'right') {
			this.#options.commit({ startIndex: o.startIndex, endIndex: o.endIndex + delta }, 'right');
		} else {
			this.#options.commit(panRange(o, delta, totalPoints), 'middle');
		}
	};

	#onPointerUp = (event: PointerEvent) => {
		(event.target as HTMLElement).releasePointerCapture(event.pointerId);
		this.#drag = null;
		this.isDragging = false;
	};

	/** Binds all three pointer handlers for a given drag type. */
	bind(type: DragType): BrushDragHandlers {
		return {
			onpointerdown: (event: PointerEvent) => this.#onPointerDown(event, type),
			onpointermove: this.#onPointerMove,
			onpointerup: this.#onPointerUp
		};
	}
}
