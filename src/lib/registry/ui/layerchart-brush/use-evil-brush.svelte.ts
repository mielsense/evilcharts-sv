import type { EvilBrushRange } from './types.js';

/**
 * Owns the visible-range state a cartesian chart root feeds its `<EvilBrush>` footer.
 *
 * Port of the reference's `useEvilBrush`. React's `useDeferredValue` (used there to keep the
 * handles at pointer cadence while the expensive chart re-render lags) has no Svelte
 * counterpart and is not needed: Svelte updates only the marks that actually changed.
 * See plans/DEVIATIONS.md B-5.
 */
export class EvilBrushState<TData extends Record<string, unknown>> {
	#getData: () => TData[];
	range = $state<EvilBrushRange>({ startIndex: 0, endIndex: 0 });

	constructor(options: {
		data: () => TData[];
		defaultStartIndex?: number;
		defaultEndIndex?: number;
	}) {
		this.#getData = options.data;
		const data = options.data();
		this.range = {
			startIndex: options.defaultStartIndex ?? 0,
			endIndex: options.defaultEndIndex ?? Math.max(0, data.length - 1)
		};

		// The reference resets the range whenever the dataset length changes.
		let lastLength = data.length;
		$effect(() => {
			const length = this.#getData().length;
			if (length === lastLength) return;
			lastLength = length;
			this.range = { startIndex: 0, endIndex: Math.max(0, length - 1) };
		});
	}

	get visibleData() {
		return this.#getData().slice(this.range.startIndex, this.range.endIndex + 1);
	}

	get brushProps() {
		return {
			startIndex: this.range.startIndex,
			endIndex: this.range.endIndex,
			onChange: (range: EvilBrushRange) => {
				this.range = range;
			}
		};
	}
}
