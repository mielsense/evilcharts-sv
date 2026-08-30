import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

type StaticValue =
	boolean | null | number | string | StaticValue[] | { [key: string]: StaticValue };

const directory = fileURLToPath(new URL('.', import.meta.url));

// These golden fingerprints were produced from the matching files in the ignored upstream
// EvilCharts checkout. They cover every upstream focused example's data (when it has static data)
// and chart config without making the test suite depend on that local checkout being present.
const upstreamFingerprints: Record<string, readonly string[]> = {
	'0a80177664ad97a020a3aed04f45f1d464e60e4aa8be4c1c77abec5f16c94c3e': [
		'ex-animated-dashed-stroke-area-chart',
		'ex-area-chart',
		'ex-bump-curve-type-area-chart',
		'ex-dashed-stroke-area-chart',
		'ex-default-type-area-chart',
		'ex-dotted-area-variant-area-chart',
		'ex-expanded-type-area-chart',
		'ex-gradient-area-variant-area-chart',
		'ex-gradient-reverse-area-variant-area-chart',
		'ex-hatched-area-variant-area-chart',
		'ex-lines-area-variant-area-chart',
		'ex-monotoney-curve-type-area-chart',
		'ex-solid-area-variant-area-chart',
		'ex-solid-stroke-area-chart',
		'ex-stacked-type-area-chart',
		'ex-step-curve-type-area-chart'
	],
	'7cae07ed33548049362f937e393118cf3797fd4e97840d1ea1e5f8055a33dd19': [
		'ex-animated-dashed-stroke-composed-chart',
		'ex-bump-curve-composed-chart',
		'ex-composed-chart',
		'ex-dashed-stroke-composed-chart',
		'ex-dots-composed-chart',
		'ex-duotone-variant-composed-chart',
		'ex-glowing-composed-chart',
		'ex-gradient-variant-composed-chart',
		'ex-hatched-variant-composed-chart',
		'ex-hover-highlight-composed-chart',
		'ex-stripped-variant-composed-chart'
	],
	'3c5de8fd90f8eb99d76f8a172142be52f1f4a74d63ebf510224af908070a4dd2': [
		'ex-animated-dashed-stroke-line-chart',
		'ex-bar-chart',
		'ex-bg-4-pointed-star-line-chart',
		'ex-bg-bubbles-line-chart',
		'ex-bg-cross-hatch-line-chart',
		'ex-bg-diagonal-lines-line-chart',
		'ex-bg-dots-line-chart',
		'ex-bg-falling-triangles-line-chart',
		'ex-bg-grid-line-chart',
		'ex-bg-overlapping-circles-line-chart',
		'ex-bg-plus-line-chart',
		'ex-bg-tiny-checkers-line-chart',
		'ex-bg-wiggle-lines-line-chart',
		'ex-buffer-line-chart',
		'ex-bump-curve-type-line-chart',
		'ex-chart-config-default-bar-chart',
		'ex-dashed-stroke-line-chart',
		'ex-default-variant-bar-chart',
		'ex-dot-border-line-chart',
		'ex-dot-colored-border-line-chart',
		'ex-dot-default-line-chart',
		'ex-duotone-reverse-variant-bar-chart',
		'ex-duotone-variant-bar-chart',
		'ex-glowing-desktop-bar-chart',
		'ex-glowing-mobile-bar-chart',
		'ex-glowing-mobile-line-chart',
		'ex-gradient-variant-bar-chart',
		'ex-hatched-variant-bar-chart',
		'ex-hover-highlight-bar-chart',
		'ex-legend-circle-line-chart',
		'ex-legend-circle-outline-line-chart',
		'ex-legend-horizontal-bar-line-chart',
		'ex-legend-rounded-square-line-chart',
		'ex-legend-rounded-square-outline-line-chart',
		'ex-legend-square-line-chart',
		'ex-legend-vertical-bar-line-chart',
		'ex-line-chart',
		'ex-monotoney-curve-type-line-chart',
		'ex-percent-type-bar-chart',
		'ex-solid-stroke-line-chart',
		'ex-stacked-type-bar-chart',
		'ex-step-curve-type-line-chart',
		'ex-stripped-variant-bar-chart',
		'ex-tooltip-default-bar-chart',
		'ex-tooltip-frosted-glass-bar-chart'
	],
	cb18fe125a3413d26c2edeadffca99f152136fed102490da955129c5237311be: ['ex-brush-area-chart'],
	'4ff26fda09541f4924d8345f9d37aa2cbc495efc4ddf9742f09ee1b99b04cde4': ['ex-buffer-bar-chart'],
	f5bc2110fadeaaf0d53d873de9a7661c1b74bf2d9350fcb104d1da1a825395ea: [
		'ex-chart-config-icons-bar-chart'
	],
	d8915c436f4e101cb3dc9254f39e7a15425fc96f9a05490f3a8f86039b05462e: [
		'ex-circle-grid-radar-chart',
		'ex-glowing-radar-chart',
		'ex-lines-variant-radar-chart',
		'ex-radar-chart'
	],
	e5ca975db1b868e3401bf20ec5cdedbdd6561d7aadb3313f41b474d3e978db7b: [
		'ex-donut-pie-chart',
		'ex-glowing-pie-chart',
		'ex-labels-pie-chart',
		'ex-loading-state-pie-chart',
		'ex-loading-state-radial-chart',
		'ex-overlapping-padded-pie-chart',
		'ex-padded-pie-chart',
		'ex-pie-chart',
		'ex-radial-chart',
		'ex-semi-variant-radial-chart'
	],
	a9d6a409e450deb59f5add437cde9bb9ffdfd0a823d937cfafb333bfdaf0eae7: [
		'ex-glowing-desktop-line-chart',
		'ex-gradient-colors-bump-line-chart',
		'ex-gradient-colors-line-chart'
	],
	'3f1b7f3675b10eeb6988b91c50a65218e288fbc0814b5867394c0930b661e493': [
		'ex-gradient-colors-area-chart',
		'ex-gradient-colors-bump-area-chart'
	],
	'86cdfadae20a3ea6885b44d2ccad994f4170a09b4edc6ccc8d0144b63cad29c1': [
		'ex-gradient-colors-bar-chart'
	],
	'9a8c4fd52f67fd3b7552caa4e98984b37721769d5558b7739bb1f4f4e9d10e9f': [
		'ex-gradient-colors-composed-chart'
	],
	'67207af66730c039342447db5aaeb6966ef1670f03e051804e3c6b253906d847': [
		'ex-gradient-colors-pie-chart'
	],
	'9abb8d6dc1d3fc8e1a30e9f8c7243cc090b94a460d55788b206df1c03f01d5c8': [
		'ex-gradient-colors-radar-chart'
	],
	'9003d5e255c9dc5567cb1742204eda30b491a37a8aba21a092ad7a7b986b9b0d': [
		'ex-gradient-colors-radial-chart'
	],
	'50876fab2ac0eb2f2d7db3b926a42e497feec8eb79cf9af8afc58a7e7f60386b': [
		'ex-gradient-colors-sankey-chart'
	],
	d77ce6b4607fd45a40bee82f15177a5cd63206fe91bc078022d66c817db42a3e: [
		'ex-horizontal-layout-bar-chart'
	],
	cb6ae199679746894dfc3e91c01993075d345d8f3a2f8f41fff7653b882faa74: [
		'ex-labeled-nodes-sankey-chart'
	],
	df5c00c3992daea69b48528e1e1f6f5657ba7324df58d7feddece70f5a9261e1: [
		'ex-loading-state-area-chart',
		'ex-loading-state-bar-chart',
		'ex-loading-state-line-chart'
	],
	'0bf7e08a28ba901043cf9c225d50e1f5307c0aaabd7474e8a02fab7d54f6da75': [
		'ex-loading-state-composed-chart'
	],
	bd45f042647faf0bb913bb94f7fae3666583b965eb60f1cd6fba33977e1eff68: [
		'ex-loading-state-radar-chart'
	],
	'60a5446d4894049cdac455389b1ea37719b2362be482fd8553e8c63d86f8fbd8': [
		'ex-loading-state-sankey-chart'
	],
	eab37d83f32fb9096b0426c0b68ffec67d1cb8110ef2b5b48817832a7b919e12: [
		'ex-outside-labels-sankey-chart',
		'ex-sankey-chart'
	],
	'249abec79bc418f2fc23b82723b471d240be3dd55878ce0995e777b0b41ac25d': [
		'ex-solid-labeled-nodes-sankey-chart'
	],
	'5fad9951f751d5f7c86b1e1e6499a0977143a793ac5ec4d49f69f59ca7edf855': [
		'ex-solid-link-variant-sankey-chart'
	],
	f7e8848655f897a68c82d9d803027dee47ff3ca6a21e65ff73c40594622abc28: [
		'ex-source-link-variant-sankey-chart'
	]
};

