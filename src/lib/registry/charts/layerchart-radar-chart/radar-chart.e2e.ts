import { expect, test, type Page } from '@playwright/test';
import { waitForPreview } from '$site/testing/wait-for-preview.js';

const EXAMPLES = [
	'ex-radar-chart',
	'ex-lines-variant-radar-chart',
	'ex-circle-grid-radar-chart',
	'ex-gradient-colors-radar-chart',
	'ex-glowing-radar-chart',
	'ex-loading-state-radar-chart'
] as const;

const SKILLS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'CSS', 'Python'];

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(String(e)));
	return errors;
}

function plot(page: Page) {
	return page.locator('svg.lc-layout-svg').first();
}

/** The radar polygons: the only paths painted from a per-series gradient. */
function radars(page: Page) {
	return plot(page).locator('path[stroke^="url(#"]');
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await waitForPreview(page);
	await page.waitForTimeout(1600);
	return errors;
}

/** Vertex coordinates of a closed radial polygon, relative to the chart centre. */
function vertices(d: string) {
	return [...d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((m) => ({
		x: Number(m[1]),
		y: Number(m[2])
	}));
}

test.describe('EvilRadarChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);
			// Both the real radars and the skeleton draw one closed path per series.
			await expect(plot(page).locator('path.lc-path').first()).toBeAttached();

			expect(errors).toEqual([]);
		});
	}

	test('the web is centred in the plot', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		const svg = plot(page);
		const box = {
			w: Number(await svg.getAttribute('width')),
			h: Number(await svg.getAttribute('height'))
		};
		const centre = await svg
			.locator('.lc-group-g')
			.first()
			.evaluate((n) => {
				const matrix = (n as SVGGraphicsElement).getCTM();
				return { x: matrix?.e, y: matrix?.f };
			});
		// Recharts reserves the legend for radius calculation but keeps the polar origin at the
		// centre of the full SVG surface.
		expect(centre.x).toBeCloseTo(box.w / 2, 0);
		expect(centre.y).toBeCloseTo(box.h / 2, 0);
	});

	test('mobile settled geometry reserves the edge legend before scaling the web', async ({
		page
	}) => {
		await page.goto('/preview/ex-radar-chart?w=440&h=256');
		await waitForPreview(page);
		await page.waitForTimeout(2400);
		const bounds = await radars(page)
			.first()
			.evaluate((node) => {
				const box = (node as SVGGraphicsElement).getBBox();
				return { width: box.width, height: box.height };
			});
		expect(bounds.width).toBeCloseTo(102.25, 0);
		expect(bounds.height).toBeCloseTo(81.67, 0);
	});

	test('desktop settled geometry scales the web to the reference bounds', async ({ page }) => {
		await page.goto('/preview/ex-radar-chart?w=632&h=360');
		await waitForPreview(page);
		await page.waitForTimeout(2400);
		const bounds = await radars(page)
			.first()
			.evaluate((node) => {
				const box = (node as SVGGraphicsElement).getBBox();
				return { width: box.width, height: box.height };
			});
		expect(bounds.width).toBeCloseTo(160.685, 0);
		expect(bounds.height).toBeCloseTo(128.343, 0);
	});

	test('the first vertex sits at 12 o’clock and the polygon runs clockwise', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		const points = vertices((await radars(page).first().getAttribute('d'))!);
		expect(points).toHaveLength(6);

		// Straight up: x is 0 and y is negative.
		expect(points[0].x).toBeCloseTo(0, 1);
		expect(points[0].y).toBeLessThan(0);
		// Clockwise: the next vertex is to the right.
		expect(points[1].x).toBeGreaterThan(0);
		// One vertex per category, evenly spaced by 60°.
		const angles = points.map((p) => (Math.atan2(p.x, -p.y) * 180) / Math.PI);
		for (const [index, angle] of angles.entries()) {
			const expected = index * 60;
			expect(((angle % 360) + 360) % 360).toBeCloseTo(expected, 0);
		}
	});

	test('the largest value respects the niced radial domain', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		// Recharts nices this example's 305 maximum to a 320 domain maximum.
		const rings = await plot(page)
			.locator('.lc-grid-y-radial-line, .lc-grid-y-radial-circle')
			.evaluateAll((nodes) =>
				nodes.map((n) => {
					const d = n.getAttribute('d');
					if (!d) return Number(n.getAttribute('r'));
					// Parsed in the page, so the helper cannot be shared with the Node side.
					const points = [...d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((m) => ({
						x: Number(m[1]),
						y: Number(m[2])
					}));
					return Math.max(...points.map((p) => Math.hypot(p.x, p.y)));
				})
			);
		// Five evenly divided rings, including the degenerate one at the centre.
		expect(rings).toHaveLength(5);
		const outer = Math.max(...rings);
		for (const [index, radius] of rings.entries()) {
			expect(radius).toBeCloseTo((outer * index) / 4, 0);
		}

		const radii = vertices((await radars(page).first().getAttribute('d'))!).map((p) =>
			Math.hypot(p.x, p.y)
		);
		expect(Math.max(...radii)).toBeCloseTo(outer * (305 / 320), 0);
	});

	test('the grid draws dashed spokes and rings in the same ink', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		// `ChartContainer`'s cartesian grid override must not repaint the polar grid (DEVIATIONS U-4).
		const paint = await plot(page)
			.locator('.lc-grid-x-radial-line, .lc-grid-y-radial-line')
			.evaluateAll((nodes) =>
				nodes.map((n) => {
					const s = getComputedStyle(n);
					return `${s.strokeDasharray}|${s.strokeOpacity}`;
				})
			);
		expect(paint.length).toBeGreaterThan(6);
		expect(new Set(paint).size).toBe(1);
		expect(paint[0]).toBe('3px, 4px|0.2');
	});

	test('the circle grid draws rings instead of polygons', async ({ page }) => {
		await open(page, 'ex-circle-grid-radar-chart');
		await expect(plot(page).locator('.lc-grid-y-radial-circle').first()).toBeAttached();
		await expect(plot(page).locator('.lc-grid-y-radial-line')).toHaveCount(0);
	});

	test('every category is labelled around the perimeter', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		const labels = await plot(page)
			.locator('.lc-axis-tick-label')
			.evaluateAll((nodes) => nodes.map((n) => n.textContent!.trim()));
		expect(labels).toEqual(SKILLS);
	});

	test('the filled variant paints its gradient and lines keeps an invisible hit target', async ({
		page
	}) => {
		await open(page, 'ex-radar-chart');
		const filled = await radars(page)
			.first()
			.evaluate((n) => ({
				fill: n.getAttribute('fill'),
				fillOpacity: n.getAttribute('fill-opacity'),
				strokeWidth: n.getAttribute('stroke-width')
			}));
		expect(filled.fill).toMatch(/-radar-fill-desktop\)$/);
		// The reference's DEFAULT_FILL_OPACITY.
		expect(Number(filled.fillOpacity)).toBeCloseTo(0.3, 2);
		expect(filled.strokeWidth).toBe('1');

		// The radial fill gradient ramps 0.8 → 0.3.
		const stops = await plot(page)
			.locator('radialGradient[id$="-radar-fill-desktop"] stop')
			.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('stop-opacity')));
		expect(stops).toEqual(['0.8', '0.3']);

		await open(page, 'ex-lines-variant-radar-chart');
		const lines = await radars(page)
			.first()
			.evaluate((n) => ({
				fill: n.getAttribute('fill'),
				fillOpacity: n.getAttribute('fill-opacity')
			}));
		// The line-only chart retains a transparent fill so its interior remains interactive.
		expect(lines.fill).toBe('transparent');
		expect(Number(lines.fillOpacity)).toBe(0);
	});

	test('the stroke gradient runs diagonally', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		const gradient = plot(page).locator('linearGradient[id$="-radar-stroke-desktop"]');
		await expect(gradient).toHaveAttribute('x2', '1');
		await expect(gradient).toHaveAttribute('y2', '1');
	});

	test('the multi-stop config emits one stop per colour', async ({ page }) => {
		await open(page, 'ex-gradient-colors-radar-chart');
		const stops = await plot(page)
			.locator('linearGradient[id$="-radar-stroke-desktop"] stop')
			.evaluateAll((nodes) => nodes.length);
		expect(stops).toBe(3);
	});

	test('only the glowing radar gets a filter', async ({ page }) => {
		await open(page, 'ex-glowing-radar-chart');
		await expect(plot(page).locator('filter[id$="-radar-glow-desktop"]')).toBeAttached();
		await expect(plot(page).locator('filter[id$="-radar-glow-mobile"]')).toHaveCount(0);

		const blur = plot(page).locator('filter[id$="-radar-glow-desktop"] feGaussianBlur');
		await expect(blur).toHaveAttribute('stdDeviation', '4');

		const filters = await radars(page).evaluateAll((nodes) =>
			nodes.map((n) => n.getAttribute('filter'))
		);
		expect(filters.filter(Boolean).length).toBe(1);
	});

	test('clicking a legend entry dims the other radar', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		const entries = page.locator('.select-none > button');
		await entries.filter({ hasText: 'Desktop' }).click();
		await page.waitForTimeout(300);

		const painted = await radars(page).evaluateAll((nodes) =>
			nodes.map((n) => ({
				key: (n.getAttribute('stroke') || '').includes('desktop') ? 'desktop' : 'mobile',
				stroke: Number(n.getAttribute('stroke-opacity')),
				fill: Number(n.getAttribute('fill-opacity'))
			}))
		);
		const desktop = painted.find((p) => p.key === 'desktop')!;
		const mobile = painted.find((p) => p.key === 'mobile')!;

		// The reference dims a deselected radar's stroke to 0.2 and multiplies its fill by 0.1.
		expect(desktop.stroke).toBe(1);
		expect(mobile.stroke).toBeCloseTo(0.2, 2);
		expect(mobile.fill).toBeCloseTo(0.03, 3);
	});

	test('hovering a category shows the tooltip for that skill', async ({ page }) => {
		await open(page, 'ex-radar-chart');

		const label = () => page.locator('.min-w-32 .font-medium').first().innerText();
		const [plotBox, groupCentre] = await Promise.all([
			plot(page).boundingBox(),
			plot(page)
				.locator('.lc-group-g')
				.first()
				.evaluate((node) => {
					const matrix = (node as SVGGraphicsElement).getScreenCTM()!;
					return { x: matrix.e, y: matrix.f };
				})
		]);
		if (!plotBox) throw new Error('radar plot is not visible');
		const centre = groupCentre;
		const radius = Math.min(plotBox.width, plotBox.height) * 0.3;

		// Straight up is the first category; a third of the way round is the third.
		for (const [index, skill] of [
			[0, 'JavaScript'],
			[2, 'React'],
			[4, 'CSS']
		] as const) {
			const angle = (index * 60 * Math.PI) / 180;
			await page.mouse.move(
				centre.x + radius * Math.sin(angle),
				centre.y - radius * Math.cos(angle)
			);
			await page.waitForTimeout(250);
			expect(await label(), skill).toBe(skill);
		}

		// The swatch must paint from the chart variables (DEVIATIONS U-2).
		const swatch = page.locator('.min-w-32 .shrink-0').first();
		const paint = await swatch.evaluate((n) => {
			const s = getComputedStyle(n);
			return { background: s.backgroundColor, width: s.width };
		});
		expect(paint.width).toBe('10px');
		expect(paint.background).not.toBe('rgba(0, 0, 0, 0)');
	});

	test('the loading skeleton replaces the radars, axis and legend', async ({ page }) => {
		await open(page, 'ex-loading-state-radar-chart');
		await expect(page.getByText('Loading')).toBeVisible();

		// The reference hides the angle axis and the legend while loading, unlike the cartesian charts.
		await expect(plot(page).locator('.lc-axis-tick-label')).toHaveCount(0);
		await expect(page.locator('.select-none')).toHaveCount(0);

		const skeleton = await plot(page)
			.locator('path.lc-path[stroke="currentColor"]')
			.evaluateAll((nodes) =>
				nodes.map((n) => ({
					strokeOpacity: n.getAttribute('stroke-opacity'),
					fill: n.getAttribute('fill'),
					fillOpacity: n.getAttribute('fill-opacity')
				}))
			);
		const shape = skeleton.find((s) => s.fill === 'currentColor');
		expect(shape).toBeDefined();
		expect(shape!.strokeOpacity).toBe('0.3');
		expect(shape!.fillOpacity).toBe('0.1');
	});

	test('the radar grows out of the centre on mount', async ({ page }) => {
		// The reference never disables Recharts' `<Radar>` animation, which interpolates every point
		// from the centre outward over 1.5s. See plans/DEVIATIONS.md A-14.
		await page.goto('/preview/ex-radar-chart?w=630&h=360');
		await waitForPreview(page);

		const scaleOf = () =>
			plot(page)
				.locator('g[style*="scale"]')
				.first()
				.evaluate((n) => new DOMMatrixReadOnly(getComputedStyle(n).transform).a);

		const early = await scaleOf();
		expect(early).toBeLessThan(1);

		await page.waitForTimeout(1800);
		expect(await scaleOf()).toBeCloseTo(1, 1);
	});

	test('every vertex draws its dot, on both sides of the centre', async ({ page }) => {
		await open(page, 'ex-radar-chart');
		// The dot's gradient rect used to start at the group origin — the chart *centre* — so every
		// dot to its left vanished. See plans/DEVIATIONS.md U-7.
		const centres = await plot(page)
			.locator('clipPath circle')
			.evaluateAll((nodes) => nodes.map((n) => Number(n.getAttribute('cx'))));
		// Two series x six categories.
		expect(centres).toHaveLength(12);
		expect(centres.filter((cx) => cx < -1).length).toBeGreaterThan(0);
		expect(centres.filter((cx) => cx > 1).length).toBeGreaterThan(0);

		const rects = await plot(page)
			.locator('rect[clip-path]')
			.evaluateAll((nodes) =>
				nodes.map((n) => ({ x: Number(n.getAttribute('x')), w: Number(n.getAttribute('width')) }))
			);
		// Each spans the whole plot, starting to the left of the centre.
		expect(rects.every((r) => r.x < 0 && r.w > 100)).toBe(true);
	});
});
