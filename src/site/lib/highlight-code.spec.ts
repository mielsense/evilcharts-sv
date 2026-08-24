import { describe, expect, it } from 'vitest';
import { codeToHtml } from 'shiki';
import { highlightCode, stripCodeAnnotations, transformers } from './highlight-code.js';

describe('stripCodeAnnotations', () => {
	it('removes a trailing line comment annotation', () => {
		expect(stripCodeAnnotations('const COLLAPSED_SCALE = 0.1; // [!code highlight]')).toBe(
			'const COLLAPSED_SCALE = 0.1;'
		);
	});

	it('removes block and HTML comment annotations', () => {
		expect(stripCodeAnnotations('<Bar dataKey="x" /> <!-- [!code highlight] -->')).toBe(
			'<Bar dataKey="x" />'
		);
		expect(stripCodeAnnotations('const a = 1; /* [!code ++] */')).toBe('const a = 1;');
	});

	it('drops a line that was only a word annotation', () => {
		expect(stripCodeAnnotations('// [!code word:ChartConfig]\nconst a = 1;')).toBe('const a = 1;');
	});
});

describe('highlightCode', () => {
	it('keeps the highlighted-line marker the notation transformer emits', async () => {
		const html = await highlightCode('const a = 1; // [!code highlight]\nconst b = 2;', 'ts');
		// Shiki marks the line with a class; the reference styles `code span.line.highlighted`.
		expect(html).toContain('class="line highlighted"');
		// The annotation itself never reaches the rendered output.
		expect(html).not.toContain('[!code highlight]');
	});

	it('carries the raw source and the pre class the docs style against', async () => {
		const html = await highlightCode('<div />', 'svelte');
		expect(html).toContain('no-scrollbar');
		expect(html).toContain('data-line-numbers');
	});

	it('omits line numbers when asked', async () => {
		const html = await highlightCode('const a = 1;', 'ts', { showLineNumbers: false });
		expect(html).not.toContain('data-line-numbers');
	});
});

describe('transformers', () => {
	/*
		The exported set is what the markdown pipeline uses; `highlightCode` builds its own list
		without the raw/package-manager transformer, exactly as the reference does.
	*/
	const render = (code: string, lang: string) =>
		codeToHtml(code, { lang, theme: 'vesper', transformers });

	it('offers every package manager for an npm command', async () => {
		const html = await render('npx shadcn-svelte@latest add x', 'bash');
		expect(html).toContain('pnpm dlx');
		expect(html).toContain('bunx --bun');
	});

	it('attaches the annotation-free source for the copy button', async () => {
		const html = await render('const a = 1; // [!code highlight]', 'ts');
		expect(html).toContain('__raw__="const a = 1;"');
	});
});