const currentOnlyDitherExamples = [
	'ex-dither-area-chart',
	'ex-dither-bar-chart',
	'ex-dither-composed-chart',
	'ex-dither-line-chart',
	'ex-dither-pie-chart',
	'ex-dither-radar-chart'
];

function unwrap(node: ts.Expression): ts.Expression {
	while (
		ts.isParenthesizedExpression(node) ||
		ts.isAsExpression(node) ||
		ts.isSatisfiesExpression(node) ||
		ts.isTypeAssertionExpression(node) ||
		ts.isNonNullExpression(node)
	) {
		node = node.expression;
	}
	return node;
}

function propertyName(name: ts.PropertyName, scope: Map<string, ts.Expression>): string {
	if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name))
		return name.text;
	if (ts.isComputedPropertyName(name)) return String(evaluate(name.expression, scope));
	throw new Error(`Unsupported property name: ${name.getText()}`);
}

function evaluate(
	rawNode: ts.Expression,
	scope: Map<string, ts.Expression>,
	seen = new Set<string>()
): StaticValue {
	const node = unwrap(rawNode);
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	if (ts.isNumericLiteral(node)) return Number(node.text);
	if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (node.kind === ts.SyntaxKind.NullKeyword) return null;

	if (ts.isPrefixUnaryExpression(node)) {
		const value = evaluate(node.operand, scope, seen);
		if (typeof value !== 'number') throw new Error(`Expected a number in ${node.getText()}`);
		if (node.operator === ts.SyntaxKind.MinusToken) return -value;
		if (node.operator === ts.SyntaxKind.PlusToken) return value;
	}

	if (ts.isArrayLiteralExpression(node)) {
		const result: StaticValue[] = [];
		for (const element of node.elements) {
			if (ts.isSpreadElement(element)) {
				const value = evaluate(element.expression, scope, seen);
				if (!Array.isArray(value)) throw new Error(`Expected an array in ${element.getText()}`);
				result.push(...value);
			} else result.push(evaluate(element, scope, seen));
		}
		return result;
	}

	if (ts.isObjectLiteralExpression(node)) {
		const result: Record<string, StaticValue> = {};
		for (const property of node.properties) {
			if (ts.isSpreadAssignment(property)) {
				const value = evaluate(property.expression, scope, seen);
				if (value === null || Array.isArray(value) || typeof value !== 'object') {
					throw new Error(`Expected an object in ${property.getText()}`);
				}
				Object.assign(result, value);
			} else if (ts.isPropertyAssignment(property)) {
				result[propertyName(property.name, scope)] = evaluate(property.initializer, scope, seen);
			} else if (ts.isShorthandPropertyAssignment(property)) {
				result[property.name.text] = evaluate(property.name, scope, seen);
			} else throw new Error(`Unsupported object member: ${property.getText()}`);
		}
		return result;
	}

	if (ts.isIdentifier(node)) {
		if (node.text === 'undefined') return { $identifier: 'undefined' };
		const declaration = scope.get(node.text);
		if (!declaration) return { $identifier: node.text };
		if (seen.has(node.text)) throw new Error(`Circular identifier: ${node.text}`);
		return evaluate(declaration, scope, new Set([...seen, node.text]));
	}

	if (ts.isPropertyAccessExpression(node)) {
		return { $property: `${node.expression.getText()}.${node.name.text}` };
	}
	if (ts.isTemplateExpression(node)) {
		return {
			$template: [
				node.head.text,
				...node.templateSpans.flatMap((span) => [
					evaluate(span.expression, scope, seen),
					span.literal.text
				])
			]
		};
	}
	throw new Error(`Unsupported expression ${ts.SyntaxKind[node.kind]}: ${node.getText()}`);
}

