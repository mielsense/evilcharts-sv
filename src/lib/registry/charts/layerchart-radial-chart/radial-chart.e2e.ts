import { expect, test, type Page } from '@playwright/test';

const EXAMPLES = [
	'ex-radial-chart',
	'ex-semi-variant-radial-chart',
	'ex-gradient-colors-radial-chart',
	'ex-loading-state-radial-chart'
] as const;

const BROWSERS = ['chrome', 'safari', 'firefox', 'edge', 'other'];

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(String(e)));
	return errors;
}

function plot(page: Page) {
	return page.locator('svg.lc-layout-svg').first();
}

/** The painted bars — the tracks behind them carry `lc-arc-track` instead. */
function bars(page: Page) {
	return plot(page).locator('path.lc-arc-line');
}

function tracks(page: Page) {
	return plot(page).locator('path.lc-arc-track');
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await page.waitForSelector('[data-preview-ready]');
	await page.waitForTimeout(1600);
	return errors;
}

/**
 * A viewport point inside one bar's band.
 *
 * Read from the bar's own radii rather than its bounding box: an annulus's box centre falls in the
 * hole, and a partial arc's box is not centred on the chart. The angle is a small offset from the
 * chart's start angle, which every bar's sweep covers.
 */
async function pointInBar(page: Page, index: number, startAngle: number) {
	return bars(page)
		.nth(index)
		.evaluate((node, angle: number) => {
			const arc = node as unknown as SVGPathElement;
			const svg = arc.ownerSVGElement!;
			const group = svg.querySelector('.lc-group-g') as SVGGElement;
			const matrix = new DOMMatrixReadOnly(getComputedStyle(group).transform);
			const box = svg.getBoundingClientRect();
			// The group's transform is relative to the padded plot, which starts 5px in.
			const cx = box.x + 5 + matrix.e;
			const cy = box.y + 5 + matrix.f;

			const d = arc.getAttribute('d') || '';
			const radii = [...d.matchAll(/A([\d.]+),\1,/g)]
				.map((m) => Number(m[1]))
				.filter((r) => r > 10);
			const radius = (Math.max(...radii) + Math.min(...radii)) / 2;

			return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
			// d3 measures clockwise from 12 o'clock, so this lands just past the start edge.
		}, startAngle + 0.25);
}

