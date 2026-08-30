import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function source(path: string) {
	return readFileSync(path, 'utf8');
}

describe('browser module boundaries', () => {
	it('keeps the eager docs corpus behind server load modules', () => {
		const pageLoad = source('src/routes/docs/[...slug]/+page.ts');
		const sidebar = source('src/site/components/docs/sidebar/docs-sidebar.svelte');
		const sharedSource = source('src/site/lib/source.ts');

		expect(pageLoad).not.toContain('$site/lib/source.js');
		expect(sidebar).not.toContain("import { pageTree } from '$site/lib/source.js'");
		expect(sharedSource).not.toContain("query: '?raw'");
		expect(source('src/routes/docs/[...slug]/+page.server.ts')).toContain(
			'$site/lib/source.server.js'
		);
	});

	it('derives preview aliases without loading the generated registry index', () => {
		const components = source('src/lib/registry/components.ts');

		expect(components).not.toContain("from './__index__.js'");
	});
});
