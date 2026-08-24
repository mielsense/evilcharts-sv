/**
 * Shiki highlighting for the docs code blocks.
 *
 * Ported from `evilcharts/src/lib/highlight-code.ts`: same themes (`min-light` / `vesper`), same
 * transformer set, same `pre` class list, and the same `__raw__` / `__npm__`-family properties the
 * copy button and the package-manager tabs read.
 *
 * The default language is `svelte` rather than `tsx`, and the package-manager rewrites gain the
 * `pnpm dlx`/`pnpm add` forms this repository uses.
 */
import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight
} from '@shikijs/transformers';
import { codeToHtml, type ShikiTransformer } from 'shiki';

/** Strips `[!code …]` annotations, so the copy button hands over clean source. */
export function stripCodeAnnotations(code: string): string {
	const result: string[] = [];

	// One pass over the lines: cleaning and filtering together, rather than re-splitting `code` for
	// every line the way an O(n²) version would.
	for (const line of code.split('\n')) {
		let cleaned = line.replace(/\s*\/\/\s*\[!code\s+[^\]]+\]\s*$/, '');
		cleaned = cleaned.replace(/\s*\{?\s*\/\*\s*\[!code\s+[^\]]+\]\s*\*\/\s*\}?\s*$/, '');
		cleaned = cleaned.replace(/\s*<!--\s*\[!code\s+[^\]]+\]\s*-->\s*$/, '');

		// A line that was nothing but a `word:` annotation goes away entirely.
		const wordAnnotationOnly = /^\s*(?:\/\/|\/\*|\{\/\*|<!--)\s*\[!code\s+word:/.test(line);
		if (wordAnnotationOnly && cleaned.trim() === '') continue;

		result.push(cleaned);
	}

	return result.join('\n');
}

/** Rewrites an `npm …` command into the other package managers, for the docs' command tabs. */
function packageManagerVariants(raw: string): Record<string, string> | undefined {
	const swap = (from: string, to: Record<string, string>) =>
		raw.startsWith(from)
			? {
					__npm__: raw,
					__yarn__: raw.replace(from, to.yarn),
					__pnpm__: raw.replace(from, to.pnpm),
					__bun__: raw.replace(from, to.bun)
				}
			: undefined;

	return (
		swap('npm install', { yarn: 'yarn add', pnpm: 'pnpm add', bun: 'bun add' }) ??
		swap('npx create-', {
			yarn: 'yarn create ',
			pnpm: 'pnpm create ',
			bun: 'bunx --bun create-'
		}) ??
		swap('npm create', { yarn: 'yarn create', pnpm: 'pnpm create', bun: 'bun create' }) ??
		swap('npx', { yarn: 'yarn dlx', pnpm: 'pnpm dlx', bun: 'bunx --bun' }) ??
		swap('npm run', { yarn: 'yarn', pnpm: 'pnpm', bun: 'bun' })
	);
}

export const transformers: ShikiTransformer[] = [
	{
		name: 'evilcharts-raw',
		pre(node) {
			if (node.tagName === 'pre') node.properties.__raw__ = stripCodeAnnotations(this.source);
		},
		code(node) {
			if (node.tagName !== 'code') return;
			const raw = this.source;
			node.properties.__raw__ = stripCodeAnnotations(raw);
			Object.assign(node.properties, packageManagerVariants(raw) ?? {});
		},
		line(node) {
			node.properties['data-line'] = '';
		}
	},
	transformerNotationHighlight(),
	transformerNotationWordHighlight(),
	transformerNotationFocus(),
	transformerNotationDiff(),
	transformerNotationErrorLevel()
];

const PRE_CLASS =
	'no-scrollbar text-[.8125rem] min-w-0 overflow-x-auto py-3.5 outline-none has-data-[highlighted-line]:px-0 has-data-[line-numbers]:px-0 has-data-[slot=tabs]:p-0 !bg-transparent';

export type HighlightCodeOptions = {
	showLineNumbers?: boolean;
	preClass?: string;
};

function classes(value: unknown): string[] {
	if (Array.isArray(value)) return value.map(String);
	return typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : [];
}

export async function highlightCode(
	code: string,
	language = 'svelte',
	options?: HighlightCodeOptions
): Promise<string> {
	const { showLineNumbers = true, preClass = PRE_CLASS } = options ?? {};

	return codeToHtml(code, {
		lang: language,
		themes: { light: 'min-light', dark: 'vesper' },
		// Both themes ship as CSS variables so the docs can switch without re-highlighting.
		defaultColor: false,
		transformers: [
			{
				name: 'evilcharts-shell',
				code(node) {
					if (showLineNumbers) node.properties['data-line-numbers'] = '';
				},
				line(node) {
					node.properties['data-line'] = '';
				},
				pre(node) {
					// Keep Shiki's own classes. Standalone markdown fences use `.shiki` as their
					// theme hook, while chart source tabs also sit inside a pretty-code figure.
					node.properties.class = [
						...new Set([...classes(node.properties.class), ...classes(preClass)])
					];
				}
			},
			transformerNotationHighlight(),
			transformerNotationWordHighlight(),
			transformerNotationFocus(),
			transformerNotationDiff(),
			transformerNotationErrorLevel()
		]
	});
}