function fingerprint(fileName: string): string {
	const source = readFileSync(`${directory}/${fileName}.svelte`, 'utf8');
	const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
	if (!script) throw new Error(`Could not find the script in ${fileName}.svelte`);
	const ast = ts.createSourceFile(fileName, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const scope = new Map<string, ts.Expression>();
	for (const statement of ast.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (ts.isIdentifier(declaration.name) && declaration.initializer) {
				scope.set(declaration.name.text, declaration.initializer);
			}
		}
	}
	const data = scope.get('data');
	const chartConfig = scope.get('chartConfig');
	if (!chartConfig) throw new Error(`Could not find chartConfig in ${fileName}.svelte`);
	const value = {
		...(data ? { data: evaluate(data, scope) } : {}),
		chartConfig: evaluate(chartConfig, scope)
	};
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const upstreamExamples = Object.entries(upstreamFingerprints).flatMap(([hash, names]) =>
	names.map((name) => ({ hash, name }))
);

describe('translated example data and chart config', () => {
	it('covers the complete upstream catalog and the six intentional dither additions', () => {
		const actual = readdirSync(directory)
			.filter((name) => name.startsWith('ex-') && name.endsWith('.svelte'))
			.map((name) => name.slice(0, -'.svelte'.length))
			.sort();
		const expected = [
			...upstreamExamples.map(({ name }) => name),
			...currentOnlyDitherExamples
		].sort();
		expect(actual).toEqual(expected);
		expect(upstreamExamples).toHaveLength(113);
	});

	it.each(upstreamExamples)('$name keeps the upstream data and chart config', ({ hash, name }) => {
		expect(fingerprint(name)).toBe(hash);
	});
});
