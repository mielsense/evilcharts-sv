import { expect, test, type Locator, type Page } from '@playwright/test';

const BRUSH = '.group.relative.select-none';

/** Reads the resolved `left`/`width` of a brush's selection rectangle, in percent. */
async function selection(brush: Locator) {
	const style = await brush.locator('.cursor-grab').getAttribute('style');
	const left = Number(/left:\s*([\d.]+)%/.exec(style ?? '')?.[1] ?? NaN);
	const width = Number(/width:\s*([\d.]+)%/.exec(style ?? '')?.[1] ?? NaN);
	return { left, width };
}

async function waitForSelectionToSettle(brush: Locator) {
	let previous = '';
	await expect
		.poll(
			async () => {
				const current = JSON.stringify(await selection(brush));
				const settled = current === previous;
				previous = current;
				return settled;
			},
			{ timeout: 5000, intervals: [80, 80, 120, 160, 200] }
		)
		.toBe(true);
}

async function dragBy(page: Page, target: Locator, dx: number) {
	const box = await target.boundingBox();
	if (!box) throw new Error('drag target has no box');
	const y = box.y + box.height / 2;
	await page.mouse.move(box.x + box.width / 2, y);
	await page.mouse.down();
	// Several steps so the pointermove handler runs more than once, as a real drag does.
	await page.mouse.move(box.x + box.width / 2 + dx * 0.5, y, { steps: 5 });
	await page.mouse.move(box.x + box.width / 2 + dx, y, { steps: 5 });
	await page.mouse.up();

	// The handles are spring-animated, so wait for the position to stop changing rather than for a
	// fixed delay — a fixed one is flaky when the suite runs several workers in parallel.
	await waitForSelectionToSettle(page.locator(BRUSH).first());
}

async function startDrag(page: Page, target: Locator, dx: number) {
	const box = await target.boundingBox();
	if (!box) throw new Error('drag target has no box');
	await target.evaluate((element) => {
		element.addEventListener(
			'pointerdown',
			(event) => {
				(element as HTMLElement).dataset.pointerId = String((event as PointerEvent).pointerId);
			},
			{ once: true }
		);
	});
	const y = box.y + box.height / 2;
	const startX = box.x + box.width / 2;
	await page.mouse.move(startX, y);
	await page.mouse.down();
	await page.mouse.move(startX + dx, y, { steps: 5 });
	const pointerId = Number(await target.getAttribute('data-pointer-id'));
	return { box, pointerId, startX, y };
}

