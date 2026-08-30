import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getRegistryComponent } from './components.js';

type Registry = {
	items: Array<{ name: string; files: Array<{ path: string }> }>;
};

describe('registry preview components', () => {
	it('resolves every generated example and composed block by its public item name', () => {
		const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as Registry;
		const previewItems = registry.items.filter(({ files }) =>
			/^src\/lib\/registry\/(?:examples|blocks)\//.test(files[0]?.path ?? '')
		);

		expect(previewItems.length).toBeGreaterThan(0);
		for (const item of previewItems) {
			expect(getRegistryComponent(item.name), item.name).toBeTypeOf('function');
		}
	});

	it('does not manufacture a loader for an unknown item', () => {
		expect(getRegistryComponent('missing-registry-item')).toBeUndefined();
	});
});
