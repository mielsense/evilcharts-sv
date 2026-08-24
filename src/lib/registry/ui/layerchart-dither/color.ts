export type CssVariableReader = (name: string) => string | null | undefined;

type VariableExpression = {
	name: string;
	fallback: string | null;
};

function parseVariableExpression(value: string): VariableExpression | null {
	if (!value.startsWith('var(') || !value.endsWith(')')) return null;

	const body = value.slice(4, -1);
	let depth = 0;
	let separator = -1;

	for (let index = 0; index < body.length; index += 1) {
		const character = body[index];
		if (character === '(') depth += 1;
		if (character === ')') depth -= 1;
		if (character === ',' && depth === 0) {
			separator = index;
			break;
		}
	}

	const name = (separator === -1 ? body : body.slice(0, separator)).trim();
	if (!name.startsWith('--')) return null;

	const fallback = separator === -1 ? null : body.slice(separator + 1).trim() || null;
	return { name, fallback };
}

export function resolveDitherColor(
	value: string,
	readVariable: CssVariableReader,
	seen: ReadonlySet<string> = new Set()
): string | null {
	const normalized = value.trim();
	if (!normalized) return null;

	const expression = parseVariableExpression(normalized);
	if (!expression) return normalized;

	if (!seen.has(expression.name)) {
		const resolved = readVariable(expression.name)?.trim();
		if (resolved) {
			const nextSeen = new Set(seen);
			nextSeen.add(expression.name);
			const color = resolveDitherColor(resolved, readVariable, nextSeen);
			if (color) return color;
		}
	}

	return expression.fallback ? resolveDitherColor(expression.fallback, readVariable, seen) : null;
}
