import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { blocks } from './registry-blocks.js';
import { charts } from './registry-chart.js';
import { examples } from './registry-example.js';
import { ui } from './registry-ui.js';
import { registry } from './index.js';

const REGISTRY_DIR = path.join(process.cwd(), 'src/lib/registry');

const names = new Set(registry.items.map((item) => item.name));

const FRAMEWORK_IMPORTS = new Set(['svelte', 'svelte/elements', 'svelte/reactivity']);

function packageName(specifier: string): string {
	if (!specifier.startsWith('@')) return specifier.split('@')[0].split('/')[0];
	const scopeSlash = specifier.indexOf('/');
	const subpathSlash = specifier.indexOf('/', scopeSlash + 1);
	const version = specifier.indexOf('@', scopeSlash + 1);
	const ends = [subpathSlash, version].filter((index) => index !== -1);
	return ends.length === 0 ? specifier : specifier.slice(0, Math.min(...ends));
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
		const expectedItemCount = [ui, charts, examples, blocks].reduce(
			(total, category) => total + category.length,
			0
		);
		expect(registry.items).toHaveLength(expectedItemCount);
		expect(names.size).toBe(registry.items.length);
	});

	it('names every example and block that exists on disk, and nothing else', () => {
		const onDisk = (dir: string, prefix: string) =>
			readdirSync(path.join(REGISTRY_DIR, dir))
				.filter((f) => f.endsWith('.svelte') && f.startsWith(prefix))
				.map((f) => f.slice(0, -'.svelte'.length));

		const exampleItems = registry.items
			.filter((i) => i.name.startsWith('ex-'))
			.map((i) => i.name)
			.sort();
		const exampleFiles = ['layerchart', 'echarts'].flatMap((provider) =>
			onDisk(`examples/${provider}`, 'ex-')
		);
		expect(exampleItems).toEqual(exampleFiles.sort());

		// A block's own file plus its shape children; the manifest lists them all.
		const blockFiles = registry.items
			.filter((i) => i.type === 'registry:block' && !i.name.startsWith('ex-'))
			.flatMap((i) => i.files.map((f) => path.basename(f.path, '.svelte')))
			.sort();
		const onDiskBlockFiles = ['layerchart', 'echarts'].flatMap((provider) =>
			onDisk(`blocks/${provider}`, 'b-')
		);
		expect(blockFiles).toEqual(onDiskBlockFiles.sort());
	});

	it.each(registry.items)('$name points at files that exist', (item) => {
		expect(item.files.length).toBeGreaterThan(0);
		for (const file of item.files) {
			const absolute = path.join(REGISTRY_DIR, file.path);
			expect(existsSync(absolute), file.path).toBe(true);
			// Directory entries are expanded by the build script; both shapes are legal here.
			expect(statSync(absolute).isDirectory() || /\.(svelte|ts|md)$/.test(file.path)).toBe(true);
		}
	});

	it('ships the attribution notice with every installable component and block', () => {
		for (const item of registry.items.filter((entry) => entry.name !== 'evilcharts-notice')) {
			expect(item.registryDependencies, item.name).toContain('@evilcharts/evilcharts-notice');
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

			const packages = new Set((item.dependencies ?? []).map(packageName));
			for (const dependency of item.registryDependencies ?? []) {
				const dependencyName = dependency.slice('@evilcharts/'.length);
				for (const pkg of availablePackages(dependencyName, seen)) packages.add(pkg);
			}
			return packages;
		};

		for (const item of registry.items) {
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

	it('pins every consumer package to the version range exercised by this repository', () => {
		const packageJson = JSON.parse(
			readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
		) as {
			dependencies: Record<string, string>;
		};

		for (const item of registry.items) {
			for (const dependency of item.dependencies ?? []) {
				const name = packageName(dependency);
				expect(packageJson.dependencies[name], `${item.name} -> ${name}`).toBeDefined();
				expect(dependency, item.name).toBe(`${name}@${packageJson.dependencies[name]}`);
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
