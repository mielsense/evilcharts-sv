import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { registry } from '../src/lib/registry/index.js';

const ROOT = process.cwd();
const ITEMS_DIR = path.join(ROOT, 'static/r');

const built = existsSync(ITEMS_DIR) && existsSync(path.join(ROOT, 'registry.json'));

describe('registry build output', () => {
	it('is generated before validation', () => {
		expect(built).toBe(true);
	});

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
				expect(file.path, item.name).toMatch(/^src\/lib\/registry\/.+\.(svelte|ts|md)$/);
				expect(existsSync(path.join(ROOT, file.path)), file.path).toBe(true);
				// Tests never ship.
				expect(file.path).not.toMatch(/\.(spec|e2e)\.(ts|svelte)$/);
			}
		}
		// A chart is a directory of components, so it must expand to more than one file.
		const area = manifest.items.find((i: { name: string }) => i.name === 'layerchart-area-chart');
		expect(area.files.length).toBeGreaterThan(5);
	});

	it('publishes the shared chart accessibility contract as installable source', () => {
		const chart = manifest.items.find((item: { name: string }) => item.name === 'layerchart-chart');
		const source = chart.files.find(
			(file: { path: string }) =>
				file.path === 'src/lib/registry/ui/layerchart-chart/accessibility.ts'
		);

		expect(source).toEqual({
			path: 'src/lib/registry/ui/layerchart-chart/accessibility.ts',
			type: 'registry:component',
			target: '$lib/components/evilcharts/ui/layerchart-chart/accessibility.ts'
		});

		const item = JSON.parse(readFileSync(path.join(ITEMS_DIR, 'layerchart-chart.json'), 'utf8'));
		const builtSource = item.files.find(
			(file: { path: string }) =>
				file.path === 'src/lib/registry/ui/layerchart-chart/accessibility.ts'
		);
		expect(builtSource.content).toContain('export type ChartAccessibility');
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
			expect(file.content, `${name} leaks an authoring alias`).not.toMatch(
				/\$lib\/registry\/(charts|ui|blocks)\//
			);
			expect(file.content, `${name} leaks a source-relative block import`).not.toMatch(
				/from\s+['"]\.\.\/\.\.\/(charts|ui)\//
			);
			expect(file.content, `${name} keeps a source-only b- sibling name`).not.toMatch(
				/from\s+['"]\.\/b-/
			);
		}

		for (const dependency of item.registryDependencies ?? []) {
			expect(dependency, `${name} has a non-portable registry dependency`).toMatch(
				/^\.\/[a-z0-9-]+\.json$/
			);
			expect(existsSync(path.join(ITEMS_DIR, dependency)), `${name} -> ${dependency}`).toBe(true);
		}
	});
});
