import { expect, test, type Page } from '@playwright/test';

const LEGEND_VARIANTS = [
	'square',
	'circle',
	'circle-outline',
	'rounded-square',
	'rounded-square-outline',
	'vertical-bar',
	'horizontal-bar'
] as const;

const BG_VARIANTS = [
	'dots',
	'grid',
	'cross-hatch',
	'diagonal-lines',
	'plus',
	'falling-triangles',
	'4-pointed-star',
	'tiny-checkers',
	'overlapping-circles',
	'wiggle-lines',
	'bubbles'
] as const;

const EXAMPLES = [
	'ex-line-chart',
	'ex-loading-state-line-chart',
	'ex-solid-stroke-line-chart',
	'ex-dashed-stroke-line-chart',
	'ex-animated-dashed-stroke-line-chart',
	'ex-bump-curve-type-line-chart',
	'ex-step-curve-type-line-chart',
	'ex-monotoney-curve-type-line-chart',
	'ex-gradient-colors-line-chart',
	'ex-gradient-colors-bump-line-chart',
	'ex-dot-default-line-chart',
	'ex-dot-border-line-chart',
	'ex-dot-colored-border-line-chart',
	'ex-glowing-desktop-line-chart',
	'ex-glowing-mobile-line-chart',
	'ex-buffer-line-chart',
	...LEGEND_VARIANTS.map((v) => `ex-legend-${v}-line-chart`),
	...BG_VARIANTS.map((v) => `ex-bg-${v}-line-chart`)
] as const;

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

/** Every LayerChart path carries `lc-path`; a clickable line adds a transparent hit-area twin. */
function splines(page: Page) {
	return plot(page).locator('path.lc-path');
}

/** Only the visible stroke, excluding the invisible 15px hit area. */
function visibleSplines(page: Page) {
	return plot(page).locator('path.lc-path:not([stroke="transparent"])');
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await page.waitForSelector('[data-preview-ready]');
	await page.waitForTimeout(1400); // let the intro reveal finish
	return errors;
}

