import { expect, test, type Page } from '@playwright/test';

const EXAMPLES = [
	'ex-animated-dashed-stroke-area-chart',
	'ex-area-chart',
	'ex-brush-area-chart',
	'ex-bump-curve-type-area-chart',
	'ex-dashed-stroke-area-chart',
	'ex-default-type-area-chart',
	'ex-dotted-area-variant-area-chart',
	'ex-expanded-type-area-chart',
	'ex-gradient-area-variant-area-chart',
	'ex-gradient-colors-area-chart',
	'ex-gradient-colors-bump-area-chart',
	'ex-gradient-reverse-area-variant-area-chart',
	'ex-hatched-area-variant-area-chart',
	'ex-lines-area-variant-area-chart',
	'ex-loading-state-area-chart',
	'ex-monotoney-curve-type-area-chart',
	'ex-solid-area-variant-area-chart',
	'ex-solid-stroke-area-chart',
	'ex-stacked-type-area-chart',
	'ex-step-curve-type-area-chart'
] as const;

/** Fill variant → the `<pattern>` id suffix its `<Area>` must emit. */
const FILL_VARIANTS: Record<string, string> = {
	'ex-gradient-area-variant-area-chart': 'gradient',
	'ex-gradient-reverse-area-variant-area-chart': 'gradient-reverse',
	'ex-solid-area-variant-area-chart': 'solid',
	'ex-dotted-area-variant-area-chart': 'dotted',
	'ex-lines-area-variant-area-chart': 'lines',
	'ex-hatched-area-variant-area-chart': 'hatched'
};

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(String(e)));
	return errors;
}

/** The main plot's SVG. The brush footer renders a second `<Svg>` with the same class names. */
function plot(page: Page) {
	return page.locator('svg.lc-layout-svg').first();
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await page.waitForSelector('[data-preview-ready]');
	await page.waitForTimeout(1400); // let the intro reveal finish
	return errors;
}

