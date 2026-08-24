import { expect, test, type Page } from '@playwright/test';

const FILL_VARIANTS = {
	'ex-default-variant-bar-chart': 'colors-desktop',
	'ex-hatched-variant-bar-chart': 'hatched-desktop',
	'ex-duotone-variant-bar-chart': 'duotone-desktop',
	'ex-duotone-reverse-variant-bar-chart': 'duotone-reverse-desktop',
	'ex-gradient-variant-bar-chart': 'gradient-desktop',
	'ex-stripped-variant-bar-chart': 'stripped-desktop'
} as const;

const EXAMPLES = [
	'ex-bar-chart',
	'ex-loading-state-bar-chart',
	...Object.keys(FILL_VARIANTS),
	'ex-stacked-type-bar-chart',
	'ex-percent-type-bar-chart',
	'ex-buffer-bar-chart',
	'ex-glowing-desktop-bar-chart',
	'ex-glowing-mobile-bar-chart',
	'ex-gradient-colors-bar-chart',
	'ex-chart-config-default-bar-chart',
	'ex-chart-config-icons-bar-chart',
	'ex-tooltip-default-bar-chart',
	'ex-tooltip-frosted-glass-bar-chart',
	'ex-hover-highlight-bar-chart',
	'ex-horizontal-layout-bar-chart'
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

/**
 * Only the painted bars; each bar also has a transparent hit-area twin.
 *
 * LayerChart renders a bar as a `<rect rx>` when every corner is rounded and as a `<path>` when
 * only some are (the stripped variant), so match the class rather than the tag.
 */
function bars(page: Page) {
	return plot(page).locator('.lc-bar:not([fill="transparent"])');
}

/**
 * Painted bars for one series. Every `<Bar dataKey>` renders all its rows before the next series
 * does, so DOM order groups by series, not by category — read each series separately when
 * comparing two series in the same category.
 */
function seriesBars(page: Page, key: string) {
	return plot(page).locator(`.lc-bar[fill*="-${key}"]`);
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await page.waitForSelector('[data-preview-ready]');
	await page.waitForTimeout(1500); // let the staggered grow-in finish
	return errors;
}

test.describe('EvilBarChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);
			await expect(page.locator('.lc-grid-y-line, .lc-grid-x-line').first()).toBeAttached();
			await expect(bars(page).first()).toBeAttached();

			expect(errors).toEqual([]);
		});
	}

	test('grouped bars split the band into one sub-band per series', async ({ page }) => {
		await open(page, 'ex-bar-chart');
		const painted = bars(page);
		// 12 rows x 2 series.
		await expect(painted).toHaveCount(24);

		const read = (key: string) =>
			seriesBars(page, key).evaluateAll((nodes) => ({
				x: Number(nodes[0].getAttribute('x')),
				w: Number(nodes[0].getAttribute('width'))
			}));
		const desktop = await read('desktop');
		const mobile = await read('mobile');
		// Both bars in the first category are the same width and sit side by side.
		expect(desktop.w).toBeCloseTo(mobile.w, 1);
		expect(mobile.x).toBeGreaterThan(desktop.x);
		expect(mobile.x).toBeLessThan(desktop.x + desktop.w * 2.5);
	});

	test('mobile settled geometry reserves the bottom legend inside the plot', async ({ page }) => {
		await page.goto('/preview/ex-bar-chart?w=440&h=256');
		await page.waitForSelector('[data-preview-ready]');
		await page.waitForTimeout(1600);
		const height = await seriesBars(page, 'desktop')
			.first()
			.evaluate((node) => (node as SVGGraphicsElement).getBBox().height);
		expect(height).toBeCloseTo(31.46, 0);
	});

	test('each fill variant paints from its own pattern', async ({ page }) => {
		for (const [name, suffix] of Object.entries(FILL_VARIANTS)) {
			await open(page, name);
			// The stripped variant also draws a solid cap, so match against every painted fill.
			const fills = await bars(page).evaluateAll((nodes) =>
				nodes.map((n) => n.getAttribute('fill'))
			);
			const fill = fills.find((f) => f?.includes(`-${suffix}`)) ?? fills[0];
			expect(fill, name).toMatch(new RegExp(`-${suffix}\\)$`));
		}
	});

	test('the stripped variant rounds only the top and adds a solid cap', async ({ page }) => {
		await open(page, 'ex-stripped-variant-bar-chart');
		// Body bar plus cap bar, for 12 rows x 2 series.
		await expect(bars(page)).toHaveCount(48);
		// The caps are 2px `<rect>`s; the partially-rounded bodies are `<path>`s.
		const shape = await bars(page).evaluateAll((nodes) => ({
			caps: nodes.filter((n) => n.tagName === 'rect' && Number(n.getAttribute('height')) === 2)
				.length,
			bodies: nodes.filter((n) => n.tagName === 'path').length
		}));
		expect(shape).toEqual({ caps: 24, bodies: 24 });
	});

	test('stacking puts the series in one band', async ({ page }) => {
		await open(page, 'ex-stacked-type-bar-chart');
		const read = (key: string) =>
			seriesBars(page, key).evaluateAll((nodes) => ({
				x: Number(nodes[0].getAttribute('x')),
				w: Number(nodes[0].getAttribute('width'))
			}));
		const desktop = await read('desktop');
		const mobile = await read('mobile');
		// Stacked segments share the same x and take the full band width.
		expect(desktop.x).toBeCloseTo(mobile.x, 1);
		expect(desktop.w).toBeGreaterThan(25);
	});

	test('the percent stack formats the value axis as percentages', async ({ page }) => {
		await open(page, 'ex-percent-type-bar-chart');
		// No YAxis in this example, so assert the scale instead: every column fills the same height.
		const read = (key: string) =>
			seriesBars(page, key).evaluateAll((nodes) =>
				nodes.map((n) => Number(n.getAttribute('height')))
			);
		const desktop = await read('desktop');
		const mobile = await read('mobile');
		const totals = desktop.map((h, i) => h + mobile[i]);
		// Every normalised column adds up to the same height.
		for (const total of totals.slice(1)) {
			expect(total).toBeCloseTo(totals[0], 0);
		}
	});

	test('the horizontal layout puts the category axis on the left', async ({ page }) => {
		await open(page, 'ex-horizontal-layout-bar-chart');
		await expect(plot(page).locator('.lc-axis.placement-left')).toBeAttached();
		const box = await bars(page).evaluateAll((nodes) => ({
			h: Number(nodes[0].getAttribute('height')),
			w: Number(nodes[0].getAttribute('width'))
		}));
		// Horizontal bars are wider than they are tall.
		expect(box.w).toBeGreaterThan(box.h);
	});

	test('the buffer bar hatches the last column', async ({ page }) => {
		await open(page, 'ex-buffer-bar-chart');
		const fills = await bars(page).evaluateAll((nodes) => nodes.map((n) => n.getAttribute('fill')));
		expect(fills.filter((f) => f?.includes('-buffer-hatched-')).length).toBe(2);
		await expect(plot(page).locator('pattern[id*="-buffer-hatched-desktop"]')).toBeAttached();
	});

	test('a glowing bar references its own blur filter', async ({ page }) => {
		await open(page, 'ex-glowing-desktop-bar-chart');
		await expect(plot(page).locator('filter[id$="-bar-glow-desktop"]')).toBeAttached();
		const filtered = await bars(page).first().getAttribute('filter');
		expect(filtered).toMatch(/-bar-glow-desktop\)$/);
	});

	test('config icons render in the legend instead of the swatch', async ({ page }) => {
		await open(page, 'ex-chart-config-icons-bar-chart');
		await expect(page.locator('.select-none svg').first()).toBeAttached();
	});

	test('the tooltip variants apply their surface classes', async ({ page }) => {
		await open(page, 'ex-tooltip-frosted-glass-bar-chart');
		// `defaultIndex` shows the tooltip with no hover.
		const tooltip = page.locator('.min-w-32');
		await expect(tooltip).toBeVisible();
		expect(await tooltip.getAttribute('class')).toContain('backdrop-blur-sm');

		await open(page, 'ex-tooltip-default-bar-chart');
		expect(await page.locator('.min-w-32').getAttribute('class')).toContain('bg-background');
	});

	test('hover highlight dims the bars that are not hovered', async ({ page }) => {
		await open(page, 'ex-hover-highlight-bar-chart');
		const before = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => n.getAttribute('fill-opacity'))
		);
		expect(before.every((o) => o === '1')).toBe(true);

		const box = (await bars(page).first().boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.waitForTimeout(300);

		const after = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('fill-opacity')))
		);
		expect(after.some((o) => o < 1)).toBe(true);
	});

	test('clicking a legend entry dims the other series', async ({ page }) => {
		await open(page, 'ex-bar-chart');
		const entries = page.locator('.select-none > button');
		await entries.first().click();
		await page.waitForTimeout(250);
		expect(await entries.nth(1).getAttribute('class')).toContain('opacity-30');

		const opacities = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('fill-opacity')))
		);
		// The reference dims unselected bars to 0.15.
		expect(opacities).toContain(0.15);
	});

	test('the loading state shows the skeleton and hides the real bars', async ({ page }) => {
		await open(page, 'ex-loading-state-bar-chart');
		await expect(page.getByText('Loading')).toBeVisible();
		await expect(page.locator('[id$="-loading-mask"]')).toBeAttached();
		const fills = await bars(page).evaluateAll((nodes) => nodes.map((n) => n.getAttribute('fill')));
		expect(fills.every((f) => f === 'currentColor')).toBe(true);
	});

	test('the brush footer filters the plot', async ({ page }) => {
		await open(page, 'ex-bar-chart');
		const brush = page.locator('.group.relative.select-none');
		await expect(brush).toBeVisible();

		const before = await bars(page).count();
		const handle = brush.locator('.cursor-ew-resize').first();
		const hb = (await handle.boundingBox())!;
		const box = (await brush.boundingBox())!;
		await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
		await page.mouse.down();
		await page.mouse.move(hb.x + box.width * 0.5, hb.y + hb.height / 2, { steps: 8 });
		await page.mouse.up();
		await page.waitForTimeout(500);

		expect(await bars(page).count()).toBeLessThan(before);
	});

	test('the tooltip paints its colour indicator from the chart variables', async ({ page }) => {
		// LayerChart portals its tooltip to `document.body` by default, which would put it outside
		// the `[data-chart]` element that scopes `--color-*` and leave every swatch transparent.
		// See plans/DEVIATIONS.md U-2.
		await open(page, 'ex-bar-chart');
		const mark = bars(page).first();
		const box = (await mark.boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.waitForTimeout(400);
		const swatch = page.locator('.min-w-32 .shrink-0').first();
		await expect(swatch).toBeVisible();
		const paint = await swatch.evaluate((n) => {
			const s = getComputedStyle(n);
			return {
				background: s.backgroundColor,
				image: s.backgroundImage,
				width: s.width,
				height: s.height
			};
		});
		// The reference's `indicator="dot"` swatch is 10x10.
		expect([paint.width, paint.height]).toEqual(['10px', '10px']);
		// Either a solid colour or, for a multi-stop config, a gradient — never transparent.
		expect(paint.background !== 'rgba(0, 0, 0, 0)' || paint.image !== 'none').toBe(true);
	});

	test('the tooltip follows the cursor to the nearest category', async ({ page }) => {
		// Two bugs hid here: a `{const}` in the tooltip snippet froze the content on the first row
		// it was shown for (DEVIATIONS A-6c), and `bisect-x` cannot bisect an ordinal domain, so the
		// row was picked essentially at random (DEVIATIONS A-9). Asserting the label tracks the
		// pointer across the plot catches both.
		await open(page, 'ex-bar-chart');

		const plotBox = (await plot(page).boundingBox())!;
		const label = () => page.locator('.min-w-32 .font-medium').first().innerText();

		// Hover the middle of each category's own band rather than even fractions of the plot,
		// which would land in the outer padding at the ends.
		const centres = await page.locator('.lc-axis-tick-label').evaluateAll((nodes) =>
			nodes.map((n) => {
				const r = n.getBoundingClientRect();
				return r.x + r.width / 2;
			})
		);
		expect(centres).toHaveLength(12);

		const seen: string[] = [];
		for (const x of centres) {
			await page.mouse.move(x, plotBox.y + plotBox.height * 0.5);
			await page.waitForTimeout(180);
			seen.push(await label());
		}

		// One reading per month, in order, with nothing repeated or skipped.
		expect(seen).toEqual([
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		]);
	});

	test('a defaultIndex tooltip still follows the pointer', async ({ page }) => {
		// LayerChart resolves its tooltip data as `dataProp ?? ctx.tooltip.data`, so passing the
		// default row unconditionally pinned the tooltip to it forever. See DEVIATIONS A-12.
		await open(page, 'ex-tooltip-frosted-glass-bar-chart');

		const label = () => page.locator('.min-w-32 .font-medium').first().innerText();
		// `defaultIndex={4}` shows May with no hover.
		expect(await label()).toBe('May');

		const centres = await page
			.locator('.lc-axis.placement-bottom .lc-axis-tick-label')
			.evaluateAll((nodes) =>
				nodes.map((n) => {
					const r = n.getBoundingClientRect();
					return r.x + r.width / 2;
				})
			);
		const plotBox = (await plot(page).boundingBox())!;

		await page.mouse.move(centres[0], plotBox.y + plotBox.height * 0.5);
		await page.waitForTimeout(220);
		expect(await label()).toBe('January');

		await page.mouse.move(centres[11], plotBox.y + plotBox.height * 0.5);
		await page.waitForTimeout(220);
		expect(await label()).toBe('December');
	});
});
