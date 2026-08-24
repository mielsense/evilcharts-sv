/**
 * The registry: every installable item, in the order the reference lists them.
 *
 * Consumed by `scripts/build-registry.ts` (which writes `registry.json`, `static/r/*.json` and the
 * generated `__index__.ts`) and by the manifest unit tests. Never imported by client code — see
 * `components.ts` for the lazy preview lookup the browser uses.
 */
import type { Registry } from './schema.js';
import { examples } from './registry-example.js';
import { charts } from './registry-chart.js';
import { ui } from './registry-ui.js';
import { blocks } from './registry-blocks.js';
import { withNotice } from './registry-dependencies.js';

export const registry: Registry = {
	homepage: 'https://evilcharts-sv.vercel.app',
	name: 'EvilCharts',
	items: [...ui, ...charts, ...withNotice(examples), ...blocks]
};

export type { Registry, RegistryItem, RegistryItemFile, RegistryItemType } from './schema.js';
