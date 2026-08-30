import { SvelteMap } from 'svelte/reactivity';

export type RegistrationGetter<T> = () => T;

/** Ordered, reactive storage for DOM-free compound-component registrations. */
export class RegistrationSet<T> {
	#entries = new SvelteMap<string, RegistrationGetter<T>>();

	register(token: string, getter: RegistrationGetter<T>): () => void {
		this.#entries.set(token, getter);
		return () => {
			if (this.#entries.get(token) === getter) this.#entries.delete(token);
		};
	}

	get values(): T[] {
		return Array.from(this.#entries.values(), (getter) => getter());
	}

	get first(): T | undefined {
		return this.#entries.values().next().value?.();
	}

	get size(): number {
		return this.#entries.size;
	}
}
