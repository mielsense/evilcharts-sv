/**
 * Turns a docs page's markdown into text an agent can read: the custom components become plain
 * markdown and the registry sources are inlined.
 *
 * Ported from `evilcharts/src/lib/llm.ts`. Every component branch is kept, plus the ones D-4 added
 * to the map, so no raw component tag survives into the output.
 *
 * Server-only: it reads registry sources off disk.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Index } from '$lib/registry/__index__.js';
import { pageTree } from './source.js';

const showcaseItems = [
	{
		name: 'Area Chart',
		description: 'Highlight trends with filled area ranges.',
		url: '/docs/layerchart/area-chart'
	},
	{
		name: 'Line Chart',
		description: 'Track change over time with lines.',
		url: '/docs/layerchart/line-chart'
	},
	{
		name: 'Bar Chart',
		description: 'Compare categories quickly with bold bars.',
		url: '/docs/layerchart/bar-chart'
	},
	{
		name: 'Composed Chart',
		description: 'Mix lines, bars, areas in one.',
		url: '/docs/layerchart/composed-chart'
	},
	{
		name: 'Radar Chart',
		description: 'Compare multi-metric profiles on radial axes.',
		url: '/docs/layerchart/radar-chart'
	},
	{
		name: 'Pie Chart',
		description: 'Show parts of a whole, clearly.',
		url: '/docs/layerchart/pie-chart'
	},
	{
		name: 'Radial Chart',
		description: 'Visualize totals in a circular layout.',
		url: '/docs/layerchart/radial-chart'
	},
	{
		name: 'Sankey Chart',
		description: 'Show flows between stages with weighted links.',
		url: '/docs/layerchart/sankey-chart'
	}
];

const packageInstallCommands = {
	npm: 'npm install',
	yarn: 'yarn add',
	bun: 'bun add',
	pnpm: 'pnpm add'
};

/** The shadcn-**svelte** CLI, since that is what installs into a Svelte project. */
const shadcnCliCommands = {
	npm: 'npx shadcn-svelte@latest add',
	yarn: 'yarn dlx shadcn-svelte@latest add',
	bun: 'bunx --bun shadcn-svelte@latest add',
	pnpm: 'pnpm dlx shadcn-svelte@latest add'
};

function getComponentsList() {
	const components = pageTree.children.find(
		(item) => item.type === 'folder' && item.name === 'Components'
	);
	if (components?.type !== 'folder') return '';

	return components.children
		.filter((child) => child.type === 'page')
		.map((child) => `- [${child.name}](${child.url})`)
		.join('\n');
}

