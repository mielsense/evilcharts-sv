import { getContext, setContext } from 'svelte';

/**
 * Step ordering for `<Steps>`.
 *
 * The reference clones its children to inject `stepNumber` and wraps each in the connector `<div>`
 * (`evilcharts/src/components/docs/mdx/components/steps.tsx`). A Svelte parent cannot rewrite its
 * children, so each `<Step>` registers itself here, reads back its own index, and emits the same
 * wrapper and connector itself. The rendered DOM is identical.
 * See plans/DEVIATIONS.md D-4.
 */
export class StepsState {
	ids = $state<string[]>([]);

	register(id: string) {
		if (!this.ids.includes(id)) this.ids.push(id);
	}

	unregister(id: string) {
		const at = this.ids.indexOf(id);
		if (at !== -1) this.ids.splice(at, 1);
	}

	indexOf(id: string) {
		return this.ids.indexOf(id);
	}

	get count() {
		return this.ids.length;
	}
}

const KEY = Symbol('evilcharts-steps');

export function setStepsContext(state: StepsState) {
	return setContext(KEY, state);
}

export function useSteps(): StepsState | undefined {
	return getContext<StepsState | undefined>(KEY);
}
