import { expect, test, type Page } from '@playwright/test';
import { waitForPreview } from '$site/testing/wait-for-preview.js';

const EXAMPLES = [
	'ex-sankey-chart',
	'ex-labeled-nodes-sankey-chart',
	'ex-solid-labeled-nodes-sankey-chart',
	'ex-outside-labels-sankey-chart',
	'ex-solid-link-variant-sankey-chart',
	'ex-source-link-variant-sankey-chart',
	'ex-gradient-colors-sankey-chart',
	'ex-loading-state-sankey-chart'
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

function nodes(page: Page) {
	// The node rectangle plus, for an inside label, its translucent plate.
	return plot(page).locator('rect[fill^="url(#"], rect[fill="currentColor"]');
}

function links(page: Page) {
	return plot(page).locator('path[fill]:not([fill="none"])');
}

async function open(page: Page, name: string) {
	const errors = collectErrors(page);
	await page.goto(`/preview/${name}?w=630&h=360`);
	await waitForPreview(page);
	await page.waitForTimeout(1400);
	return errors;
}

test.describe('EvilSankeyChart examples', () => {
	for (const name of EXAMPLES) {
		test(`${name} renders cleanly`, async ({ page }) => {
			const errors = await open(page, name);

			if (name === 'ex-loading-state-sankey-chart') {
				// The skeleton replaces the whole diagram, in its own fixed viewBox overlay.
				await expect(page.getByText('Loading')).toBeVisible();
				await expect(page.locator('svg[viewBox="0 0 500 250"]')).toBeVisible();
			} else {
				const svg = plot(page);
				await expect(svg).toBeVisible();
				expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(300);
				await expect(nodes(page).first()).toBeAttached();
				await expect(links(page).first()).toBeAttached();
			}

			expect(errors).toEqual([]);
		});
	}

	test('nodes land where Recharts lays them out', async ({ page }) => {
		await open(page, 'ex-sankey-chart');

		// Heights are the layout's own numbers, independent of the plot width — measured from the
		// reference and asserted in `layout.spec.ts` too. See plans/DEVIATIONS.md S-1.
		const measured = await nodes(page).evaluateAll((els) =>
			els.map((n) => ({
				x: Number(n.getAttribute('x')),
				height: Number(Number(n.getAttribute('height')).toFixed(3))
			}))
		);
		expect(measured).toHaveLength(8);
		expect(measured.map((n) => n.height)).toEqual([
			142.227, 94.818, 60.955, 298, 176.091, 104.977, 81.273, 216.727
		]);

		// `maxDepth` is 4, so five evenly spaced columns, with the leaf nodes justified into the last.
		const columns = [...new Set(measured.map((n) => n.x))].sort((a, b) => a - b);
		expect(columns).toHaveLength(5);
		const step = columns[1] - columns[0];
		columns.forEach((x, index) => expect(x).toBeCloseTo(columns[0] + step * index, 1));
	});

	test('every link ribbon meets its nodes edge to edge', async ({ page }) => {
		await open(page, 'ex-sankey-chart');
		await expect(links(page)).toHaveCount(9);

		const first = (await links(page).first().getAttribute('d'))!;
		// The ribbon starts on the first node's right edge — `nodeWidth` 10 from the plot origin.
		const [, sourceX] = first.match(/^M([\d.]+),/)!;
		expect(Number(sourceX)).toBeCloseTo(10, 1);
		// `linkCurvature` 0.5 puts both control points midway between the two columns.
		const controls = [...first.matchAll(/C([\d.]+),/g)].map((m) => Number(m[1]));
		expect(controls.length).toBeGreaterThanOrEqual(2);
		expect(controls[0]).toBeCloseTo(controls[1], 1);
	});

	test('link variants paint from the right source', async ({ page }) => {
		await open(page, 'ex-solid-link-variant-sankey-chart');
		const solid = await links(page).evaluateAll((els) => els.map((n) => n.getAttribute('fill')));
		expect(solid.every((fill) => fill === 'currentColor')).toBe(true);

		await open(page, 'ex-source-link-variant-sankey-chart');
		const source = await links(page).first().getAttribute('fill');
		// The `source` variant paints from the source node's own gradient, whatever it is named.
		expect(source).toMatch(/-sankey-colors-\w+\)$/);

		await open(page, 'ex-gradient-colors-sankey-chart');
		const gradient = await links(page).first().getAttribute('fill');
		expect(gradient).toMatch(/-link-gradient-0\)$/);
		// Source colour at 0.2 → 0.5, target colour at 0.2.
		const stops = await plot(page)
			.locator('linearGradient[id$="-link-gradient-0"] stop')
			.evaluateAll((els) => els.map((n) => n.getAttribute('stop-opacity')));
		expect(stops).toEqual(['0.2', '0.5', '0.2']);
	});

	test('outside labels sit beside the node with its total', async ({ page }) => {
		await open(page, 'ex-sankey-chart');
		const labels = await plot(page)
			.locator('text')
			.evaluateAll((els) =>
				els.map((n) => ({ text: n.textContent!.trim(), anchor: n.getAttribute('text-anchor') }))
			);
		// One label plus one value per node.
		expect(labels).toHaveLength(16);
		expect(labels.every((l) => l.anchor === 'start')).toBe(true);
		expect(labels.map((l) => l.text)).toContain('Organic Search');
		// `showValues` formats with `toLocaleString`.
		expect(labels.map((l) => l.text)).toContain('42,000');
	});

	test('inside labels draw on a plate over the node', async ({ page }) => {
		await open(page, 'ex-labeled-nodes-sankey-chart');
		const labels = await plot(page)
			.locator('text')
			.evaluateAll((els) => els.map((n) => n.getAttribute('text-anchor')));
		expect(labels.length).toBeGreaterThan(0);
		expect(labels.every((anchor) => anchor === 'middle')).toBe(true);

		// The plate is inset a pixel on every side of its node.
		const plates = await plot(page)
			.locator('rect.fill-white\\/50')
			.evaluateAll((els) => els.length);
		expect(plates).toBe(8);
	});

	test('the node radius and width come from the props', async ({ page }) => {
		await open(page, 'ex-labeled-nodes-sankey-chart');
		const shape = await nodes(page)
			.first()
			.evaluate((n) => ({ rx: n.getAttribute('rx'), width: n.getAttribute('width') }));
		expect(shape).toEqual({ rx: '4', width: '80' });

		await open(page, 'ex-outside-labels-sankey-chart');
		expect(await nodes(page).first().getAttribute('width')).toBe('8');
	});

	test('clicking a node dims everything not connected to it', async ({ page }) => {
		await open(page, 'ex-sankey-chart');

		const before = await nodes(page).evaluateAll((els) =>
			els.map((n) => Number(n.getAttribute('fill-opacity')))
		);
		expect(before.every((o) => o === 0.9)).toBe(true);

		// "Organic" is the first node; it links only to "Landing".
		await nodes(page).first().click();
		await page.waitForTimeout(300);

		const after = await nodes(page).evaluateAll((els) =>
			els.map((n) => Number(n.getAttribute('fill-opacity')))
		);
		// The reference keeps the selected node and its neighbours at 0.9 and dims the rest to 0.15.
		expect(after[0]).toBe(0.9);
		expect(after[3]).toBe(0.9);
		expect(after.filter((o) => o === 0.15).length).toBe(6);

		// Connected links keep their opacity and gain the primary stroke.
		const linkPaint = await links(page).evaluateAll((els) =>
			els.map((n) => ({
				o: Number(n.getAttribute('fill-opacity')),
				stroke: n.getAttribute('stroke')
			}))
		);
		expect(linkPaint.some((l) => l.o === 0.4 && l.stroke?.includes('-link-stroke-'))).toBe(true);
		expect(linkPaint.some((l) => l.o === 0.1 && l.stroke === 'none')).toBe(true);
	});

	test('keyboard activation selects and clears a node', async ({ page }) => {
		await open(page, 'ex-sankey-chart');
		const node = plot(page).locator('g[role="button"]').first();
		await node.focus();
		await page.keyboard.press('Enter');
		await expect(node).toHaveAttribute('aria-pressed', 'true');
		expect(Number(await nodes(page).nth(1).getAttribute('fill-opacity'))).toBe(0.15);

		await page.keyboard.press('Space');
		await expect(node).toHaveAttribute('aria-pressed', 'false');
	});

	test('hovering a node shows its own tooltip row', async ({ page }) => {
		await open(page, 'ex-sankey-chart');

		for (const [index, name, value] of [
			[0, 'Organic Search', '42,000'],
			[3, 'Landing Page', '88,000']
		] as const) {
			const box = (await nodes(page).nth(index).boundingBox())!;
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			await page.waitForTimeout(240);

			const text = (await page.locator('.min-w-32').first().innerText()).replace(/\s+/g, ' ');
			// `hideLabel` is set, so the row is the node's label plus its flow total.
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

	test('hovering a link names both of its ends', async ({ page }) => {
		await open(page, 'ex-sankey-chart');

		// Sample along the first ribbon, between the first two columns.
		const first = links(page).first();
		const box = (await first.boundingBox())!;
		await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
		await page.waitForTimeout(260);

		const text = (await page.locator('.min-w-32').first().innerText()).replace(/\s+/g, ' ');
		// The reference names a link `"source - target"`.
		expect(text).toMatch(/Organic\s*-\s*Landing|Organic Search/);
	});

	test('the loading skeleton pulses its own nodes and links', async ({ page }) => {
		await open(page, 'ex-loading-state-sankey-chart');
		const overlay = page.locator('svg[viewBox="0 0 500 250"]');
		await expect(overlay).toBeVisible();
		// The reference's fixed skeleton: 8 nodes and 11 links.
		await expect(overlay.locator('rect')).toHaveCount(8);
		await expect(overlay.locator('path')).toHaveCount(11);

		const opacities = await overlay
			.locator('rect')
			.evaluateAll((els) => els.map((n) => Number(getComputedStyle(n).opacity)));
		// Each node pulses between 0.15 and 0.4 on its own delay, so they cannot all sit at 0.15.
		expect(opacities.some((o) => o > 0.15)).toBe(true);
	});
});