test.describe('EvilBrush', () => {
	test.beforeEach(async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
		page.on('pageerror', (e) => errors.push(String(e)));
		(page as Page & { __errors?: string[] }).__errors = errors;

		await page.goto('/dev/brush');
		await page.waitForSelector('[data-preview-ready]');
	});

	test('renders every mini-chart variant at its container size', async ({ page }) => {
		const brushes = page.locator(BRUSH);
		await expect(brushes).toHaveCount(4);

		for (const svg of await page.locator('svg.lc-layout-svg').all()) {
			// LayerChart's <Svg> falls back to 100x100 until the container is measured.
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(200);
			expect(Number(await svg.getAttribute('height'))).toBe(56);
		}

		// area draws a filled path per series plus its outline; bar draws one rect per point.
		await expect(brushes.nth(0).locator('svg path')).toHaveCount(4);
		await expect(brushes.nth(1).locator('svg path')).toHaveCount(2);
		await expect(brushes.nth(2).locator('svg rect')).toHaveCount(60);
	});

	test('starts fully selected with both dim overlays collapsed', async ({ page }) => {
		const brush = page.locator(BRUSH).first();
		expect(await selection(brush)).toEqual({ left: 0, width: 100 });
		for (const overlay of await brush.locator('.backdrop-blur-\\[2px\\]').all()) {
			// Whitespace-insensitive: the motion library's inline style spacing is its own business.
			const style = (await overlay.getAttribute('style'))?.replace(/\s+/g, '') ?? '';
			expect(style).toContain('width:0%');
		}
	});

	test('dragging the left handle right shrinks the window from the left', async ({ page }) => {
		const brush = page.locator(BRUSH).first();
		const box = (await brush.boundingBox())!;
		await dragBy(page, brush.locator('.cursor-ew-resize').first(), box.width * 0.4);

		const after = await selection(brush);
		expect(after.left).toBeGreaterThan(30);
		expect(after.width).toBeLessThan(75);
		// The right edge has not moved.
		expect(after.left + after.width).toBeCloseTo(100, 0);
	});

	test('dragging the right handle left shrinks the window from the right', async ({ page }) => {
		const brush = page.locator(BRUSH).first();
		const box = (await brush.boundingBox())!;
		await dragBy(page, brush.locator('.cursor-ew-resize').nth(1), -box.width * 0.4);

		const after = await selection(brush);
		expect(after.left).toBe(0);
		expect(after.width).toBeLessThan(75);
	});

	test('dragging the selection pans the window without changing its span', async ({ page }) => {
		const brush = page.locator(BRUSH).first();
		const box = (await brush.boundingBox())!;
		// Narrow it first so there is room to pan.
		await dragBy(page, brush.locator('.cursor-ew-resize').nth(1), -box.width * 0.5);
		const before = await selection(brush);

		await dragBy(page, brush.locator('.cursor-grab'), box.width * 0.25);
		const after = await selection(brush);

		expect(after.left).toBeGreaterThan(before.left);
		expect(after.width).toBeCloseTo(before.width, 0);
	});

	test('pointer cancellation stops the active drag and permits the next drag', async ({ page }) => {
		const brush = page.locator(BRUSH).first();
		const handle = brush.locator('.cursor-ew-resize').first();
		const brushBox = (await brush.boundingBox())!;
		const { pointerId, startX, y } = await startDrag(page, handle, brushBox.width * 0.15);
		await handle.dispatchEvent('pointercancel', {
			pointerId,
			pointerType: 'mouse',
			clientX: startX + brushBox.width * 0.15,
			clientY: y
		});
		await waitForSelectionToSettle(brush);
		const cancelledAt = await selection(brush);
		await handle.dispatchEvent('pointermove', {
			pointerId,
			pointerType: 'mouse',
			buttons: 1,
			clientX: startX + brushBox.width * 0.55,
			clientY: y
		});
		await page.waitForTimeout(300);
		expect(await selection(brush)).toEqual(cancelledAt);
		await page.mouse.up();

		await dragBy(page, handle, brushBox.width * 0.15);
		expect((await selection(brush)).left).toBeGreaterThan(cancelledAt.left);
	});

	test('lost pointer capture stops the active drag and permits the next drag', async ({ page }) => {
		const brush = page.locator(BRUSH).first();
		const handle = brush.locator('.cursor-ew-resize').first();
		const box = (await brush.boundingBox())!;
		const { pointerId, startX, y } = await startDrag(page, handle, box.width * 0.15);
		await handle.evaluate((element, id) => element.releasePointerCapture(id), pointerId);
		await waitForSelectionToSettle(brush);
		const releasedAt = await selection(brush);
		await handle.dispatchEvent('pointermove', {
			pointerId,
			pointerType: 'mouse',
			buttons: 1,
			clientX: startX + box.width * 0.55,
			clientY: y
		});
		await page.waitForTimeout(300);
		expect(await selection(brush)).toEqual(releasedAt);
		await page.mouse.up();

		await dragBy(page, handle, box.width * 0.15);
		expect((await selection(brush)).left).toBeGreaterThan(releasedAt.left);
	});

	test('a controlled brush drives the visible range and the handle labels', async ({ page }) => {
		const readout = page.locator('pre');
		await expect(readout).toContainText('"startIndex":0');
		await expect(readout).toContainText('first=June 1');
		await expect(readout).toContainText('last=June 30');

		const brush = page.locator(BRUSH).nth(3);
		const box = (await brush.boundingBox())!;
		await dragBy(page, brush.locator('.cursor-ew-resize').first(), box.width * 0.4);

		const text = (await readout.textContent()) ?? '';
		const startIndex = Number(/"startIndex":(\d+)/.exec(text)?.[1]);
		expect(startIndex).toBeGreaterThan(5);
		expect(text).not.toContain('first=June 1 ');

		// Handle labels format through `formatLabel`, which strips the "June " prefix here.
		const labels = await brush.locator('.bg-foreground').allTextContents();
		expect(labels[0].trim()).toBe(String(startIndex + 1));
		expect(labels[1].trim()).toBe('30');
	});

	test('logs no console errors', async ({ page }) => {
		await page.waitForTimeout(500);
		expect((page as Page & { __errors?: string[] }).__errors).toEqual([]);
	});
});
