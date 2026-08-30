import { describe, expect, it } from 'vitest';
import { getPages } from './source.server.js';

const SVELTE_FENCE = /```svelte\s*\n([\s\S]*?)```/g;
const INSTANCE_SCRIPT = /<script\b[^>]*>[\s\S]*?<\/script>/g;
const BARE_IMPORT = /^\s*import\s/m;

function findBareImports(markdown: string): string[] {
	return [...markdown.matchAll(SVELTE_FENCE)]
		.map((match) => match[1])
		.filter((source) => BARE_IMPORT.test(source.replace(INSTANCE_SCRIPT, '')));
}

describe('Svelte documentation snippets', () => {
	it('recognizes imports outside a script block', () => {
		expect(findBareImports('```svelte\nimport Chart from "./chart.svelte";\n```')).toHaveLength(1);
		expect(
			findBareImports(
				'```svelte\n<script lang="ts">\n\timport Chart from "./chart.svelte";\n</script>\n```'
			)
		).toEqual([]);
	});

	it.each(getPages().map((page) => [page.url, page.body] as const))(
		'%s keeps imports inside script blocks',
		(_url, body) => {
			expect(findBareImports(body)).toEqual([]);
		}
	);
});
