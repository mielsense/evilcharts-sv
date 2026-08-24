import { mdsvex } from 'mdsvex';
import { describe, expect, it } from 'vitest';
import { decodeFenceSource, mdsvexCode } from './mdsvex-code.js';

async function compileFence(source: string) {
	const processor = mdsvex({ extensions: ['.md'], highlight: false, remarkPlugins: [mdsvexCode] });
	const result = await processor.markup({ content: source, filename: 'fixture.md' });
	return result?.code ?? '';
}

describe('mdsvex code fences', () => {
	it('restores one mdsvex entity-encoding pass before highlighting', () => {
		expect(
			decodeFenceSource(
				'&lt;script lang="ts"&gt;\nlet data = &#123; value: 42 &#125;;\n&lt;/script&gt;'
			)
		).toBe('<script lang="ts">\nlet data = { value: 42 };\n</script>');
		expect(decodeFenceSource('&amp;lt;span&amp;gt;')).toBe('&lt;span&gt;');
	});

	it('passes highlighted source through a raw HTML expression', async () => {
		const compiled = await compileFence(
			[
				'```svelte',
				'<script lang="ts">',
				'\tlet data = { value: 42 };',
				'</script>',
				'',
				'<p>{data.value}</p>',
				'```'
			].join('\n')
		);

		expect(compiled).toContain('{@html "<pre');
		expect(compiled).toContain('&#x3C;');
		expect(compiled).toContain('code={"<script lang=');
		expect(compiled).not.toContain('&#x26;lt;script');
		expect(compiled).not.toContain('&#x26;#123;');
	});

	it('keeps a titled fence caption in its figure and removes Shiki tabindex', async () => {
		const compiled = await compileFence('```svelte title="Example.svelte"\n<p>Hello</p>\n```');

		expect(compiled).toMatch(
			/<figure[^>]*>[\s\S]*<figcaption[^>]*>[^]*Example\.svelte[^]*<\/figcaption>/
		);
		expect(compiled).not.toContain('tabindex="0"');
	});
});
