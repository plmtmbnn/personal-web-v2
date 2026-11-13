import { describe, expect, it } from "vitest";
import { assertSafeExternalUrl, isPrivateIpAddress } from "../url-security";

describe("URL security", () => {
	it.each([
		"127.0.0.1",
		"10.0.0.1",
		"172.16.0.1",
		"192.168.1.1",
		"169.254.169.254",
		"::1",
		"::ffff:7f00:1",
		"fd00::1",
		"fe80::1",
	])("blocks private address %s", (address) => {
		expect(isPrivateIpAddress(address)).toBe(true);
	});

	it.each(["1.1.1.1", "8.8.8.8", "2606:4700:4700::1111"])(
		"allows public address %s",
		(address) => {
			expect(isPrivateIpAddress(address)).toBe(false);
		},
	);

	it("rejects local URLs before fetching", async () => {
		await expect(
			assertSafeExternalUrl("http://127.0.0.1/admin"),
		).rejects.toThrow("Private network URLs are not allowed");
		await expect(
			assertSafeExternalUrl("http://localhost:3000"),
		).rejects.toThrow("Private network URLs are not allowed");
		await expect(
			assertSafeExternalUrl("http://[::ffff:127.0.0.1]"),
		).rejects.toThrow("Private network URLs are not allowed");
	});
});
