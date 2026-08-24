import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { registry } from './index.js';

const REGISTRY_DIR = path.join(process.cwd(), 'src/lib/registry');

const names = new Set(registry.items.map((item) => item.name));

const FRAMEWORK_IMPORTS = new Set(['svelte', 'svelte/elements', 'svelte/reactivity']);

function packageName(specifier: string): string {
	if (!specifier.startsWith('@')) return specifier.split('/')[0];
	return specifier.split('/').slice(0, 2).join('/');
}

/** Every source file an item ships, with directory entries walked. */
function sourcesOf(item: (typeof registry.items)[number]): string[] {
	const walk = (dir: string): string[] =>
		readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
			entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]
		);
	return item.files.flatMap((file) => {
		const absolute = path.join(REGISTRY_DIR, file.path);
		return statSync(absolute).isDirectory() ? walk(absolute) : [absolute];
	});
}

describe('registry manifests', () => {
	it('holds one item per source file group', () => {
		// 6 primitives + 8 charts + 113 examples + 4 blocks, exactly as the reference's recharts half.
		expect(registry.items).toHaveLength(131);
		expect(names.size).toBe(registry.items.length);
	});

	it('names every example and block that exists on disk, and nothing else', () => {
		const onDisk = (dir: string, prefix: string) =>
			readdirSync(path.join(REGISTRY_DIR, dir))
				.filter((f) => f.endsWith('.svelte') && f.startsWith(prefix))
				.map((f) => f.slice(0, -'.svelte'.length));

		const examples = registry.items
			.filter((i) => i.name.startsWith('ex-'))
			.map((i) => i.name)
			.sort();
		expect(examples).toEqual(onDisk('examples/layerchart', 'ex-').sort());

		// A block's own file plus its shape children; the manifest lists them all.
		const blockFiles = registry.items
			.filter((i) => i.type === 'registry:block' && !i.name.startsWith('ex-'))
			.flatMap((i) => i.files.map((f) => path.basename(f.path, '.svelte')))
			.sort();
		expect(blockFiles).toEqual(onDisk('blocks/layerchart', 'b-').sort());
	});

	it.each(registry.items)('$name points at files that exist', (item) => {
		expect(item.files.length).toBeGreaterThan(0);
		for (const file of item.files) {
			const absolute = path.join(REGISTRY_DIR, file.path);
			expect(existsSync(absolute), file.path).toBe(true);
			// Directory entries are expanded by the build script; both shapes are legal here.
			expect(statSync(absolute).isDirectory() || /\.(svelte|ts)$/.test(file.path)).toBe(true);
		}
	});

	it.each(registry.items)('$name resolves every registryDependency', (item) => {
		const deps = item.registryDependencies ?? [];
		expect(Array.isArray(deps)).toBe(true);
		for (const dep of deps) {
			expect(dep.startsWith('@evilcharts/'), dep).toBe(true);
			expect(names, `${item.name} -> ${dep}`).toContain(dep.slice('@evilcharts/'.length));
		}
	});

	it('declares every package imported directly by an installable item', () => {
		const itemByName = new Map(registry.items.map((item) => [item.name, item]));

		const availablePackages = (itemName: string, seen = new Set<string>()): Set<string> => {
			if (seen.has(itemName)) return new Set();
			seen.add(itemName);
			const item = itemByName.get(itemName);
			if (!item) return new Set();

			const packages = new Set(item.dependencies ?? []);
			for (const dependency of item.registryDependencies ?? []) {
				const dependencyName = dependency.slice('@evilcharts/'.length);
				for (const pkg of availablePackages(dependencyName, seen)) packages.add(pkg);
			}
			return packages;
		};

		for (const item of registry.items.filter((entry) => !entry.name.startsWith('ex-'))) {
			const available = availablePackages(item.name);
			for (const file of sourcesOf(item)) {
				if (/\.(spec|e2e)\.(ts|svelte)$/.test(file)) continue;
				const source = readFileSync(file, 'utf8');
				const imports = source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g);

				for (const [, specifier] of imports) {
					if (specifier.startsWith('.') || specifier.startsWith('$lib/')) continue;
					if (FRAMEWORK_IMPORTS.has(specifier) || specifier.startsWith('svelte/')) continue;
					const pkg = packageName(specifier);
					expect(
						available,
						`${item.name} imports ${pkg} from ${path.relative(REGISTRY_DIR, file)}`
					).toContain(pkg);
				}
			}
		}
	});

	it('targets a consumer path for everything but the examples', () => {
		for (const item of registry.items) {
			for (const file of item.files) {
				if (item.name.startsWith('ex-')) {
					// The reference's examples carry no target either: they are docs demos, not installs.
					expect(file.target, item.name).toBeUndefined();
				} else {
					expect(file.target, item.name).toMatch(/^\$lib\/components\/evilcharts\//);
				}
			}
		}
	});
});

describe('registry sources', () => {
	const sources = registry.items.flatMap(sourcesOf).filter((f) => /\.(svelte|ts)$/.test(f));

	it('never reaches out of the registry', () => {
		// An installable item may only import from `$lib/registry`, `$lib/utils` and npm packages.
		// Anything under `$site` (docs chrome, landing page) would not exist in a consumer's project.
		const offenders = sources.filter((file) => {
			if (/\.(spec|e2e)\.(ts|svelte)$/.test(file)) return false;
			const text = readFileSync(file, 'utf8');
			return /from\s+['"](\$site|\.\.\/\.\.\/\.\.\/site)/.test(text);
		});
		expect(offenders).toEqual([]);
	});
});
