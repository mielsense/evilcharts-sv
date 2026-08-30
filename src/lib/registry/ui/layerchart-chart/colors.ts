import { VALID_THEME_KEYS, type ChartConfig } from './chart-config.js';

const ENCODED_TOKEN = /^u-(?:[0-9a-f]{6})+$/;

/**
 * Convert an arbitrary public data key into an unambiguous CSS custom-property token.
 * Plain identifier-like keys stay readable; unsafe keys and the reserved encoded form are escaped.
 */
export function chartColorToken(key: string): string {
	if (/^[A-Za-z0-9_-]+$/.test(key) && !ENCODED_TOKEN.test(key)) return key;
	return `u-${Array.from(key, (character) =>
		(character.codePointAt(0) ?? 0).toString(16).padStart(6, '0')
	).join('')}`;
}

export function chartColorVariableName(key: string, index: number): string {
	return `--color-${chartColorToken(key)}-${index}`;
}

export function chartColorVariable(key: string, index: number, fallbackIndex?: number): string {
	const name = chartColorVariableName(key, index);
	return fallbackIndex === undefined
		? `var(${name})`
		: `var(${name}, var(${chartColorVariableName(key, fallbackIndex)}))`;
}

/** Quote an attribute value for generated CSS without relying on the browser-only CSS.escape API. */
export function quoteCssString(value: string): string {
	return `"${Array.from(value, (character) => {
		const codePoint = character.codePointAt(0) ?? 0;
		if (character === '"' || character === '\\') return `\\${character}`;
		if (codePoint === 0) return '\uFFFD';
		if (codePoint < 0x20 || codePoint === 0x7f) return `\\${codePoint.toString(16)} `;
		return character;
	}).join('')}"`;
}

// Distribute colors evenly across slots, extra slots go to last color(s)
// Example: 2 colors for 4 slots → [red, red, pink, pink]
// Example: 3 colors for 4 slots → [red, pink, blue, blue]
export function distributeColors(colorsArray: string[], maxCount: number): string[] {
	const availableCount = colorsArray.length;
	if (availableCount >= maxCount) {
		return colorsArray.slice(0, maxCount);
	}

	const result: string[] = [];
	const baseSlots = Math.floor(maxCount / availableCount);
	const extraSlots = maxCount % availableCount;

	// First (availableCount - extraSlots) colors get baseSlots each
	// Last extraSlots colors get (baseSlots + 1) each
	for (let colorIdx = 0; colorIdx < availableCount; colorIdx++) {
		const isExtraColor = colorIdx >= availableCount - extraSlots;
		const slotsForThisColor = baseSlots + (isExtraColor ? 1 : 0);
		for (let j = 0; j < slotsForThisColor; j++) {
			result.push(colorsArray[colorIdx]);
		}
	}

	return result;
}

// Get max colors count across all themes for a config entry
export function getColorsCount(config: ChartConfig[string]): number {
	if (!config.colors) return 1;
	const counts = VALID_THEME_KEYS.map((theme) => config.colors?.[theme]?.length ?? 0);
	return Math.max(...counts, 1);
}
