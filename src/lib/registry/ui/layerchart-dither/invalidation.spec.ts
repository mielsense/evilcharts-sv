import { describe, expect, it } from 'vitest';
import {
	createDitherInvalidator,
	type DitherPaintFrame,
	type FrameDriver
} from './invalidation.js';

function frameHarness() {
	let nextId = 1;
	const callbacks = new Map<number, FrameRequestCallback>();
	const driver: FrameDriver = {
		request(callback) {
			const id = nextId;
			nextId += 1;
			callbacks.set(id, callback);
			return id;
		},
		cancel(id) {
			callbacks.delete(id);
		}
	};

	return {
		driver,
		pending: () => callbacks.size,
		flush(now: number) {
			const entry = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined;
			if (!entry) throw new Error('No paint frame is pending');
			callbacks.delete(entry[0]);
			entry[1](now);
		}
	};
}

describe('event-driven dither invalidation', () => {
	it('coalesces paint reasons and becomes idle after one static frame', () => {
		const harness = frameHarness();
		const paints: DitherPaintFrame[] = [];
		const invalidator = createDitherInvalidator({
			frameDriver: harness.driver,
			paint: (frame) => paints.push(frame)
		});

		invalidator.invalidate('data');
		invalidator.invalidate('theme');
		expect(harness.pending()).toBe(1);

		harness.flush(20);
		expect(paints).toEqual([
			{ now: 20, reasons: new Set(['data', 'theme']), progress: 1, animating: false }
		]);
		expect(harness.pending()).toBe(0);
	});

	it('requests frames only until a bounded animation reaches its end', () => {
		const harness = frameHarness();
		const progress: number[] = [];
		const invalidator = createDitherInvalidator({
			frameDriver: harness.driver,
			paint: (frame) => progress.push(frame.progress)
		});

		invalidator.startAnimation(100);
		harness.flush(10);
		harness.flush(60);
		harness.flush(110);

		expect(progress).toEqual([0, 0.5, 1]);
		expect(harness.pending()).toBe(0);
	});

	it('finishes animation in one frame when reduced motion is active', () => {
		const harness = frameHarness();
		const paints: DitherPaintFrame[] = [];
		const invalidator = createDitherInvalidator({
			frameDriver: harness.driver,
			paint: (frame) => paints.push(frame)
		});

		invalidator.setReducedMotion(true);
		invalidator.startAnimation(400);
		harness.flush(10);

		expect(paints[0]).toMatchObject({ progress: 1, animating: false });
		expect(harness.pending()).toBe(0);
	});

	it('defers invalidations while paused and cancels all work when destroyed', () => {
		const harness = frameHarness();
		const paints: DitherPaintFrame[] = [];
		const invalidator = createDitherInvalidator({
			frameDriver: harness.driver,
			paint: (frame) => paints.push(frame)
		});

		invalidator.invalidate('size');
		invalidator.setPaused(true);
		expect(harness.pending()).toBe(0);

		invalidator.invalidate('visibility');
		invalidator.setPaused(false);
		expect(harness.pending()).toBe(1);
		harness.flush(30);
		expect(paints[0].reasons).toEqual(new Set(['size', 'visibility']));

		invalidator.invalidate('hover');
		invalidator.destroy();
		expect(harness.pending()).toBe(0);
		invalidator.invalidate('data');
		expect(harness.pending()).toBe(0);
	});
});
