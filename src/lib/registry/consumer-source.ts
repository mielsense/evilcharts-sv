const CONSUMER_ROOT = '$lib/components/evilcharts';

/** Rewrite repository-only registry paths to the paths installed into a consumer project. */
export function toConsumerSource(source: string): string {
	return source
		.replaceAll('$lib/registry/charts/', `${CONSUMER_ROOT}/charts/`)
		.replaceAll('$lib/registry/ui/', `${CONSUMER_ROOT}/ui/`)
		.replaceAll('$lib/registry/blocks/', `${CONSUMER_ROOT}/blocks/`)
		.replaceAll('$lib/registry/examples/', `${CONSUMER_ROOT}/examples/`)
		.replaceAll('$lib/registry/', `${CONSUMER_ROOT}/`)
		.replace(/(['"])\.\.\/\.\.\/charts\//g, `$1${CONSUMER_ROOT}/charts/`)
		.replace(/(['"])\.\.\/\.\.\/ui\//g, `$1${CONSUMER_ROOT}/ui/`)
		.replace(/(from\s+['"]\.\/)b-/g, '$1');
}
