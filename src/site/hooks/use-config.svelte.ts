import { browser } from '$app/environment';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type InstallationType = 'cli' | 'manual';

type Config = {
	packageManager: PackageManager;
	installationType: InstallationType;
};

const STORAGE_KEY = 'config';

const DEFAULT_CONFIG: Config = {
	installationType: 'cli',
	packageManager: 'npm'
};

/**
 * Replaces the reference's persisted zustand store (`src/hooks/use-config.ts`).
 * Same storage key, same defaults, same partial-update setter.
 */
class ConfigStore {
	#config = $state<Config>({ ...DEFAULT_CONFIG });

	constructor() {
		if (browser) {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) {
					const parsed = JSON.parse(raw) as { state?: Partial<Config> } & Partial<Config>;
					Object.assign(this.#config, parsed.state ?? parsed);
				}
			} catch {
				// Corrupt or unavailable storage falls back to the defaults.
			}
		}
	}

	get packageManager() {
		return this.#config.packageManager;
	}

	get installationType() {
		return this.#config.installationType;
	}

	setConfig(config: Partial<Config>) {
		Object.assign(this.#config, config);
		if (browser) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: this.#config }));
			} catch {
				// Storage failures must not break the docs UI.
			}
		}
	}
}

let store: ConfigStore | undefined;

export function useConfig() {
	store ??= new ConfigStore();
	return store;
}
