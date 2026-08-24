import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm dev --host 127.0.0.1 --port 5174 --strictPort',
		port: 5174,
		reuseExistingServer: false
	},
	testMatch: '**/*.runtime.e2e.{ts,js}',
	timeout: 30_000,
	workers: 1,
	use: {
		...devices['Desktop Chrome'],
		baseURL: 'http://127.0.0.1:5174'
	}
});