test.describe('EvilRadialChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);
			// One bar and one track per row, for all five rows.
			await expect(bars(page)).toHaveCount(5);
			await expect(tracks(page)).toHaveCount(5);

			expect(errors).toEqual([]);
		});
	}

	test('rings run inside out, one band per row at the reference radii', async ({ page }) => {
		await open(page, 'ex-radial-chart');

		const svg = plot(page);
		const box = {
			w: Number(await svg.getAttribute('width')),
			h: Number(await svg.getAttribute('height'))
		};
		// Recharts' default `<RadialBarChart margin>`.
		const CHART_MARGIN = 5;
		// The default bottom legend occupies the same 32px band as the reference's absolute legend
		// wrapper. LayerChart exposes the remaining padded plot to the radial marks.
		const EDGE_LEGEND_HEIGHT = 32;
		const maxRadius =
			Math.min(box.w - 2 * CHART_MARGIN, box.h - 2 * CHART_MARGIN - EDGE_LEGEND_HEIGHT) / 2;
		// `innerRadius="30%"`, `outerRadius="100%"`, five rows, `barSize={14}`.
		const inner = maxRadius * 0.3;
		const step = (maxRadius - inner) / 5;
		const bandOffset = Math.floor((step - 14) / 2);

		const measured = await tracks(page).evaluateAll((nodes) =>
			nodes.map((n) => {
				const d = n.getAttribute('d') || '';
				// The `A5,5,` corner arcs share this shape, so drop anything that small.
				const radii = [...d.matchAll(/A([\d.]+),\1,/g)]
					.map((m) => Number(m[1]))
					.filter((r) => r > 10);
				return { outer: Math.max(...radii), inner: Math.min(...radii) };
			})
		);

		expect(measured).toHaveLength(5);
		measured.forEach((ring, index) => {
			// Row 0 is the innermost ring, which is how Recharts stacks them.
			const ringInner = inner + step * index + bandOffset;
			expect(ring.outer, `ring ${index} outer`).toBeCloseTo(ringInner + 14, 1);
			expect(ring.inner, `ring ${index} inner`).toBeCloseTo(ringInner, 1);
		});
	});

	test('the arc centre sits mid-plot for full and 70% down for semi', async ({ page }) => {
		const centreOf = async () =>
			plot(page)
				.locator('.lc-group-g')
				.first()
				.evaluate((n) => {
					const m = new DOMMatrixReadOnly(getComputedStyle(n).transform);
					return { x: m.e, y: m.f };
				});

		await open(page, 'ex-radial-chart');
		const svg = plot(page);
		const height = Number(await svg.getAttribute('height'));
		const width = Number(await svg.getAttribute('width'));
		const CHART_MARGIN = 5;
		const EDGE_LEGEND_HEIGHT = 32;
		const plotHeight = height - 2 * CHART_MARGIN - EDGE_LEGEND_HEIGHT;
		const full = await centreOf();
		expect(full.x).toBeCloseTo((width - 2 * CHART_MARGIN) / 2, 0);
		expect(full.y).toBeCloseTo(plotHeight / 2, 0);

		await open(page, 'ex-semi-variant-radial-chart');
		const semi = await centreOf();
		// The reference pushes `cy` to 70% so the half circle fills the box.
		expect(semi.y).toBeCloseTo(plotHeight * 0.7, 0);
	});

	test('the largest row fills the arc and the rest are proportional', async ({ page }) => {
		await open(page, 'ex-radial-chart');
		const paths = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => n.getAttribute('d') || '')
		);

		// chrome is the maximum (275), so it closes into a full ring — two concentric arcs.
		expect(paths[0]).toMatch(/^M0,-[\d.]+A/);
		expect(paths[0]).toContain('M0,');
		// A full sweep needs no rounded corners; every partial bar has them.
		expect(paths[0]).not.toContain('A5,5,');
		for (const d of paths.slice(1)) expect(d).toContain('A5,5,');
	});

	test('the semi variant starts at 9 o’clock and sweeps over the top', async ({ page }) => {
		await open(page, 'ex-semi-variant-radial-chart');
		const d = (await bars(page).first().getAttribute('d'))!;
		// Relative to the centre, the sweep opens on the −x axis.
		const [, startX, startY] = d.match(/^M(-?[\d.]+),(-?[\d.]+)/)!;
		expect(Number(startX)).toBeLessThan(0);
		expect(Number(startY)).toBeCloseTo(0, 1);
		// Sweep flag 1 runs clockwise in screen space, i.e. up and over.
		expect(d).toMatch(/A[\d.]+,[\d.]+,0,0,1,/);
	});

	test('every bar paints from the chart-level gradient for its name', async ({ page }) => {
		await open(page, 'ex-radial-chart');
		const fills = await bars(page).evaluateAll((nodes) => nodes.map((n) => n.getAttribute('fill')));
		BROWSERS.forEach((name, index) => {
			expect(fills[index]).toMatch(new RegExp(`-radial-colors-${name}\\)$`));
		});

		// One diagonal gradient per config key, in a single chart-level <defs>.
		const gradient = plot(page).locator('linearGradient[id$="-radial-colors-chrome"]');
		await expect(gradient).toHaveAttribute('x2', '1');
		await expect(gradient).toHaveAttribute('y2', '1');
	});

	test('the gradient example keeps the original three-stop palettes in both themes', async ({
		page
	}) => {
		await open(page, 'ex-gradient-colors-radial-chart');
		const chromeStops = plot(page).locator('linearGradient[id$="-radial-colors-chrome"] stop');
		await expect(chromeStops).toHaveCount(3);

		const stopColors = () =>
			chromeStops.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).stopColor));

		await page.evaluate(() => document.documentElement.classList.remove('dark'));
		expect(await stopColors()).toEqual([
			'rgb(255, 107, 107)',
			'rgb(254, 202, 87)',
			'rgb(72, 219, 251)'
		]);

		await page.evaluate(() => document.documentElement.classList.add('dark'));
		expect(await stopColors()).toEqual([
			'rgb(255, 121, 121)',
			'rgb(255, 234, 167)',
			'rgb(116, 185, 255)'
		]);
	});

	test('the tracks are painted from the muted token and span the whole sweep', async ({ page }) => {
		await open(page, 'ex-radial-chart');
		// `ChartContainer` supplies the track fill, as the reference does for
		// `.recharts-radial-bar-background-sector`.
		const fill = await tracks(page)
			.first()
			.evaluate((n) => getComputedStyle(n).fill);
		expect(fill).not.toBe('none');
		expect(fill).not.toBe('rgba(0, 0, 0, 0)');

		// Every track is a full ring, even where its bar stops short — LayerChart otherwise ends the
		// track at the bar's own angle and hides it completely (DEVIATIONS U-6). A closed annulus
		// needs no rounded corners, so the absence of `A5,5,` is the tell.
		const trackPaths = await tracks(page).evaluateAll((nodes) =>
			nodes.map((n) => n.getAttribute('d') || '')
		);
		expect(trackPaths).toHaveLength(5);
		for (const d of trackPaths) expect(d).not.toContain('A5,5,');

		// The shortest bar does stop short, so the track must be wider than it.
		const shortest = (await bars(page).nth(4).getAttribute('d'))!;
		expect(shortest).toContain('A5,5,');
	});

	test('the legend keeps data order rather than sorting by name', async ({ page }) => {
		await open(page, 'ex-radial-chart');
		// Recharts' radial legend payload puts the row's literal `name` in `value`, which our rows
		// do not have — so `itemSorter="value"` is a no-op and data order survives. The pie, whose
		// payload really does carry the sector name, sorts alphabetically instead (DEVIATIONS A-10).
		const labels = await page
			.locator('.select-none > button')
			.evaluateAll((nodes) => nodes.map((n) => n.textContent!.trim()));
		expect(labels).toEqual(['Chrome', 'Safari', 'Firefox', 'Edge', 'Other']);
	});

	test('clicking a bar dims the others', async ({ page }) => {
		await open(page, 'ex-radial-chart');

		const before = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity') ?? 1))
		);
		expect(before.every((o) => o === 1)).toBe(true);

		const point = await pointInBar(page, 1, 0);
		await page.mouse.click(point.x, point.y);
		await page.waitForTimeout(300);

		const after = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity') ?? 1))
		);
		// The reference dims every unselected bar to 0.15.
		expect(after[1]).toBe(1);
		expect(after.filter((o) => o === 0.15)).toHaveLength(4);
	});

	test('keyboard activation selects and clears a radial bar', async ({ page }) => {
		await open(page, 'ex-radial-chart');
		const bar = plot(page).locator('[role="button"]').first();
		await bar.focus();
		await page.keyboard.press('Enter');
		await expect(bar).toHaveAttribute('aria-pressed', 'true');
		expect(Number(await bars(page).nth(1).getAttribute('opacity'))).toBe(0.15);

		await page.keyboard.press('Space');
		await expect(bar).toHaveAttribute('aria-pressed', 'false');
	});

	test('clicking a legend entry dims the other bars', async ({ page }) => {
		await open(page, 'ex-radial-chart');
		const entries = page.locator('.select-none > button');
		await expect(entries).toHaveCount(5);
		// Entries are ordered by name, not data order (DEVIATIONS A-10).
		await entries.filter({ hasText: 'Safari' }).click();
		await page.waitForTimeout(300);

		const opacities = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity') ?? 1))
		);
		// Bars stay in data order: chrome, safari, firefox, edge, other.
		expect(opacities[1]).toBe(1);
		expect(opacities[0]).toBe(0.15);
	});

	test('hovering a bar shows its own tooltip row', async ({ page }) => {
		await open(page, 'ex-radial-chart');

		const expected = [
			['Chrome', '275'],
			['Safari', '200'],
			['Other', '90']
		] as const;

		for (const [index, [name, value]] of [
			[0, expected[0]],
			[1, expected[1]],
			[4, expected[2]]
		] as const) {
			const point = await pointInBar(page, index, 0);
			await page.mouse.move(point.x, point.y);
			await page.waitForTimeout(240);

			const text = (await page.locator('.min-w-32').first().innerText()).replace(/\s+/g, ' ');
			// `hideLabel` is set for the radial chart, so the row is the bar name plus its value.
			expect(text, name).toContain(name);
			expect(text, name).toContain(value);

			const paint = await page
				.locator('.min-w-32 .shrink-0')
				.first()
				.evaluate((n) => {
					const s = getComputedStyle(n);
					return { background: s.backgroundColor, width: s.width };
				});
			expect(paint.width, name).toBe('10px');
			expect(paint.background, name).not.toBe('rgba(0, 0, 0, 0)');
		}
	});

	test('the loading skeleton replaces the bars and hides the legend', async ({ page }) => {
		await open(page, 'ex-loading-state-radial-chart');
		await expect(page.getByText('Loading')).toBeVisible();
		// The reference hides the radial legend while loading.
		await expect(page.locator('.select-none')).toHaveCount(0);

		const skeleton = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => ({ fill: n.getAttribute('fill'), o: n.getAttribute('fill-opacity') }))
		);
		expect(skeleton).toHaveLength(5);
		expect(skeleton.every((s) => s.fill === 'currentColor' && s.o === '0.25')).toBe(true);

		const loadingRadii = await tracks(page).evaluateAll((nodes) =>
			nodes.map((node) => {
				const radii = [...(node.getAttribute('d') || '').matchAll(/A([\d.]+),\1,/g)]
					.map((match) => Number(match[1]))
					.filter((radius) => radius > 10);
				return { inner: Math.min(...radii), outer: Math.max(...radii) };
			})
		);
		// Recharts floors the leading half-gap when it centres a 14px bar in each radial band.
		expect(loadingRadii).toEqual([
			{ inner: 51.7, outer: 65.7 },
			{ inner: 73.96, outer: 87.96 },
			{ inner: 96.22, outer: 110.22 },
			{ inner: 118.48, outer: 132.48 },
			{ inner: 140.74, outer: 154.74 }
		]);
	});

	test('the bars sweep out from the start angle on mount', async ({ page }) => {
		// The reference never disables Recharts' `<RadialBar>` animation, which interpolates each
		// bar's `endAngle` from its `startAngle` over 1.5s. See plans/DEVIATIONS.md A-14.
		await page.goto('/preview/ex-radial-chart?w=630&h=360');
		await page.waitForSelector('[data-preview-ready]');

		// The widest bar closes into a full ring only once the sweep finishes; mid-sweep it still
		// carries rounded end caps. At t=0 it has no sweep at all, so sample just after the start.
		const capsOf = () =>
			bars(page)
				.first()
				.evaluate((n) => (n.getAttribute('d') || '').includes('A5,5,'));

		await page.waitForTimeout(300);
		expect(await capsOf()).toBe(true);

		await page.waitForTimeout(1800);
		expect(await capsOf()).toBe(false);
	});
});
