import { describe, expect, it } from 'vitest';
import type { Component } from 'svelte';
import { createLandingCardLoader } from './loaders.js';

describe('landing card loader cache', () => {
	it('evicts a rejected load so the next request can retry', async () => {
		const Card = (() => undefined) as unknown as Component<Record<string, never>>;
		let attempts = 0;
		const load = createLandingCardLoader({
			RetryCard: () => {
				attempts += 1;
				return attempts === 1
					? Promise.reject(new Error('private cached chunk URL'))
					: Promise.resolve({ default: Card });
			}
		});

		await expect(load('RetryCard')).rejects.toThrow('private cached chunk URL');
		await expect(load('RetryCard')).resolves.toBe(Card);
		expect(attempts).toBe(2);
	});
});
