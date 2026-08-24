import { expect, test, type Locator, type Page } from '@playwright/test';

const ANIMATION_STATE = 'data-evil-animation-state';

async function sweepDegrees(path: Locator) {
	return path.evaluate((node) => {
		const d = node.getAttribute('d') ?? '';
		const arc = d.match(
			/^M([\d.eE+-]+),([\d.eE+-]+)A([\d.eE+-]+),([\d.eE+-]+),0,([01]),([01]),([\d.eE+-]+),([\d.eE+-]+)/
		);
		if (!arc) throw new Error(`Could not read the outer arc from: ${d}`);

		const start = Math.atan2(Number(arc[2]), Number(arc[1]));
		const end = Math.atan2(Number(arc[8]), Number(arc[7]));
		const clockwise = arc[6] === '1';
		const turn = Math.PI * 2;
		const delta = clockwise ? (end - start + turn) % turn : (start - end + turn) % turn;
		return (delta * 180) / Math.PI;
	});
}

async function open(page: Page, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') {
	await page.emulateMedia({ reducedMotion });
	await page.goto('/dev/polar-motion');
	await page.waitForSelector('[data-preview-ready]');
	await expect(pieArc(page)).toHaveAttribute(ANIMATION_STATE, 'idle', { timeout: 8000 });
	await expect(radialArc(page)).toHaveAttribute(ANIMATION_STATE, 'idle', { timeout: 8000 });
}

function pieArc(page: Page) {
	return page.locator('[data-motion-chart="pie"] .lc-pie-arc').first();
}

function radialArc(page: Page) {
	return page.locator('[data-motion-chart="radial"] path.lc-arc-line').first();
}

async function expectIntermediateSweep(path: Locator) {
	await expect
		.poll(
			async () => {
				const sweep = await sweepDegrees(path);
				return sweep > 72.5 && sweep < 287.5;
			},
			{ timeout: 4000, intervals: [16, 32, 50, 80, 120] }
		)
		.toBe(true);
}

async function expectFinalSweep(path: Locator) {
	await expect(path).toHaveAttribute(ANIMATION_STATE, 'idle', { timeout: 5000 });
	await expect.poll(() => sweepDegrees(path), { timeout: 2000 }).toBeCloseTo(72, 0);
}

test.describe('polar chart update motion', () => {
	test('pie sectors interpolate their sweep when data changes', async ({ page }) => {
		await open(page);
		const before = await sweepDegrees(pieArc(page));
		expect(before).toBeCloseTo(288, 0);

		await page.getByRole('button', { name: 'Update pie data' }).click();
		await expect(pieArc(page)).toHaveAttribute(ANIMATION_STATE, 'running');
		await expectIntermediateSweep(pieArc(page));
		await expectFinalSweep(pieArc(page));
	});

	test('pie labels stay hidden until an update animation finishes', async ({ page }) => {
		await open(page);
		const labels = page.locator('[data-motion-chart="pie"] svg text');
		await expect(labels).toHaveCount(2);

		await page.getByRole('button', { name: 'Update pie data' }).click();
		await expect(pieArc(page)).toHaveAttribute(ANIMATION_STATE, 'running');
		await expect(labels).toHaveCount(0);
		await expectFinalSweep(pieArc(page));
		await expect(labels).toHaveCount(2);
	});

	test('radial bars interpolate their sweep when data changes', async ({ page }) => {
		await open(page);
		const before = await sweepDegrees(radialArc(page));
		expect(before).toBeCloseTo(288, 0);

		await page.getByRole('button', { name: 'Update radial data' }).click();
		await expect(radialArc(page)).toHaveAttribute(ANIMATION_STATE, 'running');
		await expectIntermediateSweep(radialArc(page));
		await expectFinalSweep(radialArc(page));
	});

	test('reduced motion applies updated geometry immediately', async ({ page }) => {
		await open(page, 'reduce');

		await page.getByRole('button', { name: 'Update pie data' }).click();
		await page.getByRole('button', { name: 'Update radial data' }).click();

		await expectFinalSweep(pieArc(page));
		await expectFinalSweep(radialArc(page));
	});
});
