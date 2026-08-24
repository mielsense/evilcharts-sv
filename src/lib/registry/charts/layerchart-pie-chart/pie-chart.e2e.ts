import { expect, test, type Page } from '@playwright/test';

const EXAMPLES = [
	'ex-pie-chart',
	'ex-donut-pie-chart',
	'ex-padded-pie-chart',
	'ex-overlapping-padded-pie-chart',
	'ex-labels-pie-chart',
	'ex-gradient-colors-pie-chart',
	'ex-glowing-pie-chart',
	'ex-loading-state-pie-chart'
] as const;

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(String(e)));
	return errors;
}

function plot(page: Page) {
	return page.locator('svg.lc-layout-svg').first();
}

function sectors(page: Page) {
	return plot(page).locator('.lc-pie-arc');
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await page.waitForSelector('[data-preview-ready]');
	// The intro sweep begins after 400ms and runs for 1500ms.
	await page.waitForTimeout(2400);
	return errors;
}

test.describe('EvilPieChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);
			// Five browsers in the data, five skeleton sectors while loading.
			await expect(sectors(page)).toHaveCount(5);

			expect(errors).toEqual([]);
		});
	}

	test('the pie reserves its bottom legend before resolving its 80% radius', async ({ page }) => {
		for (const [width, height, expectedRadius] of [
			[440, 256, 72.8],
			[632, 360, 114.4]
		] as const) {
			await page.goto(`/preview/ex-pie-chart?w=${width}&h=${height}`);
			await page.waitForSelector('[data-preview-ready]');
			await page.waitForTimeout(2400);
			const d = (await sectors(page).first().getAttribute('d'))!;
			const radius = Number(d.match(/A([\d.]+),/)![1]);
			expect(radius).toBeCloseTo(expectedRadius, 1);
		}
	});

	test('the first sector starts at 3 o’clock and sweeps anticlockwise', async ({ page }) => {
		await open(page, 'ex-pie-chart');

		const d = (await sectors(page).first().getAttribute('d'))!;
		// Relative to the centre, the sweep opens on the +x axis…
		const [, startX, startY] = d.match(/^M([\d.-]+),([\d.-]+)/)!;
		expect(Number(startY)).toBeCloseTo(0, 1);
		expect(Number(startX)).toBeGreaterThan(0);

		// …and the outer arc's sweep flag is 0, which is anticlockwise in screen space.
		const [, flag] = d.match(/A[\d.]+,[\d.]+,0,(\d),(\d)/)!;
		expect(flag).toBe('0');
	});

	test('sectors keep data order rather than being sorted by value', async ({ page }) => {
		await open(page, 'ex-pie-chart');
		const fills = await sectors(page).evaluateAll((nodes) =>
			nodes.map((n) =>
				(n.getAttribute('fill') || '').replace(/^url\(#.*-colors-/, '').replace(')', '')
			)
		);
		expect(fills).toEqual(['chrome', 'safari', 'firefox', 'edge', 'other']);
	});

	test('the donut leaves an inner hole at the configured radius', async ({ page }) => {
		await open(page, 'ex-donut-pie-chart');
		const d = (await sectors(page).first().getAttribute('d'))!;
		// Two radii in the path: the outer arc and the 60px inner one.
		const radii = [...d.matchAll(/A([\d.]+),\1,/g)].map((m) => Number(m[1]));
		expect(radii).toContain(60);

		await open(page, 'ex-pie-chart');
		const flat = (await sectors(page).first().getAttribute('d'))!;
		// With innerRadius 0 the sector closes on the centre instead of an inner arc.
		expect(flat).toContain('L0,0');
	});

	test('padding rounds the corners and opens a gap between sectors', async ({ page }) => {
		await open(page, 'ex-padded-pie-chart');
		const d = (await sectors(page).first().getAttribute('d'))!;
		// cornerRadius={8} shows up as 8px corner arcs at both ends of each edge.
		expect([...d.matchAll(/A8,8,/g)].length).toBeGreaterThanOrEqual(4);
		// innerRadius={30} keeps a hole.
		expect(d).toContain('A30,30,');
	});

	test('a negative padding angle overlaps the sectors behind a background outline', async ({
		page
	}) => {
		await open(page, 'ex-overlapping-padded-pie-chart');
		const first = sectors(page).first();
		expect(await first.getAttribute('stroke')).toBe('var(--background)');
		expect(await first.getAttribute('stroke-width')).toBe('5');

		// The overlap widens each sector past its share: the five spans add up to more than a turn.
		const spans = await sectors(page).evaluateAll((nodes) =>
			nodes.map((n) => {
				const d = n.getAttribute('d') || '';
				const start = d.match(/^M([\d.-]+),([\d.-]+)/);
				const outer = [...d.matchAll(/A([\d.]+),([\d.]+),0,\d,\d,([\d.-]+),([\d.-]+)/g)]
					.filter((arc) => arc[1] === arc[2])
					.toSorted((a, b) => Number(b[1]) - Number(a[1]))[0];
				if (!start || !outer) return 0;
				const a0 = Math.atan2(-Number(start[2]), Number(start[1]));
				const a1 = Math.atan2(-Number(outer[4]), Number(outer[3]));
				let span = ((a1 - a0) * 180) / Math.PI;
				if (span < 0) span += 360;
				return span;
			})
		);
		expect(spans.reduce((a, b) => a + b, 0)).toBeGreaterThan(360);
	});

	test('labels sit at each sector’s mid-angle', async ({ page }) => {
		await open(page, 'ex-labels-pie-chart');
		const labels = plot(page).locator('text');
		await expect(labels).toHaveCount(5);
		await expect(labels.first()).toHaveText('275');

		const placed = await labels.evaluateAll((nodes) =>
			nodes.map((n) => ({
				x: Number(n.getAttribute('x')),
				y: Number(n.getAttribute('y')),
				anchor: n.getAttribute('text-anchor'),
				dy: n.getAttribute('dy')
			}))
		);
		// Every label is the same distance from the centre — (innerRadius + outerRadius) / 2 —
		// and they are spread around the circle rather than bunched at the start angle.
		const radii = placed.map((p) => Math.hypot(p.x, p.y));
		for (const r of radii) expect(r).toBeCloseTo(radii[0], 0);
		const angles = placed.map((p) => Math.atan2(-p.y, p.x));
		expect(new Set(angles.map((a) => a.toFixed(2))).size).toBe(5);
		expect(placed.every((p) => p.anchor === 'middle' && p.dy === '0.355em')).toBe(true);
	});

	test('the multi-stop config emits one gradient stop per colour', async ({ page }) => {
		await open(page, 'ex-gradient-colors-pie-chart');
		const stops = await plot(page)
			.locator('linearGradient[id*="-colors-chrome"] stop')
			.evaluateAll((nodes) => nodes.length);
		expect(stops).toBe(5);

		// The gradient runs corner to corner.
		const gradient = plot(page).locator('linearGradient[id*="-colors-chrome"]').first();
		await expect(gradient).toHaveAttribute('x2', '1');
		await expect(gradient).toHaveAttribute('y2', '1');
	});

	test('only the named sectors get a glow filter', async ({ page }) => {
		await open(page, 'ex-glowing-pie-chart');
		await expect(plot(page).locator('filter[id$="-glow-chrome"]')).toBeAttached();
		await expect(plot(page).locator('filter[id$="-glow-safari"]')).toBeAttached();
		await expect(plot(page).locator('filter[id$="-glow-firefox"]')).toHaveCount(0);

		const filters = await sectors(page).evaluateAll((nodes) =>
			nodes.map((n) => n.getAttribute('filter'))
		);
		expect(filters.filter(Boolean).length).toBe(2);

		const blur = plot(page).locator('filter[id$="-glow-chrome"] feGaussianBlur');
		await expect(blur).toHaveAttribute('stdDeviation', '8');
	});

	test('clicking a sector dims the others', async ({ page }) => {
		await open(page, 'ex-pie-chart');

		const before = await sectors(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity')))
		);
		expect(before.every((o) => o === 1)).toBe(true);

		await sectors(page).first().click({ force: true });
		await page.waitForTimeout(300);

		const after = await sectors(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity')))
		);
		// The reference dims every unselected sector to 0.15.
		expect(after[0]).toBe(1);
		expect(after.slice(1).every((o) => o === 0.15)).toBe(true);
	});

	test('clicking a legend entry dims the other sectors', async ({ page }) => {
		await open(page, 'ex-pie-chart');
		const entries = page.locator('.select-none > button');
		await expect(entries).toHaveCount(5);
		// Entries are ordered by sector name, not data order (DEVIATIONS A-10), so pick by label.
		await entries.filter({ hasText: 'Safari' }).click();
		await page.waitForTimeout(300);

		expect(await entries.filter({ hasText: 'Chrome' }).getAttribute('class')).toContain(
			'opacity-30'
		);
		const opacities = await sectors(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity')))
		);
		// The sectors stay in data order: chrome, safari, firefox, edge, other.
		expect(opacities[1]).toBe(1);
		expect(opacities[0]).toBe(0.15);
	});

	test('the legend sits below the plot and lists every sector', async ({ page }) => {
		await open(page, 'ex-pie-chart');
		const legend = page.locator('.select-none').first();
		await expect(legend).toBeVisible();
		await expect(legend).toContainText('Chrome');
		await expect(legend).toContainText('Other');

		const [svgBox, legendBox] = await Promise.all([plot(page).boundingBox(), legend.boundingBox()]);
		// Recharts defaults the pie legend to `verticalAlign="bottom"`.
		expect(legendBox!.y).toBeGreaterThan(svgBox!.y);
	});

	test('the loading skeleton pulses in place of the data', async ({ page }) => {
		await open(page, 'ex-loading-state-pie-chart');
		await expect(page.getByText('Loading')).toBeVisible();

		const fills = await sectors(page).evaluateAll((nodes) =>
			nodes.map((n) => n.getAttribute('fill'))
		);
		expect(fills.every((f) => f === 'currentColor')).toBe(true);

		// Equal fifths, and each wrapper carries its own staggered pulse.
		const opacities = await plot(page)
			.locator('.lc-pie-arc')
			.evaluateAll((nodes) => nodes.map((n) => Number(getComputedStyle(n.parentElement!).opacity)));
		expect(opacities.some((o) => o > 0.15 && o <= 0.5)).toBe(true);
	});

	test('the tooltip reports the sector under the pointer', async ({ page }) => {
		// A `{const}` in the tooltip snippet used to freeze the content on the first sector
		// hovered, so the box moved but never changed. See plans/DEVIATIONS.md A-6c.
		await open(page, 'ex-pie-chart');

		const expected = [
			['Chrome', '275'],
			['Safari', '200'],
			['Firefox', '187'],
			['Edge', '173'],
			['Other', '90']
		];

		for (const [index, [name, value]] of expected.entries()) {
			// Walk the ring at the pie's mid-radius until a point lands on this wedge — more robust
			// than a computed centroid, which sits on the boundary for a thin or rounded sector.
			const point = await sectors(page)
				.nth(index)
				.evaluate((node) => {
					const arc = node as unknown as SVGPathElement;
					const box = arc.ownerSVGElement!.getBoundingClientRect();
					const bounds = arc.getBoundingClientRect();
					const cx = box.x + box.width / 2;
					const cy = box.y + box.height / 2;
					const outer = Math.max(bounds.width, bounds.height);
					for (let radius = outer * 0.45; radius > 4; radius -= 2) {
						for (let deg = 0; deg < 360; deg += 1) {
							const rad = (deg * Math.PI) / 180;
							const x = cx + radius * Math.cos(rad);
							const y = cy + radius * Math.sin(rad);
							if (document.elementFromPoint(x, y) === arc) return { x, y };
						}
					}
					return null;
				});
			expect(point, name).not.toBeNull();
			await page.mouse.move(point!.x, point!.y);
			await page.waitForTimeout(220);

			const tooltip = page.locator('.min-w-32').first();
			const text = (await tooltip.innerText()).replace(/\s+/g, ' ');
			// `hideLabel` is set for the pie, so the row is the sector name plus its value.
			expect(text, name).toContain(name);
			expect(text, name).toContain(value);

			// The swatch has to paint from the chart's `--color-*` variables (DEVIATIONS U-2).
			const paint = await tooltip
				.locator('.shrink-0')
				.first()
				.evaluate((n) => {
					const s = getComputedStyle(n);
					return { background: s.backgroundColor, width: s.width, height: s.height };
				});
			expect([paint.width, paint.height], name).toEqual(['10px', '10px']);
			expect(paint.background, name).not.toBe('rgba(0, 0, 0, 0)');
		}
	});
});
