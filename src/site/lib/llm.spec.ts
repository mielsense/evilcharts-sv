import { describe, expect, it } from 'vitest';
import { processMdxForLLMs } from './llm.js';
import { getPages } from './source.server.js';
import { MDX_COMPONENTS } from './mdsvex-components.js';

/** Every custom component the docs use, in one fixture. */
const FIXTURE = `
<ComponentPreview title="Basic Chart" name="ex-area-chart" />
<ComponentPreview title="Dashboard Block" name="audience-echarts-area-chart" />

## Installation

<CodeTabs>
  <TabsList variant="underline">
    <TabsTab value="cli">CLI</TabsTab>
  </TabsList>
  <TabsPanel value="cli">
    <CliBlock commands={["@evilcharts/layerchart-area-chart"]} />
  </TabsPanel>
  <TabsPanel value="manual">
    <Steps>
      <Step>
        <StepTitle>Install the dependencies</StepTitle>
        <StepDescription>

Paste it in.

</StepDescription>
        <StepContent>
          <CommandBlock commands={["layerchart", "@humanspeak/svelte-motion"]} />
        </StepContent>
      </Step>
    </Steps>
  </TabsPanel>
</CodeTabs>

<Alert>
  <AlertContent>

Careful.

</AlertContent>
</Alert>

<ApiHeading>EvilAreaChart</ApiHeading>

<ApiTable>
  <ApiRow name="data" type="TData[]" required>

The rows.

</ApiRow>
  <ApiRow name="curveType" type='"linear" | "bump"' default='"linear"'>

The curve.

</ApiRow>
</ApiTable>

<Link href="https://example.com" _blank={true}>A link</Link>

<ShowcaseGrid />

<ComponentSource name="layerchart-chart" title="$lib/components/evilcharts/ui/layerchart-chart" />
`;

describe('processMdxForLLMs', () => {
	const output = processMdxForLLMs(FIXTURE);

	it('leaves no component tag behind', () => {
		const withoutFences = output.replace(/```[\s\S]*?```/g, '');
		const tags = [...withoutFences.matchAll(/<\/?([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]);
		expect(tags).toEqual([]);
	});

	it('renders every package manager for a CLI block and a command block', () => {
		expect(output).toContain('npx shadcn-svelte@latest add @evilcharts/layerchart-area-chart');
		expect(output).toContain('pnpm dlx shadcn-svelte@latest add');
		expect(output).toContain('npm install layerchart @humanspeak/svelte-motion');
		expect(output).toContain('pnpm add layerchart @humanspeak/svelte-motion');
	});

	it('turns a step title into a heading and keeps its prose', () => {
		expect(output).toContain('### Install the dependencies');
		expect(output).toContain('Paste it in.');
	});

	it('turns an alert into a blockquote', () => {
		expect(output).toContain('> ');
		expect(output).toContain('Careful.');
	});

	it('renders an api row as a heading with its type and default', () => {
		expect(output).toContain('### `data` (required)');
		expect(output).toContain('type: `TData[]`');
		expect(output).toContain('### `curveType`');
		expect(output).toContain('default: `"linear"`');
		expect(output).toContain('The curve.');
	});

	it('rewrites a link and expands the showcase grid', () => {
		expect(output).toContain('[A link](https://example.com)');
		for (const provider of ['layerchart', 'echarts']) {
			expect(output).toContain(
				`- [Area Chart · ${provider === 'layerchart' ? 'LayerChart' : 'ECharts'}](/docs/${provider}/area-chart)`
			);
			expect(output).toContain(
				`- [Sankey Chart · ${provider === 'layerchart' ? 'LayerChart' : 'ECharts'}](/docs/${provider}/sankey-chart)`
			);
		}
	});

	it('inlines an example and a whole primitive directory as source', () => {
		expect(output).toContain('### Basic Chart');
		expect(output).toContain('EvilAreaChart');
		// A directory item labels each file with its consumer path.
		expect(output).toContain('`$lib/components/evilcharts/ui/layerchart-chart/index.ts`');
	});

	it('rewrites registry imports to the consumer paths', () => {
		expect(output).toContain('$lib/components/evilcharts/charts/');
		expect(output).not.toContain('$lib/registry/');
		expect(output).not.toMatch(/from\s+['"]\.\.\/\.\.\/(charts|ui)\//);
		expect(output).not.toMatch(/from\s+['"]\.\/b-/);
	});

	it('unescapes the braces the Svelte parser needed', () => {
		expect(
			processMdxForLLMs('<ApiRow name="x" type="(a: &#123;b&#125;) => void">y</ApiRow>')
		).toContain('type: `(a: {b}) => void`');
	});
});

describe('every docs page', () => {
	it.each(getPages().map((page) => [page.url, page.body] as const))(
		'%s leaves no component tag behind',
		(_url, body) => {
			const output = processMdxForLLMs(body)
				.replace(/```[\s\S]*?```/g, '')
				// Rendered headings carry the preview's own title, which is often a chart part
				// (`### <Bar bufferBar />`, `### <Link variant='solid' />`) — that is output, not a leak.
				.replace(/^#+ .*$/gm, '')
				// Inline code spans name chart parts in prose (`` `<Link />` ``), as the reference's do.
				.replace(/`[^`\n]*`/g, '');
			// Only the map's own names count; prose legitimately mentions `<EvilAreaChart.Grid>`.
			const leaked = [...output.matchAll(/<\/?([A-Z][A-Za-z0-9]*)/g)]
				.map((match) => match[1])
				.filter((name) => (MDX_COMPONENTS as readonly string[]).includes(name));
			expect(leaked).toEqual([]);
		}
	);
});