test.describe('EvilLineChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			// The plot must be measured, not sitting at LayerChart's 100x100 fallback.
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);

			// Background examples must paint their pattern through the edge-fade mask, behind the
			// lines — asserted here rather than in a loop of its own so each variant is one page load.
			const bgVariant = BG_VARIANTS.find((v) => name === `ex-bg-${v}-line-chart`);
			if (bgVariant) {
				await expect(plot(page).locator(`pattern[id*="-bg-${bgVariant}"]`)).toBeAttached();
				await expect(plot(page).locator('rect[mask*="-bg-edge-fade"]')).toBeAttached();
			}

			if (name !== 'ex-loading-state-line-chart') {
				// One visible stroke per series, plus a transparent hit-area twin when clickable.
				await expect(visibleSplines(page)).toHaveCount(2);
				await expect(splines(page)).toHaveCount(
					name.startsWith('ex-legend-') || name.startsWith('ex-dot-') ? 2 : 4
				);
				await expect(plot(page).locator('text').first()).toBeAttached();
			}

			expect(errors).toEqual([]);
		});
	}

	test('the default stroke is solid at the reference width', async ({ page }) => {
		await open(page, 'ex-solid-stroke-line-chart');
		const line = visibleSplines(page).last();
		expect(await line.getAttribute('stroke-width')).toBe('0.8');
		expect(await line.getAttribute('stroke-dasharray')).toBeNull();
	});

	test('reserves the original top legend band and value-axis ticks', async ({ page }) => {
		await open(page, 'ex-solid-stroke-line-chart');
		expect(await plot(page).locator('.lc-layout-svg-g').getAttribute('transform')).toBe(
			'translate(47, 37)'
		);
		const labels = await plot(page).locator('.lc-axis.placement-left text').allTextContents();
		expect(labels).toEqual(['0', '250', '500', '750', '1000']);
		const plotOrigin = await plot(page)
			.locator('.lc-layout-svg-g')
			.evaluate((node) => (node as SVGGraphicsElement).getScreenCTM()!.e);
		const rightEdges = await plot(page)
			.locator('.lc-axis.placement-left text')
			.evaluateAll(
				(nodes, origin) => nodes.map((node) => node.getBoundingClientRect().right - origin),
				plotOrigin
			);
		for (const edge of rightEdges) expect(edge).toBeCloseTo(-14, 0);
	});

	test('matches the original solid-line point geometry at the reference width', async ({
		page
	}) => {
		await page.goto('/preview/ex-solid-stroke-line-chart?w=632&h=360');
		await page.waitForSelector('[data-preview-ready]');
		await page.waitForTimeout(1400);

		const points = await visibleSplines(page)
			.first()
			.evaluate((node) => {
				const values = [...node.getAttribute('d')!.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)];
				const matrix = (node as SVGGraphicsElement).getCTM()!;
				return values.map(([, x, y]) => {
					const point = new DOMPoint(Number(x), Number(y)).matrixTransform(matrix);
					return [point.x, point.y];
				});
			});

		const expectedY = [
			205.448, 68.744, 161.928, 131.976, 175.752, 93.064, 192.136, 56.2, 127.368, 156.808, 87.432,
			223.624
		];
		expect(points).toHaveLength(12);
		for (const [index, [x, y]] of points.entries()) {
			expect(x).toBeCloseTo(47 + (546 * index) / 11, 2);
			expect(y).toBeCloseTo(expectedY[index], 2);
		}
	});

	test('the dashed stroke uses the reference 5 5 pattern', async ({ page }) => {
		await open(page, 'ex-dashed-stroke-line-chart');
		const dashed = visibleSplines(page).and(page.locator('[stroke-dasharray]')).first();
		expect(await dashed.getAttribute('stroke-dasharray')).toBe('5 5');
	});

	test('the animated dash moves without changing its pattern or path geometry', async ({
		page
	}) => {
		await open(page, 'ex-animated-dashed-stroke-line-chart');
		const stroke = plot(page).locator('path.evil-line-animated-dash').first();
		const samples: Array<{ dasharray: string; dashoffset: string; path: string | null }> = [];

		for (let index = 0; index < 6; index += 1) {
			samples.push(
				await stroke.evaluate((node) => {
					const style = getComputedStyle(node);
					return {
						dasharray: style.strokeDasharray,
						dashoffset: style.strokeDashoffset,
						path: node.getAttribute('d')
					};
				})
			);
			await page.waitForTimeout(120);
		}

		expect(new Set(samples.map(({ dasharray }) => dasharray))).toEqual(new Set(['5px, 5px']));
		expect(new Set(samples.map(({ dashoffset }) => dashoffset)).size).toBeGreaterThan(1);
		expect(new Set(samples.map(({ path }) => path)).size).toBe(1);
	});

	test('the animated dash stops for reduced motion', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await open(page, 'ex-animated-dashed-stroke-line-chart');
		const style = await plot(page)
			.locator('path.evil-line-animated-dash')
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return { animation: computed.animationName, dasharray: computed.strokeDasharray };
			});
		expect(style).toEqual({ animation: 'none', dasharray: '5px, 5px' });
	});

	test('a glowing line references its own blur filter', async ({ page }) => {
		await open(page, 'ex-glowing-desktop-line-chart');
		const glowing = plot(page).locator('path[filter]').first();
		expect(await glowing.getAttribute('filter')).toMatch(/-glow-desktop\)$/);
		await expect(plot(page).locator('filter[id$="-glow-desktop"]')).toBeAttached();
	});

	test('the buffer line splits its dasharray into a solid run plus dashes', async ({ page }) => {
		await open(page, 'ex-buffer-line-chart');
		const dash = await visibleSplines(page)
			.and(page.locator('[stroke-dasharray]'))
			.first()
			.getAttribute('stroke-dasharray');
		// `<solidLength> 0 4 3 4 3 …` — a long solid run, then repeating 4/3 dashes.
		expect(dash).toMatch(/^\d+(\.\d+)? 0( 4 3)+$/);
		expect(Number(dash!.split(' ')[0])).toBeGreaterThan(50);
	});

	test('each dot variant emits its own clip structure', async ({ page }) => {
		for (const [name, clips] of [
			['ex-dot-default-line-chart', 1],
			['ex-dot-border-line-chart', 2],
			['ex-dot-colored-border-line-chart', 1]
		] as const) {
			await open(page, name);
			// 12 points x 2 series, each dot emitting `clips` clipPaths.
			await expect(plot(page).locator('clipPath')).toHaveCount(24 * clips);
		}
	});

	test('each legend variant renders its documented indicator geometry', async ({ page }) => {
		const geometry: Record<string, string> = {
			square: 'h-2 w-2',
			circle: 'rounded-full',
			'circle-outline': 'h-2.5 w-2.5',
			'rounded-square': 'rounded-[2px]',
			'rounded-square-outline': 'rounded-[3px]',
			'vertical-bar': 'h-3 w-1',
			'horizontal-bar': 'h-1 w-3'
		};
		for (const variant of LEGEND_VARIANTS) {
			await open(page, `ex-legend-${variant}-line-chart`);
			const entry = page.locator('.select-none > div').first();
			// Not clickable in these examples, so entries render as plain divs.
			await expect(entry).toBeAttached();
			expect(await entry.locator('> div').first().getAttribute('class')).toContain(
				geometry[variant]
			);
		}
	});

	test('hovering shows a tooltip and clicking the legend dims the other series', async ({
		page
	}) => {
		await open(page, 'ex-line-chart');
		const box = (await plot(page).boundingBox())!;
		await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
		await page.waitForTimeout(300);
		const tooltip = page.locator('.min-w-32');
		await expect(tooltip).toContainText('June');
		await expect(tooltip).toContainText('Desktop');
		await expect(tooltip).toContainText('781');
		await expect(tooltip).toContainText('449');

		const entries = page.locator('.select-none > button');
		await entries.first().click();
		await page.waitForTimeout(200);
		expect(await entries.nth(1).getAttribute('class')).toContain('opacity-30');
		// The unselected line dims its stroke rather than restyling its fill.
		const strokes = await visibleSplines(page).evaluateAll((nodes) =>
			nodes.map((n) => n.getAttribute('stroke-opacity'))
		);
		expect(strokes).toContain('0.3');
	});

	test('the loading state shows the skeleton and hides the real series', async ({ page }) => {
		await open(page, 'ex-loading-state-line-chart');
		await expect(page.getByText('Loading')).toBeVisible();
		await expect(visibleSplines(page)).toHaveCount(1);
		await expect(page.locator('[id$="-loading-mask"]')).toBeAttached();
	});

	test('the tooltip paints its colour indicator from the chart variables', async ({ page }) => {
		// LayerChart portals its tooltip to `document.body` by default, which would put it outside
		// the `[data-chart]` element that scopes `--color-*` and leave every swatch transparent.
		// See plans/DEVIATIONS.md U-2.
		await open(page, 'ex-line-chart');
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
		await open(page, 'ex-line-chart');

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
});
