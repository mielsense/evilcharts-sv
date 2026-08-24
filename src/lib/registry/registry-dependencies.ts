import type { RegistryItem } from './schema.js';

export const NOTICE_REGISTRY_DEPENDENCY = '@evilcharts/evilcharts-notice';

export const PACKAGE = {
	layerchart: 'layerchart@^2.3.0',
	motion: '@humanspeak/svelte-motion@^0.9.4',
	d3Scale: 'd3-scale@^4.0.2',
	d3ScaleTypes: '@types/d3-scale@^4.0.9',
	d3Shape: 'd3-shape@^3.2.0',
	d3ShapeTypes: '@types/d3-shape@^3.2.0'
} as const;

/** Every independently installable item carries the upstream attribution into the consumer. */
export function withNotice(items: RegistryItem[]): RegistryItem[] {
	return items.map((item) => ({
		...item,
		dependencies: item.dependencies?.map((dependency) => {
			switch (dependency) {
				case 'layerchart':
					return PACKAGE.layerchart;
				case '@humanspeak/svelte-motion':
					return PACKAGE.motion;
				case 'd3-scale':
					return PACKAGE.d3Scale;
				case 'd3-shape':
					return PACKAGE.d3Shape;
				default:
					return dependency;
			}
		}),
		registryDependencies: [
			NOTICE_REGISTRY_DEPENDENCY,
			...(item.registryDependencies ?? []).filter(
				(dependency) => dependency !== NOTICE_REGISTRY_DEPENDENCY
			)
		]
	}));
}
