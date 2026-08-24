/**
 * Screenshot one example from the React reference docs, for side-by-side comparison.
 *
 * Prerequisite: run the original EvilCharts docs on port 3000 from the ignored `evilcharts/`
 * reference checkout.
 * Usage: `pnpm qa:visual:reference -- <docsPath> <exampleTitle> [tickLabel]`
 * Example: `pnpm qa:visual:reference -- recharts/area-chart "Basic Chart" Aug`
 *
 * The docs page mounts every preview but there are several on a page, so the card is located by
 * its title and only that card is captured.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [docsPath, title, label] = process.argv.slice(2);
mkdirSync('/tmp/visual', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(`http://localhost:3000/docs/${docsPath}`);
await page.waitForTimeout(2500);

const heading = page
	.locator('span', { hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) })
	.first();
await heading.scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);

// The card is the nearest ancestor that contains a recharts surface.
const card = heading.locator('xpath=ancestor::*[.//*[contains(@class,"recharts-surface")]][1]');
const surface = card.locator('.recharts-surface').first();
await surface.waitFor();

if (label) {
	const tick = card
		.locator('.recharts-cartesian-axis-tick-value', { hasText: new RegExp(`^${label}$`) })
		.first();
	const box = await tick.boundingBox();
	const plot = await surface.boundingBox();
	await page.mouse.move(box.x + box.width / 2, plot.y + plot.height * 0.5);
	await page.waitForTimeout(500);
}

const slug = `ref-${docsPath.replace(/\//g, '-')}-${title.replace(/\W+/g, '_')}${label ? `-${label}` : ''}`;
await card.screenshot({ path: `/tmp/visual/${slug}.png` });
const tip = await page
	.locator('.min-w-32')
	.first()
	.innerText()
	.catch(() => 'NONE');
console.log(`${slug} -> ${tip.replace(/\n+/g, ' | ')}`);

await browser.close();
