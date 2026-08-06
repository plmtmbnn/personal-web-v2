import { describe } from "vitest";

// Skip auth-utils tests as they depend on Redis/Next.js environment
// These should be run as integration tests with proper environment setup
describe.skip("Authentication Utilities", () => {
	// Tests skipped to avoid dependency on Redis and Next.js cookies
	// Run integration tests separately with actual environment
});