test.describe('EvilAreaChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			// The plot must be measured, not sitting at LayerChart's 100x100 fallback.
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);

			// Every example composes a Grid; the axes are hidden while loading, as in the reference.
			await expect(page.locator('.lc-grid-y-line').first()).toBeAttached();
			if (name !== 'ex-loading-state-area-chart') {
				await expect(plot(page).locator('text').first()).toBeAttached();
			}

			expect(errors).toEqual([]);
		});
	}

	test('draws one fill path and one stroke path per series', async ({ page }) => {
		await open(page, 'ex-area-chart');
		const fills = plot(page).locator('path.lc-area-path');
		const lines = plot(page).locator('path.lc-area-line');
		await expect(fills).toHaveCount(2);
		await expect(lines).toHaveCount(2);
		// Recharts leaves the fill unstroked so the closing bottom edge is never drawn.
		expect(await fills.first().getAttribute('stroke')).toBe('none');
		expect(await lines.first().getAttribute('stroke-width')).toBe('0.8');
		expect(await lines.first().getAttribute('stroke-dasharray')).toBe('3 3');
	});

	test('each fill variant emits its own pattern', async ({ page }) => {
		for (const [name, variant] of Object.entries(FILL_VARIANTS)) {
			await open(page, name);
			const fill = await plot(page).locator('path.lc-area-path').first().getAttribute('fill');
			expect(fill, name).toMatch(new RegExp(`-${variant}\\)$`));
		}
	});

	test('the legend reflects the config labels and dims on selection', async ({ page }) => {
		await open(page, 'ex-area-chart');
		const entries = page.locator('.select-none > button');
		await expect(entries).toHaveCount(2);
		await expect(entries.first()).toHaveText('Desktop');
		await expect(entries.nth(1)).toHaveText('Mobile');

		await entries.first().click();
		await page.waitForTimeout(200);
		expect(await entries.nth(1).getAttribute('class')).toContain('opacity-30');

		// Clicking the selected entry again clears the selection.
		await entries.first().click();
		await page.waitForTimeout(200);
		expect(await entries.nth(1).getAttribute('class')).not.toContain('opacity-30');
	});

	test('selecting a series stripes the others with the unselected pattern', async ({ page }) => {
		await open(page, 'ex-area-chart');
		await page.locator('.select-none > button').first().click();
		await page.waitForTimeout(200);
		const fills = plot(page).locator('path.lc-area-path');
		expect(await fills.nth(1).getAttribute('fill')).toMatch(/-unselected\)$/);
	});

	test('hovering shows a tooltip with the config labels and formatted values', async ({ page }) => {
		await open(page, 'ex-area-chart');
		const svg = plot(page);
		const box = (await svg.boundingBox())!;
		await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
		await page.waitForTimeout(300);

		const tooltip = page.locator('.min-w-32');
		await expect(tooltip).toBeVisible();
		await expect(tooltip).toContainText('Desktop');
		await expect(tooltip).toContainText('Mobile');
		// Values are localized; the June row is 781 / 598.
		await expect(tooltip).toContainText(/\d/);
	});

	test('the expanded stack formats the value axis as percentages', async ({ page }) => {
		await open(page, 'ex-expanded-type-area-chart');
		const labels = await plot(page).locator('text').allTextContents();
		expect(labels.some((l) => l.trim().endsWith('%'))).toBe(true);
	});

	test('the loading state shows the skeleton and hides the real series', async ({ page }) => {
		await open(page, 'ex-loading-state-area-chart');
		await expect(page.getByText('Loading')).toBeVisible();
		// The skeleton draws one area; the configured series step aside.
		await expect(plot(page).locator('path.lc-area-path')).toHaveCount(1);
		await expect(page.locator('[id$="-loading-mask"]')).toBeAttached();
	});

	test('the brush example renders its footer and filters the plot', async ({ page }) => {
		await open(page, 'ex-brush-area-chart');
		const brush = page.locator('.group.relative.select-none');
		await expect(brush).toBeVisible();
		expect(Math.round((await brush.boundingBox())!.height)).toBe(56);

		const before = await plot(page).locator('text').count();
		const box = (await brush.boundingBox())!;
		const handle = brush.locator('.cursor-ew-resize').first();
		const hb = (await handle.boundingBox())!;
		await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
		await page.mouse.down();
		await page.mouse.move(hb.x + box.width * 0.5, hb.y + hb.height / 2, { steps: 8 });
		await page.mouse.up();
		await page.waitForTimeout(500);

		const after = await plot(page).locator('text').count();
		expect(after).toBeLessThan(before);
	});

	test('the tooltip paints its colour indicator from the chart variables', async ({ page }) => {
		// LayerChart portals its tooltip to `document.body` by default, which would put it outside
		// the `[data-chart]` element that scopes `--color-*` and leave every swatch transparent.
		// See plans/DEVIATIONS.md U-2.
		await open(page, 'ex-area-chart');
		const mark = plot(page).first();
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
		await open(page, 'ex-area-chart');

		const plotBox = (await plot(page).boundingBox())!;
		const label = () => page.locator('.min-w-32 .font-medium').first().innerText();

		const seen: string[] = [];
		for (let i = 0; i <= 11; i += 1) {
			const x = plotBox.x + 5 + ((plotBox.width - 10) * i) / 11;
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

	test('the reveal wipes the fill and the stroke together', async ({ page }) => {
		// LayerChart forwards `<Area mask>` to the fill path only, so the top curve used to appear
		// instantly while the fill wiped in. The mask now sits on a wrapping `<g>`, which is what the
		// reference's element-level `style.mask` covers. See plans/DEVIATIONS.md A-13.
		await page.goto('/preview/ex-area-chart?w=630&h=360');
		await page.waitForSelector('[data-preview-ready]');

		const masked = plot(page).locator('g[mask*="-reveal-mask"]');
		expect(await masked.count()).toBeGreaterThan(0);

		// Both of an area's paths live inside that group.
		const inside = await masked.first().evaluate((n) => ({
			fill: n.querySelectorAll('path.lc-area-path').length,
			line: n.querySelectorAll('path.lc-area-line').length
		}));
		expect(inside).toEqual({ fill: 1, line: 1 });

		// And the mask rect is mid-wipe rather than already finished.
		const early = await plot(page)
			.locator('mask[id*="-reveal-mask"] rect')
			.first()
			.evaluate((n) => new DOMMatrixReadOnly(getComputedStyle(n).transform).a);
		expect(early).toBeLessThan(1);

		await page.waitForTimeout(1400);
		const done = await plot(page)
			.locator('mask[id*="-reveal-mask"] rect')
			.first()
			.evaluate((n) => new DOMMatrixReadOnly(getComputedStyle(n).transform).a);
		expect(done).toBeCloseTo(1, 1);
	});
});
