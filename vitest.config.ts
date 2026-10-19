import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: [],
		fileParallelism: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./"),
		},
	},
});
