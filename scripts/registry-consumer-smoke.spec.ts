import { spawnSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type GeneratedFile = {
	content: string;
	path: string;
	target?: string;
};

type GeneratedItem = {
	dependencies?: string[];
	files: GeneratedFile[];
	name: string;
	registryDependencies?: string[];
};

const ROOT = process.cwd();
const ITEMS_DIR = path.join(ROOT, 'static/r');
const CHART_ROOTS = [
	{ item: 'layerchart-area-chart', exportName: 'EvilAreaChart' },
	{ item: 'layerchart-bar-chart', exportName: 'EvilBarChart' },
	{ item: 'layerchart-composed-chart', exportName: 'EvilComposedChart' },
	{ item: 'layerchart-line-chart', exportName: 'EvilLineChart' },
	{ item: 'layerchart-pie-chart', exportName: 'EvilPieChart' },
	{ item: 'layerchart-radar-chart', exportName: 'EvilRadarChart' },
	{ item: 'layerchart-radial-chart', exportName: 'EvilRadialChart' },
	{ item: 'layerchart-sankey-chart', exportName: 'EvilSankeyChart' }
] as const;
const ROOT_ITEMS = [
	...CHART_ROOTS.map(({ item }) => item),
	'layerchart-tooltip',
	'monospace-bar-chart',
	'ex-horizontal-layout-bar-chart',
	'ex-dither-area-chart'
] as const;

function packageName(dependency: string): string {
	if (!dependency.startsWith('@')) return dependency.split('@')[0];
	const version = dependency.indexOf('@', dependency.indexOf('/') + 1);
	return version === -1 ? dependency : dependency.slice(0, version);
}

function itemName(dependency: string): string {
	return path.basename(dependency, '.json');
}

function readItem(name: string): GeneratedItem {
	return JSON.parse(readFileSync(path.join(ITEMS_DIR, `${name}.json`), 'utf8'));
}

function consumerPath(item: GeneratedItem, file: GeneratedFile): string {
	if (file.target?.startsWith('$lib/'))
		return path.join('src/lib', file.target.slice('$lib/'.length));
	if (item.name.startsWith('ex-')) return path.join('src/lib/examples', path.basename(file.path));
	throw new Error(`${item.name}:${file.path} has no consumer target`);
}

function linkPackage(consumer: string, dependency: string): void {
	const name = packageName(dependency);
	const source = path.join(ROOT, 'node_modules', name);
	expect(existsSync(source), `offline package fixture ${name}`).toBe(true);

	const destination = path.join(consumer, 'node_modules', name);
	mkdirSync(path.dirname(destination), { recursive: true });
	if (!existsSync(destination)) symlinkSync(realpathSync(source), destination, 'junction');
}

function installGeneratedItems(consumer: string): Set<string> {
	const installed = new Set<string>();
	const packages = new Set(['svelte']);

	const install = (name: string): void => {
		if (installed.has(name)) return;
		installed.add(name);

		const item = readItem(name);
		for (const dependency of item.registryDependencies ?? []) install(itemName(dependency));
		for (const dependency of item.dependencies ?? []) packages.add(dependency);

		for (const file of item.files) {
			const relative = consumerPath(item, file);
			const destination = path.resolve(consumer, relative);
			expect(destination.startsWith(`${consumer}${path.sep}`), `${item.name}:${file.path}`).toBe(
				true
			);
			mkdirSync(path.dirname(destination), { recursive: true });
			writeFileSync(destination, file.content);
		}
	};

	for (const root of ROOT_ITEMS) install(root);
	for (const dependency of packages) linkPackage(consumer, dependency);
	return installed;
}

describe('generated registry consumer install', () => {
	it('installs and compiles every chart root plus representative registry surfaces offline', () => {
		const consumer = mkdtempSync(path.join(tmpdir(), 'evilcharts-sv-consumer-'));

		try {
			const installed = installGeneratedItems(consumer);
			expect(CHART_ROOTS.every(({ item }) => installed.has(item))).toBe(true);
			expect([...ROOT_ITEMS].every((name) => installed.has(name))).toBe(true);
			expect(installed.has('layerchart-dither')).toBe(true);

			writeFileSync(
				path.join(consumer, 'package.json'),
				JSON.stringify({ name: 'evilcharts-registry-smoke', private: true, type: 'module' })
			);
			mkdirSync(path.join(consumer, 'src/lib'), { recursive: true });
			writeFileSync(
				path.join(consumer, 'src/lib/utils.ts'),
				'export function cn(...inputs: unknown[]): string { return inputs.filter(Boolean).join(" "); }\n'
			);
			writeFileSync(
				path.join(consumer, 'src/consumer-smoke.svelte'),
				`<script lang="ts">
	${CHART_ROOTS.map(
		({ item, exportName }) =>
			`import { ${exportName} } from '$lib/components/evilcharts/charts/${item}/index.js';`
	).join('\n\t')}
	import { ChartTooltip } from '$lib/components/evilcharts/ui/layerchart-tooltip/index.js';
	import MonospaceBarChart from '$lib/components/evilcharts/blocks/monospace-bar-chart.svelte';
	import HorizontalBarChart from '$lib/examples/ex-horizontal-layout-bar-chart.svelte';
	import DitherAreaChart from '$lib/examples/ex-dither-area-chart.svelte';

	const charts = [${CHART_ROOTS.map(({ exportName }) => exportName).join(', ')}] as const;
	const primitive: typeof ChartTooltip = ChartTooltip;
	void charts;
	void primitive;
</script>

<MonospaceBarChart />
<HorizontalBarChart />
<DitherAreaChart />
`
			);
			writeFileSync(
				path.join(consumer, 'tsconfig.json'),
				JSON.stringify({
					compilerOptions: {
						allowJs: true,
						checkJs: true,
						module: 'ESNext',
						moduleResolution: 'Bundler',
						paths: { $lib: ['./src/lib'], '$lib/*': ['./src/lib/*'] },
						skipLibCheck: true,
						strict: true,
						target: 'ESNext'
					},
					include: ['src/**/*.svelte', 'src/**/*.ts']
				})
			);

			const result = spawnSync(
				path.join(ROOT, 'node_modules/.bin/svelte-check'),
				['--workspace', consumer, '--tsconfig', 'tsconfig.json', '--output', 'machine'],
				{ cwd: consumer, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } }
			);

			const diagnostics = `${result.stdout}${result.stderr}`;
			expect(result.status, diagnostics).toBe(0);
			expect(diagnostics).toMatch(/COMPLETED \d+ FILES 0 ERRORS 0 WARNINGS/);
		} finally {
			rmSync(consumer, { force: true, recursive: true });
		}
	}, 15_000);
});
