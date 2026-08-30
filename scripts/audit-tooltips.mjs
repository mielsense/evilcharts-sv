/**
 * Sweeps every chart example with a real pointer and reports console errors, tooltip content that
 * never changes while the pointer moves, and transparent tooltip colour swatches.
 *
 * Prerequisite: run `pnpm build && pnpm preview` so the site is available on port 4173.
 * Usage: `pnpm qa:tooltips -- [filter]`
 */
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
import { waitForPreview } from './wait-for-preview.mjs';

const filter = process.argv[2] ?? '';
const examples = readdirSync('src/lib/registry/examples/layerchart')
	.filter((f) => f.endsWith('.svelte'))
	.map((f) => f.replace('.svelte', ''))
	.filter((n) => n.includes(filter))
	.sort();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
const problems = [];

for (const name of examples) {
	const errors = [];
	const onConsole = (m) => m.type() === 'error' && errors.push(m.text());
	const onError = (e) => errors.push(String(e));
	page.on('console', onConsole);
	page.on('pageerror', onError);

	await page.goto(`http://localhost:4173/preview/${name}?w=630&h=360`);
	await waitForPreview(page);
	await page.waitForTimeout(700);

	const plot = await page.locator('svg.lc-layout-svg').first().boundingBox();
	const seen = new Set();
	let swatch = null;

	if (plot) {
		// Sweep both axes: a horizontal bar chart stacks its categories vertically, so a
		// left-to-right sweep alone would sit in one category the whole way.
		const points = [];
		for (let i = 0; i <= 4; i += 1) {
			const t = i / 4;
			points.push([plot.x + plot.width * (0.08 + 0.84 * t), plot.y + plot.height * 0.5]);
			points.push([plot.x + plot.width * 0.5, plot.y + plot.height * (0.08 + 0.84 * t)]);
		}
		for (const [x, y] of points) {
			await page.mouse.move(x, y);
			await page.waitForTimeout(90);
			const text = await page
				.locator('.min-w-32')
				.first()
				.innerText()
				.catch(() => '');
			if (text) seen.add(text.replace(/\s+/g, ' '));
			if (swatch === null) {
				swatch = await page
					.locator('.min-w-32 .shrink-0')
					.first()
					.evaluate((n) => {
						const s = getComputedStyle(n);
						return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.backgroundImage === 'none'
							? 'TRANSPARENT'
							: 'ok';
					})
					.catch(() => null);
			}
		}
	}

	const hasTooltipPart = seen.size > 0;
	const notes = [];
	if (errors.length) notes.push(`console: ${errors[0].slice(0, 90)}`);
	if (hasTooltipPart && seen.size === 1) notes.push('tooltip never changed while sweeping');
	if (swatch === 'TRANSPARENT') notes.push('tooltip swatch is transparent');
	if (notes.length) problems.push(`${name}: ${notes.join('; ')}`);

	page.off('console', onConsole);
	page.off('pageerror', onError);
}

console.log(`swept ${examples.length} examples`);
if (problems.length === 0) console.log('no problems found');
else problems.forEach((p) => console.log('  !', p));

await browser.close();
