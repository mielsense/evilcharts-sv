import { expect, test, type Page } from '@playwright/test';
import { waitForPreview } from '$site/testing/wait-for-preview.js';

const BAR_VARIANTS = {
	'ex-duotone-variant-composed-chart': 'duotone',
	'ex-gradient-variant-composed-chart': 'gradient',
	'ex-hatched-variant-composed-chart': 'hatched',
	'ex-stripped-variant-composed-chart': 'stripped'
} as const;

const EXAMPLES = [
	'ex-composed-chart',
	'ex-loading-state-composed-chart',
	'ex-dots-composed-chart',
	'ex-dashed-stroke-composed-chart',
	'ex-animated-dashed-stroke-composed-chart',
	'ex-bump-curve-composed-chart',
	...Object.keys(BAR_VARIANTS),
	'ex-gradient-colors-composed-chart',
	'ex-glowing-composed-chart',
	'ex-hover-highlight-composed-chart'
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

/** Only the painted bars; each bar also has a transparent hit-area twin. */
function bars(page: Page) {
	return plot(page).locator('.lc-bar:not([fill="transparent"])');
}

/** The visible line stroke — the clickable hit area is a second, transparent spline. */
function line(page: Page) {
	return plot(page).locator('.lc-path:not([stroke="transparent"])');
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await waitForPreview(page);
	await page.waitForTimeout(1500); // let the reveal and the staggered grow-in finish
	return errors;
}

test.describe('EvilComposedChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			const svg = plot(page);
			await expect(svg).toBeVisible();
			expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);
			await expect(page.locator('.lc-grid-y-line').first()).toBeAttached();
			await expect(bars(page).first()).toBeAttached();

			// The loading example replaces both the bars and the line with one skeleton.
			if (name !== 'ex-loading-state-composed-chart') {
				await expect(line(page).first()).toBeAttached();
			}

			const variant = BAR_VARIANTS[name as keyof typeof BAR_VARIANTS];
			if (variant) {
				const fills = await bars(page).evaluateAll((nodes) =>
					nodes.map((n) => n.getAttribute('fill'))
				);
				expect(
					fills.some((f) => f?.includes(`-${variant})`)),
					variant
				).toBe(true);
				await expect(plot(page).locator(`pattern[id$="-${variant}"]`)).toBeAttached();
			}

			expect(errors).toEqual([]);
		});
	}

	test('the line runs through the centre of each bar band', async ({ page }) => {
		await open(page, 'ex-composed-chart');

		// A lone bar takes the whole category, as it does in Recharts.
		await expect(bars(page)).toHaveCount(12);
		const band = await bars(page)
			.first()
			.evaluate((n) => ({
				x: Number(n.getAttribute('x')),
				w: Number(n.getAttribute('width'))
			}));

		const d = (await line(page).first().getAttribute('d'))!;
		const firstX = Number(d.match(/^M([\d.]+),/)![1]);
		expect(firstX).toBeCloseTo(band.x + band.w / 2, 1);
	});

	test('the edge legend preserves the reference grid, bar, and line geometry', async ({ page }) => {
		await page.goto('/preview/ex-composed-chart?w=632&h=360');
		await waitForPreview(page);
		await page.waitForTimeout(1600);

		const gridY = await plot(page)
			.locator('.lc-grid-y-line')
			.evaluateAll((nodes) =>
				nodes.map((node) => {
					const box = (node as SVGGraphicsElement).getBBox();
					const matrix = (node as SVGGraphicsElement).getCTM()!;
					return new DOMPoint(box.x, box.y).matrixTransform(matrix).y;
				})
			);
		expect(gridY.toSorted((a, b) => a - b)).toEqual([37, 86, 135, 184, 233]);

		const firstBar = await bars(page)
			.first()
			.evaluate((node) => {
				const box = (node as SVGGraphicsElement).getBBox();
				const matrix = (node as SVGGraphicsElement).getCTM()!;
				const point = new DOMPoint(box.x, box.y).matrixTransform(matrix);
				return { x: point.x, y: point.y, width: box.width, height: box.height };
			});
		expect(firstBar.x).toBeCloseTo(9.9, 1);
		expect(firstBar.y).toBeCloseTo(150.68, 1);
		expect(firstBar.width).toBeCloseTo(39, 1);
		expect(firstBar.height).toBeCloseTo(82.32, 1);

		const firstLinePoint = await line(page)
			.first()
			.evaluate((node) => {
				const match = node.getAttribute('d')!.match(/^M(-?[\d.]+),(-?[\d.]+)/)!;
				const matrix = (node as SVGGraphicsElement).getCTM()!;
				const point = new DOMPoint(Number(match[1]), Number(match[2])).matrixTransform(matrix);
				return { x: point.x, y: point.y };
			});
		expect(firstLinePoint.x).toBeCloseTo(29.5, 1);
		expect(firstLinePoint.y).toBeCloseTo(197.72, 1);
	});

	test('bars are rounded on every corner at the reference radius', async ({ page }) => {
		await open(page, 'ex-composed-chart');
		const shape = await bars(page)
			.first()
			.evaluate((n) => ({ tag: n.tagName, rx: n.getAttribute('rx') }));
		expect(shape).toEqual({ tag: 'rect', rx: '4' });
	});

	test('the line is 2px wide and paints from its own horizontal gradient', async ({ page }) => {
		await open(page, 'ex-composed-chart');
		const stroke = await line(page)
			.first()
			.evaluate((n) => ({
				width: n.getAttribute('stroke-width'),
				paint: n.getAttribute('stroke')
			}));
		expect(stroke.width).toBe('2');
		expect(stroke.paint).toMatch(/-line-colors-profit\)$/);

		// A horizontal gradient runs x1=0 → x2=1.
		const gradient = plot(page).locator('linearGradient[id$="-line-colors-profit"]');
		await expect(gradient).toHaveAttribute('x1', '0');
		await expect(gradient).toHaveAttribute('x2', '1');
	});

	test('the bar gradient runs vertically', async ({ page }) => {
		await open(page, 'ex-composed-chart');
		const gradient = plot(page).locator('linearGradient[id$="-bar-colors"]').first();
		await expect(gradient).toHaveAttribute('y1', '0');
		await expect(gradient).toHaveAttribute('y2', '1');
	});

	test('the animated dash moves without changing its pattern or path geometry', async ({
		page
	}) => {
		await open(page, 'ex-dashed-stroke-composed-chart');
		await expect(line(page).first()).toHaveAttribute('stroke-dasharray', '5 5');

		await open(page, 'ex-animated-dashed-stroke-composed-chart');
		// The animated variant moves a fixed dash pattern instead of shrinking it to zero.
		const animated = line(page).first();
		await expect(animated).toHaveClass(/evil-composed-animated-dash/);
		const samples: Array<{ dasharray: string; dashoffset: string; path: string | null }> = [];
		for (let index = 0; index < 6; index += 1) {
			samples.push(
				await animated.evaluate((node) => {
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
		const timing = await animated.evaluate((node) => {
			const style = getComputedStyle(node);
			return {
				name: style.animationName,
				duration: style.animationDuration,
				timing: style.animationTimingFunction
			};
		});
		// Svelte scopes component-local `@keyframes` names, so match on the suffix.
		expect(timing.name).toMatch(/evil-composed-dash-offset$/);
		expect(timing.duration).toBe('1s');
		expect(timing.timing).toBe('linear');
		expect(new Set(samples.map(({ dasharray }) => dasharray))).toEqual(new Set(['5px, 5px']));
		expect(new Set(samples.map(({ dashoffset }) => dashoffset)).size).toBeGreaterThan(1);
		expect(new Set(samples.map(({ path }) => path)).size).toBe(1);
	});

	test('the animated dash stops for reduced motion', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await open(page, 'ex-animated-dashed-stroke-composed-chart');
		const style = await line(page)
			.first()
			.evaluate((node) => {
				const computed = getComputedStyle(node);
				return { animation: computed.animationName, dasharray: computed.strokeDasharray };
			});
		expect(style).toEqual({ animation: 'none', dasharray: '5px, 5px' });
	});

	test('the stripped variant is a square body plus a 2px cap', async ({ page }) => {
		await open(page, 'ex-stripped-variant-composed-chart');
		// Body plus cap for each of the 12 rows.
		await expect(bars(page)).toHaveCount(24);
		const shape = await bars(page).evaluateAll((nodes) => {
			const rects = nodes.map((n) => ({
				y: Number(n.getAttribute('y')),
				h: Number(n.getAttribute('height')),
				rx: n.getAttribute('rx')
			}));
			return {
				caps: rects.filter((r) => r.h === 2).length,
				squareCornered: rects.every((r) => r.rx === '0' || r.rx === null),
				// The cap sits flush with the top of the body it belongs to.
				capFlush: rects[0].y === rects[1].y
			};
		});
		expect(shape).toEqual({ caps: 12, squareCornered: true, capFlush: true });
	});

	test('the bump curve bends between points', async ({ page }) => {
		await open(page, 'ex-bump-curve-composed-chart');
		// A bump curve is emitted as cubic segments; a linear one is straight lines.
		expect(await line(page).first().getAttribute('d')).toContain('C');

		await open(page, 'ex-composed-chart');
		expect(await line(page).first().getAttribute('d')).not.toContain('C');
	});

	test('dots render at the reference geometry and follow the reveal mask', async ({ page }) => {
		await open(page, 'ex-dots-composed-chart');
		// Each default dot is a full-width gradient rect clipped to an r=3 circle.
		const dots = plot(page).locator('clipPath circle[r="3"]');
		await expect(dots).toHaveCount(12);
		// Resting dots wipe in with the line, so their wrapper carries its mask.
		const masked = plot(page).locator('g[mask*="-reveal-mask"]');
		expect(await masked.count()).toBeGreaterThanOrEqual(12);
	});

	test('the glowing example wires both glow filters', async ({ page }) => {
		await open(page, 'ex-glowing-composed-chart');

		const barGlow = plot(page).locator('filter[id$="-glow"]').first();
		await expect(barGlow).toBeAttached();
		const regions = await plot(page)
			.locator('filter[id$="-glow"]')
			.evaluateAll((nodes) =>
				nodes.map((n) => ({
					x: n.getAttribute('x'),
					width: n.getAttribute('width'),
					blur: n.querySelector('feGaussianBlur')?.getAttribute('stdDeviation')
				}))
			);
		// One filter per series: the bar's is stdDeviation 8 over a 300% region, the line's
		// stdDeviation 10 over 200%.
		expect(regions).toEqual(
			expect.arrayContaining([
				{ x: '-100%', width: '300%', blur: '8' },
				{ x: '-50%', width: '200%', blur: '10' }
			])
		);

		expect(await bars(page).first().getAttribute('filter')).toMatch(/-glow\)$/);
		expect(await line(page).first().getAttribute('filter')).toMatch(/-glow\)$/);
	});

	test('the multi-stop config paints every colour', async ({ page }) => {
		await open(page, 'ex-gradient-colors-composed-chart');
		const stops = await plot(page)
			.locator('linearGradient[id$="-bar-colors"] stop')
			.evaluateAll((nodes) => nodes.length);
		expect(stops).toBe(5);
	});

	test('the reveal mask wipes the line in from the left', async ({ page }) => {
		await page.goto('/preview/ex-composed-chart?w=630&h=360');
		await waitForPreview(page);
		const mask = plot(page).locator('mask[id$="-reveal-mask"]').first();
		await expect(mask).toBeAttached();
		const rect = mask.locator('rect');
		await expect(rect).toHaveAttribute('x', '0%');

		const early = Number.parseFloat((await rect.getAttribute('width')) ?? '100');
		expect(early).toBeGreaterThan(0);
		expect(early).toBeLessThan(100);

		await page.waitForTimeout(200);
		const later = Number.parseFloat((await rect.getAttribute('width')) ?? '0');
		expect(later).toBeGreaterThan(early);

		await expect(rect).toHaveAttribute('width', '100%');
	});

	test('clicking a legend entry dims the other series', async ({ page }) => {
		await open(page, 'ex-composed-chart');
		// Entries are ordered by series name, not config order (DEVIATIONS A-10), so pick by label.
		const entry = (name: string) => page.locator('.select-none > button').filter({ hasText: name });

		await entry('Revenue').click(); // the bar
		await page.waitForTimeout(300);

		expect(await entry('Profit').getAttribute('class')).toContain('opacity-30');
		// The unselected line dims to 0.3.
		expect(Number(await line(page).first().getAttribute('stroke-opacity'))).toBeCloseTo(0.3, 2);

		await entry('Profit').click(); // the line
		await page.waitForTimeout(300);
		const barOpacities = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity')))
		);
		// The reference dims unselected bars to 0.15.
		expect(barOpacities).toContain(0.15);
	});

	test('hovering shows the tooltip and its dashed cursor', async ({ page }) => {
		await open(page, 'ex-composed-chart');
		const box = (await bars(page).nth(4).boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.waitForTimeout(300);

		await expect(page.locator('.min-w-32')).toBeVisible();
		const cursor = plot(page).locator('.lc-highlight-line').first();
		await expect(cursor).toBeAttached();
		expect(await cursor.getAttribute('stroke-dasharray')).toBe('3 3');
		expect(await cursor.getAttribute('stroke-width')).toBe('2');
	});

	test('hovering does not dim the bars', async ({ page }) => {
		// `enableHoverHighlight` is inert in the reference too: it declares `hoveredIndex`
		// but only ever resets it to null, so no column is ever marked hovered.
		await open(page, 'ex-hover-highlight-composed-chart');
		const box = (await bars(page).first().boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.waitForTimeout(300);

		const opacities = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => Number(n.getAttribute('opacity')))
		);
		expect(opacities.every((o) => o === 1)).toBe(true);
	});

	test('the loading state shows the skeleton in place of the bars and line', async ({ page }) => {
		await open(page, 'ex-loading-state-composed-chart');
		await expect(page.getByText('Loading')).toBeVisible();
		await expect(page.locator('[id$="-loading-mask"]')).toBeAttached();
		await expect(line(page)).toHaveCount(0);

		const skeleton = await bars(page).evaluateAll((nodes) =>
			nodes.map((n) => ({ fill: n.getAttribute('fill'), o: n.getAttribute('fill-opacity') }))
		);
		// `loadingBars` defaults to 12 in the reference, independent of how many rows the
		// example passes.
		expect(skeleton.length).toBe(12);
		expect(skeleton.every((b) => b.fill === 'currentColor' && b.o === '0.15')).toBe(true);

		const geometry = await bars(page).evaluateAll((nodes) => ({
			x: nodes.map((n) => Number(n.getAttribute('x'))),
			width: Number(nodes[0]?.getAttribute('width')),
			transform: nodes[0]?.closest('.lc-layout-svg-g')?.getAttribute('transform')
		}));
		expect(new Set(geometry.x).size).toBe(12);
		expect(geometry.x.at(-1)! - geometry.x[0]).toBeGreaterThan(500);
		expect(geometry.width).toBeCloseTo(39, 0);
		expect(geometry.transform).toBe('translate(5, 5)');
	});

	test('the brush footer filters the plot', async ({ page }) => {
		await open(page, 'ex-composed-chart');
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
		// The portaled root repeats the chart's `data-chart` value so the scoped variables resolve.
		await open(page, 'ex-composed-chart');
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
		await open(page, 'ex-composed-chart');

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
});
