import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

type StaticValue =
	boolean | null | number | string | StaticValue[] | { [key: string]: StaticValue };

const directory = fileURLToPath(new URL('.', import.meta.url));
const layerchartDirectory = fileURLToPath(new URL('../layerchart/', import.meta.url));
const chartFamilies = ['area', 'bar', 'composed', 'line', 'pie', 'radar', 'radial', 'sankey'];

const layerchartOnlyExamples = new Set([
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
	'ex-glowing-pie-chart',
	'ex-glowing-radar-chart'
]);

const echartsOnlyExamples = [
	'ex-blocks-variant-echarts-bar-chart',
	'ex-buffer-echarts-area-chart',
	'ex-dot-ping-echarts-line-chart',
	'ex-expandable-variant-echarts-bar-chart',
	'ex-hover-highlight-echarts-area-chart',
	'ex-hover-reveal-echarts-area-chart',
	'ex-hover-reveal-echarts-line-chart',
	'ex-max-highlight-echarts-bar-chart',
	'ex-outside-labels-echarts-pie-chart',
	'ex-svg-renderer-echarts-area-chart',
	'ex-svg-renderer-echarts-bar-chart',
	'ex-svg-renderer-echarts-composed-chart',
	'ex-svg-renderer-echarts-line-chart',
	'ex-svg-renderer-echarts-pie-chart',
	'ex-svg-renderer-echarts-radar-chart',
	'ex-svg-renderer-echarts-radial-chart',
	'ex-svg-renderer-echarts-sankey-chart'
];

const providerSpecificExamples = [...echartsOnlyExamples, 'ex-loading-state-echarts-line-chart'];

// These golden fingerprints were generated from and verified against the ignored upstream
// ECharts examples. They cover provider-only examples that do not have a LayerChart twin.
const providerSpecificFingerprints: Record<string, string> = {
	'ex-blocks-variant-echarts-bar-chart':
		'ed86deaa4afdfe0c7ea4c61f4ef62c764904c05b0b3a49828e7b22b5f4434e00',
	'ex-buffer-echarts-area-chart':
		'3c5de8fd90f8eb99d76f8a172142be52f1f4a74d63ebf510224af908070a4dd2',
	'ex-dot-ping-echarts-line-chart':
		'3c5de8fd90f8eb99d76f8a172142be52f1f4a74d63ebf510224af908070a4dd2',
	'ex-expandable-variant-echarts-bar-chart':
		'ed86deaa4afdfe0c7ea4c61f4ef62c764904c05b0b3a49828e7b22b5f4434e00',
	'ex-hover-highlight-echarts-area-chart':
		'0a80177664ad97a020a3aed04f45f1d464e60e4aa8be4c1c77abec5f16c94c3e',
	'ex-hover-reveal-echarts-area-chart':
		'0a80177664ad97a020a3aed04f45f1d464e60e4aa8be4c1c77abec5f16c94c3e',
	'ex-hover-reveal-echarts-line-chart':
		'0a80177664ad97a020a3aed04f45f1d464e60e4aa8be4c1c77abec5f16c94c3e',
	'ex-max-highlight-echarts-bar-chart':
		'3c5de8fd90f8eb99d76f8a172142be52f1f4a74d63ebf510224af908070a4dd2',
	'ex-outside-labels-echarts-pie-chart':
		'e5ca975db1b868e3401bf20ec5cdedbdd6561d7aadb3313f41b474d3e978db7b',
	'ex-svg-renderer-echarts-area-chart':
		'a4c8ff85646db5ac9161f6fe4f7c4d410703ac03695e206bc588eed34f3569c0',
	'ex-svg-renderer-echarts-bar-chart':
		'3c5de8fd90f8eb99d76f8a172142be52f1f4a74d63ebf510224af908070a4dd2',
	'ex-svg-renderer-echarts-composed-chart':
		'7cae07ed33548049362f937e393118cf3797fd4e97840d1ea1e5f8055a33dd19',
	'ex-svg-renderer-echarts-line-chart':
		'3c5de8fd90f8eb99d76f8a172142be52f1f4a74d63ebf510224af908070a4dd2',
	'ex-svg-renderer-echarts-pie-chart':
		'e5ca975db1b868e3401bf20ec5cdedbdd6561d7aadb3313f41b474d3e978db7b',
	'ex-svg-renderer-echarts-radar-chart':
		'd8915c436f4e101cb3dc9254f39e7a15425fc96f9a05490f3a8f86039b05462e',
	'ex-svg-renderer-echarts-radial-chart':
		'e5ca975db1b868e3401bf20ec5cdedbdd6561d7aadb3313f41b474d3e978db7b',
	'ex-svg-renderer-echarts-sankey-chart':
		'eab37d83f32fb9096b0426c0b68ffec67d1cb8110ef2b5b48817832a7b919e12',
	'ex-loading-state-echarts-line-chart':
		'c5d0cce4a9892eba816862407ca4edd0f15b2cbdd0311e3def64481976981792'
};

