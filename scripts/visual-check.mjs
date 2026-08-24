/**
 * Hover a chart preview with a real mouse and write a screenshot plus the tooltip text.
 *
 * Prerequisite: run `pnpm build && pnpm preview` so the site is available on port 4173.
 * Usage: `pnpm qa:visual -- <example> [tickLabel ...] [--light]`
 *
 * The DOM-only checks in the e2e suites cannot see a tooltip that reports the wrong row, so this
 * drives an actual pointer and saves a PNG to /tmp/visual/ for inspection.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [example, ...rest] = process.argv.slice(2);
// `--light` renders in the light theme, for comparison against the reference docs.
const light = rest.includes('--light');
const labels = rest.filter((a) => !a.startsWith('--'));
if (!example) {
	console.error('usage: pnpm qa:visual -- <example> [tickLabel ...] [--light]');
	process.exit(1);
}

mkdirSync('/tmp/visual', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
await page.emulateMedia({ colorScheme: light ? 'light' : 'dark' });
// No `?w`/`?h`: the route now defaults to the reference's own card box, which is the only size
// its fixed-pixel geometry is comparable at.
await page.goto(`http://localhost:4173/preview/${example}`);
await page.waitForSelector('[data-preview-ready]');
await page.waitForTimeout(2500);

const tooltipText = () =>
	page
		.locator('.min-w-32')
		.first()
		.innerText()
		.then((t) => t.replace(/\n+/g, ' | '))
		.catch(() => 'NONE');

if (labels.length === 0) {
	await page.screenshot({ path: `/tmp/visual/${example}${light ? '-light' : ''}.png` });
	console.log(`${example}: resting -> ${await tooltipText()}`);
} else {
	for (const label of labels) {
		const tick = page.locator('.lc-axis-tick-label', { hasText: new RegExp(`^${label}$`) }).first();
		const box = await tick.boundingBox();
		const plot = await page.locator('svg.lc-layout-svg').first().boundingBox();
		await page.mouse.move(box.x + box.width / 2, plot.y + plot.height * 0.5);
		await page.waitForTimeout(350);
		console.log(`${example} @${label} -> ${await tooltipText()}`);
		await page.screenshot({ path: `/tmp/visual/${example}-${label}${light ? '-light' : ''}.png` });
	}
}

await browser.close();
