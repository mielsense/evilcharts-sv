/**
 * The HTML element overrides from the reference's MDX component map, as a rehype plugin.
 *
 * Fumadocs maps a tag to a component (`h2: H2`, `p: P`, `table: Table`, …). mdsvex has no
 * component map at all, and Svelte cannot override a plain tag either, so the overrides are
 * applied to the hast instead: every one of the reference's components is a class-only wrapper
 * apart from `H2`, whose anchor + link icon + id are reproduced here node for node.
 *
 * See `evilcharts/src/components/docs/mdx/components/{headings,text,lists,table,hr,blockquote,
 * link,image}.tsx` and plans/DEVIATIONS.md D-1.
 *
 * Imported from `svelte.config.js`, which Node loads directly; the TypeScript is stripped natively
 * (Node >= 22.18).
 */
import GithubSlugger from 'github-slugger';
import { visit } from 'unist-util-visit';

type HastNode = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
};

/** Every class-only override, keyed by tag. */
const CLASSES: Record<string, string> = {
	h1: 'font-heading mt-2 scroll-m-10 text-3xl font-bold tracking-tight select-none',
	h2: 'font-heading [&+]*:[code]:text-xl mt-10 scroll-m-10 text-xl font-medium tracking-tight select-none first:mt-0 [&+.steps]:mt-0! [&+.steps>h3]:mt-4! [&+h3]:mt-6! [&+p]:mt-4!',
	h3: 'font-heading text-primary mt-8 scroll-m-10 text-base font-medium tracking-tight select-none [&+p]:mt-4! *:[code]:text-xl',
	h4: 'font-heading text-primary mt-8 scroll-m-10 text-base font-medium tracking-tight select-none',
	h5: 'text-primary mt-8 scroll-m-10 text-base font-medium tracking-tight select-none',
	h6: 'text-primary mt-8 scroll-m-10 text-base font-medium tracking-tight select-none',
	p: 'leading-relaxed not-first:mt-4.5',
	strong: 'font-medium',
	ul: 'my-6 ml-6 list-disc',
	ol: 'my-6 ml-6 list-decimal',
	li: 'mt-2',
	blockquote: 'mt-6 border-l-2 pl-6 italic',
	hr: 'my-4 md:my-8',
	a: 'font-medium underline underline-offset-4',
	img: 'rounded-md',
	table: 'relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0',
	tr: 'm-0 border-b',
	th: 'px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right',
	td: 'px-4 py-2 text-left whitespace-nowrap [[align=center]]:text-center [[align=right]]:text-right'
};

/** The `div` the reference's `Table` wraps every table in. */
const TABLE_WRAPPER_CLASS = 'no-scrollbar my-6 w-full overflow-y-auto rounded-lg border';

const INLINE_CODE_CLASS =
	'bg-background relative mx-1 rounded-sm border px-[0.3rem] py-px font-mono text-[11px] text-(--color-vesper-type) outline-none';

/** Lucide's `link` glyph, as the reference's `H2` renders it. */
const LINK_ICON_CLASS =
	'absolute top-[5px] -left-5 hidden size-4 translate-x-0.5 opacity-0 duration-200 ease-in-out group-hover:-translate-x-0.5 group-hover:opacity-100 lg:block';

const LINK_ICON_PATHS = [
	'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
	'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
];

function linkIcon(): HastNode {
	return {
		type: 'element',
		tagName: 'svg',
		properties: {
			class: LINK_ICON_CLASS,
			xmlns: 'http://www.w3.org/2000/svg',
			width: 24,
			height: 24,
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': 2,
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			'aria-hidden': 'true'
		},
		children: LINK_ICON_PATHS.map((d) => ({
			type: 'element',
			tagName: 'path',
			properties: { d },
			children: []
		}))
	};
}

/** The plain text of a heading, for its id. */
export function headingText(node: HastNode): string {
	if (node.type === 'text') return node.value ?? '';
	return (node.children ?? []).map(headingText).join('');
}

/**
 * The reference's `H2` id rule, verbatim: spaces to dashes, apostrophes and question marks
 * dropped, lowercased. Deliberately *not* a slugger — `h3`–`h6` keep Fumadocs' slugger ids, and
 * the table of contents is generated with the same split so the anchors agree.
 */
export function h2Id(text: string): string {
	return text.replace(/ /g, '-').replace(/'/g, '').replace(/\?/g, '').toLowerCase();
}

export function headingId(depth: number, text: string, slugger: GithubSlugger): string {
	return depth === 2 ? h2Id(text) : slugger.slug(text);
}

function addClass(node: HastNode, extra: string) {
	node.properties ??= {};
	const existing = node.properties.class;
	node.properties.class = existing ? `${extra} ${existing}` : extra;
}

export function mdsvexElements() {
	return (tree: HastNode) => {
		const slugger = new GithubSlugger();

		// Headings first, in document order, so the slugger's de-duplication matches the ToC's.
		visit(tree, 'element', (node: HastNode) => {
			const depth = node.tagName?.match(/^h([1-6])$/)?.[1];
			if (!depth) return;
			node.properties ??= {};
			node.properties.id = headingId(Number(depth), headingText(node), slugger);
		});

		visit(tree, 'element', (node: HastNode, index?: number, parent?: HastNode) => {
			const tag = node.tagName;
			if (!tag) return;

			if (CLASSES[tag]) addClass(node, CLASSES[tag]);
			if (tag === 'code' && parent?.tagName !== 'pre') addClass(node, INLINE_CODE_CLASS);

			// `H2` renders an anchor around the heading, with a link glyph that appears on hover.
			if (tag === 'h2' && parent?.children && index !== undefined) {
				parent.children[index] = {
					type: 'element',
					tagName: 'a',
					properties: {
						href: `#${node.properties?.id}`,
						class: 'group text-primary relative no-underline'
					},
					children: [linkIcon(), node]
				};
				return 'skip';
			}

			// `Table` wraps every table in a scrolling bordered box.
			if (tag === 'table' && parent?.children && index !== undefined) {
				parent.children[index] = {
					type: 'element',
					tagName: 'div',
					properties: {
						class: headingText(node).includes('Original project')
							? `${TABLE_WRAPPER_CLASS} p-2`
							: TABLE_WRAPPER_CLASS
					},
					children: [node]
				};
				return 'skip';
			}
		});
	};
}
