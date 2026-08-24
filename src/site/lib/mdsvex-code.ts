/**
 * Code fences: highlighted at build time, framed as the reference frames them.
 *
 * A remark plugin rather than mdsvex's `highlight.highlighter` hook, because the hook is handed
 * only `(code, lang)` and the fence's `meta` — where a `title="…"` lives — is needed too. Visiting
 * the mdast directly gives access to both, and replacing the `code` node with an `html` node means
 * mdsvex's own highlighter never runs.
 *
 * What it emits is the reference's `pre`/`code` MDX overrides
 * (`evilcharts/src/components/docs/mdx/index.tsx`) for an untitled fence, and its `<CodeBlock
 * withWrapper>` (`mdx/components/code.tsx`) for a titled one — including a real `<CopyButton>`
 * tag, which works because mdsvex splices this string straight into Svelte source.
 *
 * Themes, `defaultColor: false` and the transformer set match the reference's `rehype-pretty-code`
 * configuration in `evilcharts/source.config.ts`. See plans/DEVIATIONS.md D-1.
 *
 * Imported from `svelte.config.js`, which Node loads directly; the TypeScript is stripped natively
 * (Node >= 22.18).
 */
import { visit } from 'unist-util-visit';
// A `.ts` specifier, not `.js`: Node's type stripping does not rewrite the extension, and this
// module is loaded through Node rather than a bundler. `rewriteRelativeImportExtensions` in
// tsconfig.json keeps TypeScript happy with it.
import { highlightCode, stripCodeAnnotations } from './highlight-code.ts';

type MdastNode = {
	type: string;
	lang?: string | null;
	meta?: string | null;
	value?: string;
	children?: MdastNode[];
};

/** Languages that appear in the docs but are not Shiki grammars under that name. */
const LANGUAGE_ALIASES: Record<string, string> = {
	'': 'text',
	txt: 'text'
};

/** The reference's `pre` override, verbatim. */
const PRE_CLASS =
	'no-scrollbar bg-background min-w-0 overflow-x-auto rounded-sm border py-3.5 text-[.8125rem] outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0 [&>code]:px-0!';

/** The `div` the reference's `pre` override wraps an untitled block in. */
const FRAME_CLASS = 'dark:bg-primary-foreground group relative mt-4 rounded-[8px] bg-[#F5F5F5] p-1';

/** `<CodeBlock withWrapper>`'s outer box. */
const TITLED_FRAME_CLASS = 'dark:bg-primary-foreground rounded-[10px] bg-[#F5F5F5] p-1 mt-4';

/** `title="src/foo.ts"` out of a fence's info string. */
export function parseMeta(meta: string | null | undefined): { title?: string } {
	const match = /title="([^"]*)"|title='([^']*)'/.exec(meta ?? '');
	return match ? { title: match[1] ?? match[2] } : {};
}

/** Restore the single entity-encoding pass mdsvex applies to fenced Svelte source. */
export function decodeFenceSource(code: string): string {
	const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

	return code.replace(/&(#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos);/gi, (entity, name: string) => {
		if (!name.startsWith('#')) return named[name.toLowerCase()] ?? entity;

		const hexadecimal = name[1].toLowerCase() === 'x';
		const value = Number.parseInt(name.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
		return Number.isSafeInteger(value) ? String.fromCodePoint(value) : entity;
	});
}

async function renderFence(code: string, lang: string | null | undefined, meta: string | null) {
	const language = LANGUAGE_ALIASES[lang ?? ''] ?? lang ?? 'text';
	const { title } = parseMeta(meta);
	const source = decodeFenceSource(code);

	const html = (
		await highlightCode(source, language, {
			showLineNumbers: false,
			preClass: PRE_CLASS
		})
	).replace(/ tabindex="0"/, '');
	// Shiki returns trusted build-time HTML from repository-owned markdown. Keeping it in a string
	// prevents mdsvex and Svelte from encoding the highlighted entities a second time.
	const highlighted = `{@html ${JSON.stringify(html)}}`;

	const cleaned = stripCodeAnnotations(source);
	const copyCode = `code={${JSON.stringify(cleaned)}}`;

	if (title) {
		return [
			`<figure class="${TITLED_FRAME_CLASS}" data-rehype-pretty-code-figure="">`,
			`<figcaption class="text-muted-foreground dark:text-muted-foreground/80 flex h-7 items-center justify-between px-1 text-xs [&amp;_svg]:size-3.5" data-language="${language}" data-rehype-pretty-code-title="">`,
			'<span class="-mt-1 flex items-center gap-1.5">',
			`<LanguageIcon language="${language}" />`,
			`<span class="font-mono">${title}</span>`,
			'</span>',
			`<CopyButton ${copyCode} />`,
			'</figcaption>',
			'<div class="bg-background rounded-md border">',
			highlighted,
			'</div>',
			'</figure>'
		].join('\n');
	}

	// The copy button sits a little lower on a one-line block, as in the reference.
	const copyClass = [
		'absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100',
		cleaned.split('\n').length === 1 ? 'top-4' : ''
	]
		.join(' ')
		.trim();

	return [
		`<div class="${FRAME_CLASS}">`,
		highlighted,
		`<CopyButton withBlurBg class={${JSON.stringify(copyClass)}} ${copyCode} />`,
		'</div>'
	].join('\n');
}

export function mdsvexCode() {
	return async (tree: MdastNode) => {
		const jobs: Promise<void>[] = [];

		visit(tree, 'code', (node: MdastNode) => {
			jobs.push(
				renderFence(node.value ?? '', node.lang, node.meta ?? null).then((html) => {
					// Becoming an `html` node keeps mdsvex's own highlighter out of it.
					node.type = 'html';
					node.value = html;
					delete node.lang;
					delete node.meta;
				})
			);
		});

		await Promise.all(jobs);
	};
}
