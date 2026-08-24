/**
 * Supplies the docs markdown with its component map.
 *
 * Fumadocs passes `mdxComponents` (`evilcharts/src/components/docs/mdx/index.tsx`) into the MDX
 * renderer, so a `.mdx` page can write `<ComponentPreview />` with no import. mdsvex has no such
 * hook — Svelte resolves component names lexically — so this preprocessor runs *before* mdsvex,
 * scans each `.md` file for the component tags it actually uses, and prepends the matching import.
 *
 * Generating imports here keeps the authored markdown aligned with the reference pages instead of
 * adding a hand-maintained import block to every file.
 *
 * Imported from `svelte.config.js`, which Node loads directly; the TypeScript is stripped natively
 * (Node >= 22.18).
 */
import type { PreprocessorGroup } from 'svelte/compiler';

/**
 * Every name the markdown may use bare. Must match the exports of
 * `$site/components/docs/mdx/index.ts`, which mirrors the reference's `mdxComponents` map minus
 * the HTML element overrides — those are handled by `mdsvex-elements.ts`, since mdsvex cannot map
 * a tag to a component.
 */
export const MDX_COMPONENTS = [
	'Alert',
	'AlertContent',
	'ApiHeading',
	'ApiRow',
	'ApiTable',
	'CliBlock',
	'CodeBlock',
	'CodeCollapsibleWrapper',
	'CodeTabs',
	'CommandBlock',
	'ComponentPreview',
	'ComponentSource',
	'CopyButton',
	'Description',
	'Image',
	'Kbd',
	'LanguageIcon',
	'Link',
	'LinkedCard',
	'ShowcaseGrid',
	'Step',
	'StepContent',
	'StepDescription',
	'StepTitle',
	'Steps',
	'Tabs',
	'TabsList',
	'TabsPanel',
	'TabsTab'
] as const;

const MDX_INDEX = '$site/components/docs/mdx/index.js';

/** Fenced and inline code, so `<EvilAreaChart>` inside a snippet is not mistaken for a tag. */
const CODE_SPANS = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`/g;

/** Component names used as tags in `source`, ignoring anything inside code. */
export function usedComponents(source: string): string[] {
	const prose = source.replace(CODE_SPANS, '');
	const known = new Set<string>(MDX_COMPONENTS);
	const used = new Set<string>();

	for (const [, name] of prose.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) {
		if (known.has(name)) used.add(name);
	}

	// `mdsvex-code.ts` emits a `<CopyButton>` for every fence and a `<LanguageIcon>` for a titled
	// one, so a page with fences needs those imports even though the tags are not in its source.
	if (/^\s*(```|~~~)/m.test(source)) used.add('CopyButton');
	if (/^\s*(```|~~~)[^\n]*title=/m.test(source)) used.add('LanguageIcon');

	return [...used].sort();
}

export function mdsvexComponents(): PreprocessorGroup {
	return {
		name: 'mdsvex-components',
		markup({ content, filename }) {
			if (!filename?.endsWith('.md')) return;

			const names = usedComponents(content);
			if (names.length === 0) return;

			const imports = `<script>\n\timport { ${names.join(', ')} } from '${MDX_INDEX}';\n</script>\n\n`;

			// After the frontmatter, so mdsvex still finds it at the top of the file.
			const frontmatter = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(content);
			if (!frontmatter) return { code: imports + content };

			const end = frontmatter[0].length;
			return { code: content.slice(0, end) + '\n' + imports + content.slice(end) };
		}
	};
}