function parseCommands(commands: string) {
	return [...commands.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
}

function getAttribute(tag: string, name: string) {
	// Both quote styles: `title='<Dot variant="default" />'` appears in the docs, and the
	// reference's single-quote handling only covers `ApiRow`'s `type`/`default`.
	const match = tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`));
	return match ? (match[1] ?? match[2]) : undefined;
}

/**
 * Replaces every self-closing `<Tag … />` in `content`, scanning quotes properly.
 *
 * The reference uses `/<Tag[\s\S]*?\/>/g`, which stops at the first `/>` — including one inside an
 * attribute value. Several docs pages title a preview with a tag (`title="<Bar bufferBar />"`), so
 * that leaves the rest of the opening tag behind as literal text. See plans/DEVIATIONS.md A-2.
 */
function replaceSelfClosingTag(
	content: string,
	tag: string,
	render: (whole: string) => string
): string {
	const opener = new RegExp(`<${tag}(?=[\\s/>])`, 'g');
	let out = '';
	let cursor = 0;
	let match: RegExpExecArray | null;

	while ((match = opener.exec(content)) !== null) {
		if (match.index < cursor) continue;

		let quote: string | null = null;
		let i = match.index;
		for (; i < content.length; i++) {
			const char = content[i];
			if (quote) {
				if (char === quote) quote = null;
			} else if (char === '"' || char === "'") {
				quote = char;
			} else if (char === '>') {
				i += 1;
				break;
			}
		}

		out += content.slice(cursor, match.index) + render(content.slice(match.index, i));
		cursor = i;
		opener.lastIndex = i;
	}

	return out + content.slice(cursor);
}

/**
 * Replaces every `<Tag …>…</Tag>` pair, scanning the opening tag's quotes properly.
 *
 * `<ApiRow type="(range: { … }) => void">` defeats the reference's `<ApiRow\s+([\s\S]*?)>` — the
 * `>` of the arrow ends the match early and the rest of the attribute leaks into the body.
 * See plans/DEVIATIONS.md A-2.
 */
function replacePairedTag(
	content: string,
	tag: string,
	render: (attrs: string, body: string) => string
): string {
	const opener = new RegExp(`<${tag}(?=[\\s/>])`, 'g');
	const closer = `</${tag}>`;
	let out = '';
	let cursor = 0;
	let match: RegExpExecArray | null;

	while ((match = opener.exec(content)) !== null) {
		if (match.index < cursor) continue;

		let quote: string | null = null;
		let i = match.index + tag.length + 1;
		for (; i < content.length; i++) {
			const char = content[i];
			if (quote) {
				if (char === quote) quote = null;
			} else if (char === '"' || char === "'") {
				quote = char;
			} else if (char === '>') {
				break;
			}
		}

		const attrs = content.slice(match.index + tag.length + 1, i);
		const bodyStart = i + 1;
		const bodyEnd = content.indexOf(closer, bodyStart);
		if (bodyEnd === -1) break;

		out += content.slice(cursor, match.index) + render(attrs, content.slice(bodyStart, bodyEnd));
		cursor = bodyEnd + closer.length;
		opener.lastIndex = cursor;
	}

	return out + content.slice(cursor);
}

function renderPackageCommands(commands: string, commandMap: Record<string, string>) {
	const packages = parseCommands(commands).join(' ');

	return Object.entries(commandMap)
		.map(([manager, command]) => `### ${manager}\n\n\`\`\`bash\n${command} ${packages}\n\`\`\``)
		.join('\n\n');
}

function getShowcaseList() {
	return showcaseItems
		.map((item) => `- [${item.name}](${item.url}) - ${item.description}`)
		.join('\n');
}

function renderApiRows(content: string) {
	return replacePairedTag(content, 'ApiRow', (attrs, description) => {
		const name = getAttribute(attrs, 'name') ?? '';
		const type = getAttribute(attrs, 'type') ?? '';
		const defaultValue = getAttribute(attrs, 'default') ?? '';
		const required = /(?:^|\s)required(?:\s|\/|$)/.test(attrs);
		const meta = [type && `type: \`${type}\``, defaultValue && `default: \`${defaultValue}\``]
			.filter(Boolean)
			.join(' · ');
		return `### \`${name}\`${required ? ' (required)' : ''}\n\n${meta}\n\n${description.trim()}`;
	});
}

function stripMdxComponentTags(content: string) {
	return (
		renderApiRows(content)
			.replace(/<CodeTabs(?:\s[^>]*)?>/g, '')
			.replace(/<\/CodeTabs>/g, '')
			.replace(/<TabsList(?:\s[^>]*)?>[\s\S]*?<\/TabsList>/g, '')
			.replace(/<TabsPanel(?:\s[^>]*)?>/g, '')
			.replace(/<\/TabsPanel>/g, '')
			.replace(/<Alert(?:\s[^>]*)?>/g, '> ')
			.replace(/<\/Alert>/g, '')
			.replace(/<AlertContent(?:\s[^>]*)?>/g, '')
			.replace(/<\/AlertContent>/g, '')
			.replace(/<Steps[^>]*>/g, '')
			.replace(/<\/Steps>/g, '')
			.replace(/<Step(?:\s[^>]*)?>/g, '')
			.replace(/<\/Step>/g, '')
			.replace(/<StepContent(?:\s[^>]*)?>/g, '')
			.replace(/<\/StepContent>/g, '')
			.replace(/<StepTitle(?:\s[^>]*)?>([\s\S]*?)<\/StepTitle>/g, '### $1')
			.replace(/<StepDescription(?:\s[^>]*)?>([\s\S]*?)<\/StepDescription>/g, '$1')
			// `<ApiHeading>` was added to the map after the reference's list was written.
			.replace(/<ApiHeading(?:\s[^>]*)?>([\s\S]*?)<\/ApiHeading>/g, '### $1')
			.replace(/<ApiTable[^>]*>/g, '')
			.replace(/<\/ApiTable>/g, '')
			.replace(/<Link\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/Link>/g, '[$2]($1)')
			.replace(/<LinkedCard\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/LinkedCard>/g, '[$2]($1)')
			.replace(/<Kbd(?:\s[^>]*)?>([\s\S]*?)<\/Kbd>/g, '`$1`')
			.replace(/<Description(?:\s[^>]*)?>([\s\S]*?)<\/Description>/g, '$1')
			.replace(/<CodeCollapsibleWrapper(?:\s[^>]*)?>/g, '')
			.replace(/<\/CodeCollapsibleWrapper>/g, '')
			.replace(/<ShowcaseGrid\s*\/>/g, getShowcaseList())
			// Escaped braces are only there for Svelte's parser; agents want the literal text.
			.replaceAll('&#123;', '{')
			.replaceAll('&#125;', '}')
	);
}

/**
 * A registry item's source, inlined.
 *
 * The reference reads `files[0]` — one `.tsx` per item. An item here is a directory of components,
 * so every file is inlined under its own fence, each labelled with the path a consumer will have.
 * See plans/DEVIATIONS.md A-2.
 */
function renderRegistrySource(name: string, title?: string) {
	const item = Index[name];
	if (!item?.files?.length) return undefined;

	const blocks: string[] = [];

	for (const file of item.files) {
		const absolute = path.join(process.cwd(), 'src/lib/registry', file.path);
		let source: string;
		try {
			source = readFileSync(absolute, 'utf8');
		} catch {
			continue;
		}

		// Rewrite internal registry paths to the ones a consumer will have.
		source = source.replaceAll('$lib/registry/ui/', '$lib/components/evilcharts/ui/');
		source = source.replaceAll('$lib/registry/charts/', '$lib/components/evilcharts/charts/');
		source = source.replaceAll('$lib/registry/blocks/', '$lib/components/evilcharts/blocks/');
		source = source.replaceAll('$lib/registry/examples/', '$lib/components/');

		const language = file.path.endsWith('.svelte') ? 'svelte' : 'ts';
		const label = item.files.length > 1 ? `\n\`${file.target ?? file.path}\`\n` : '';
		blocks.push(`${label}\n\`\`\`${language}\n${source}\`\`\``);
	}

	if (blocks.length === 0) return undefined;

	const heading = title ? `### ${title}\n` : '';
	return `${heading}${blocks.join('\n')}`;
}

export function processMdxForLLMs(content: string) {
	content = stripMdxComponentTags(content);

	// Replace <ComponentsList /> with a markdown list of components.
	content = content.replace(/<ComponentsList\s*\/>/g, getComponentsList());

	content = content.replace(
		/<CommandBlock\s+commands=\{\[([\s\S]*?)\]\}\s*\/>/g,
		(_match, commands) => renderPackageCommands(commands, packageInstallCommands)
	);

	content = content.replace(/<CliBlock\s+commands=\{\[([\s\S]*?)\]\}\s*\/>/g, (_match, commands) =>
		renderPackageCommands(commands, shadcnCliCommands)
	);

	content = replaceSelfClosingTag(content, 'ComponentSource', (whole) => {
		const name = getAttribute(whole, 'name');
		const title = getAttribute(whole, 'title');
		return name ? (renderRegistrySource(name, title) ?? whole) : whole;
	});

	// Replace <ComponentPreview … name="xxx" … /> with the actual source code.
	return replaceSelfClosingTag(content, 'ComponentPreview', (whole) => {
		const name = getAttribute(whole, 'name');
		const title = getAttribute(whole, 'title');
		if (!name) return whole;

		try {
			return renderRegistrySource(name, title) ?? whole;
		} catch (error) {
			console.error(`Error processing ComponentPreview ${name}:`, error);
			return whole;
		}
	});
}