const ditherExamples = ['area', 'bar', 'composed', 'line', 'pie', 'radar'].map(
	(family) => `ex-dither-echarts-${family}-chart`
);

function toEChartsName(name: string): string {
	for (const family of chartFamilies) {
		const suffix = `-${family}-chart`;
		if (name.endsWith(suffix)) {
			return `${name.slice(0, -suffix.length)}-echarts${suffix}`;
		}
	}
	throw new Error(`Unrecognized chart example: ${name}`);
}

function toLayerchartName(name: string): string {
	return name.replace('-echarts-', '-');
}

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
		if (typeof value !== 'number') throw new Error(`Expected number in ${node.getText()}`);
		return node.operator === ts.SyntaxKind.MinusToken ? -value : value;
	}
	if (ts.isArrayLiteralExpression(node)) {
		const result: StaticValue[] = [];
		for (const element of node.elements) {
			if (ts.isSpreadElement(element)) {
				const value = evaluate(element.expression, scope, seen);
				if (!Array.isArray(value)) throw new Error(`Expected array in ${element.getText()}`);
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
					throw new Error(`Expected object in ${property.getText()}`);
				}
				Object.assign(result, value);
			} else if (ts.isPropertyAssignment(property)) {
				const name = property.name;
				let key: string;
				if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
					key = name.text;
				} else if (ts.isComputedPropertyName(name)) {
					key = String(evaluate(name.expression, scope));
				} else {
					throw new Error(`Unsupported property name: ${name.getText()}`);
				}
				result[key] = evaluate(property.initializer, scope, seen);
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

function fingerprint(baseDirectory: string, fileName: string): string {
	const source = readFileSync(`${baseDirectory}/${fileName}.svelte`, 'utf8');
	const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
	if (!script) throw new Error(`Could not find script in ${fileName}.svelte`);
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
	const chartConfig = scope.get('chartConfig') ?? scope.get('config');
	if (!chartConfig) throw new Error(`Could not find chartConfig in ${fileName}.svelte`);
	const value = {
		...(data ? { data: evaluate(data, scope) } : {}),
		chartConfig: evaluate(chartConfig, scope)
	};
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

const sharedExamples = readdirSync(layerchartDirectory)
	.filter((name) => name.startsWith('ex-') && name.endsWith('.svelte'))
	.map((name) => name.slice(0, -'.svelte'.length))
	.filter((name) => !name.startsWith('ex-dither-') && !layerchartOnlyExamples.has(name))
	.map((layerchartName) => ({ echartsName: toEChartsName(layerchartName), layerchartName }));

const directlyComparableExamples = sharedExamples.filter(
	({ echartsName }) => !providerSpecificExamples.includes(echartsName)
);

describe('ECharts translated example data and chart config', () => {
	it('covers every upstream ECharts example and the six intentional dither additions', () => {
		const actual = readdirSync(directory)
			.filter((name) => name.startsWith('ex-') && name.endsWith('.svelte'))
			.map((name) => name.slice(0, -'.svelte'.length))
			.sort();
		const expected = [
			...sharedExamples.map(({ echartsName }) => echartsName),
			...echartsOnlyExamples,
			...ditherExamples
		].sort();
		expect(actual).toEqual(expected);
		expect(actual).toHaveLength(123);
	});

	it.each(directlyComparableExamples)(
		'$echartsName keeps the provider-neutral upstream data/config',
		(item) => {
			expect(fingerprint(directory, item.echartsName)).toBe(
				fingerprint(layerchartDirectory, item.layerchartName)
			);
		}
	);

	it.each(ditherExamples)('$0 keeps the matching LayerChart dither data/config', (name) => {
		expect(fingerprint(directory, name)).toBe(
			fingerprint(layerchartDirectory, toLayerchartName(name))
		);
	});

	it.each(Object.entries(providerSpecificFingerprints))(
		'%s keeps its upstream ECharts data/config',
		(name, hash) => {
			expect(fingerprint(directory, name)).toBe(hash);
		}
	);
});
