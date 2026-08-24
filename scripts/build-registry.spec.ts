import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { registry } from '../src/lib/registry/index.js';

const ROOT = process.cwd();
const ITEMS_DIR = path.join(ROOT, 'static/r');

/**
 * These assert the *output* of `pnpm registry:build`, which `pnpm build` runs first. They are
 * skipped when the artifacts are absent so a bare `vitest` on a clean checkout still passes.
 */
const built = existsSync(ITEMS_DIR) && existsSync(path.join(ROOT, 'registry.json'));

describe.skipIf(!built)('registry build output', () => {
	const manifest = built
		? JSON.parse(readFileSync(path.join(ROOT, 'registry.json'), 'utf8'))
		: { items: [] };

	it('writes one item file per registry item, plus the manifest', () => {
		const written = readdirSync(ITEMS_DIR).filter((f) => f.endsWith('.json'));
		expect(written).toHaveLength(registry.items.length + 1);
		expect(written).toContain('registry.json');
	});

	it('expands every directory entry into concrete source files', () => {
		for (const item of manifest.items) {
			for (const file of item.files) {
				expect(file.path, item.name).toMatch(/^src\/lib\/registry\/.+\.(svelte|ts)$/);
				expect(existsSync(path.join(ROOT, file.path)), file.path).toBe(true);
				// Tests never ship.
				expect(file.path).not.toMatch(/\.(spec|e2e)\.(ts|svelte)$/);
			}
		}
		// A chart is a directory of components, so it must expand to more than one file.
		const area = manifest.items.find((i: { name: string }) => i.name === 'layerchart-area-chart');
		expect(area.files.length).toBeGreaterThan(5);
	});

	it.each(registry.items.map((i) => i.name))('%s validates against the item schema', (name) => {
		const item = JSON.parse(readFileSync(path.join(ITEMS_DIR, `${name}.json`), 'utf8'));

		expect(item.$schema).toBe('https://shadcn-svelte.com/schema/registry-item.json');
		expect(item.name).toBe(name);
		expect(item.type).toMatch(/^registry:/);
		expect(Array.isArray(item.files)).toBe(true);
		expect(item.files.length).toBeGreaterThan(0);

		for (const file of item.files) {
			expect(typeof file.content, `${name} ${file.path}`).toBe('string');
			expect(file.content.length).toBeGreaterThan(0);
			// The inlined source is verbatim, as in the reference — the docs viewer rewrites imports.
			expect(file.content).toBe(readFileSync(path.join(ROOT, file.path), 'utf8'));
		}
	});
});
