/**
 * Optional Axiom ingest, harmless when unconfigured.
 *
 * Ported from `evilcharts/src/lib/axiom.ts`. The reference wraps `@axiomhq/js`; that package is not
 * a dependency here, so the one call it makes — `POST /v1/datasets/<dataset>/ingest` — is issued
 * with `fetch` instead. Same contract: with no `AXIOM_TOKEN` (or no `AXIOM_DATASET`) this is a
 * no-op that never throws, and no request is made.
 *
 * Read through `$env/dynamic/private` so the values are resolved at runtime and never inlined into
 * a build artefact.
 */
import { env } from '$env/dynamic/private';

const INGEST_ORIGIN = 'https://api.axiom.co';

export function isAxiomConfigured(): boolean {
	return Boolean(env.AXIOM_TOKEN && env.AXIOM_DATASET);
}

/**
 * Sends one or more events. Returns a promise the caller can hand to `platform.waitUntil` where the
 * runtime offers it, mirroring the reference's `event.waitUntil(axiom.flush())`.
 *
 * Failures are swallowed: analytics must never break a page.
 */
export async function ingest(events: Record<string, unknown>[]): Promise<void> {
	if (!isAxiomConfigured() || events.length === 0) return;

	try {
		await fetch(`${INGEST_ORIGIN}/v1/datasets/${env.AXIOM_DATASET}/ingest`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.AXIOM_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(events)
		});
	} catch {
		// Analytics is best-effort; a failed ingest is not an error worth surfacing.
	}
}
