import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		// CI builds in the preceding workflow step; local runs remain self-contained.
		command: process.env.CI ? 'pnpm preview' : 'pnpm build && pnpm preview',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	},
	testMatch: '**/*.e2e.{ts,js}',
	/*
		Every chart example runs real intro animations, so a worker that loses the CPU can blow the
		default 30s budget even though the same test passes in seconds on its own. A larger budget
		plus one retry keeps genuine failures visible without the suite flaking on contention.
	*/
	timeout: 60_000,
	retries: 1,
	workers: process.env.CI ? 2 : 4,
	projects: [
		{
			name: 'light',
			use: { ...devices['Desktop Chrome'], colorScheme: 'light' }
		},
		{
			name: 'dark',
			use: { ...devices['Desktop Chrome'], colorScheme: 'dark' }
		}
	]
});
