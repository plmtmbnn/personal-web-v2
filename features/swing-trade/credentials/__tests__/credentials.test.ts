import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAdmin } from "@/features/auth/actions";
import { redis } from "@/lib/core/redis";
import {
	clearMarketCredentialsAction,
	getMarketCredentialsAction,
	saveMarketCredentialsAction,
} from "../actions";
import { resolveMarketCredentials } from "../server";
import { sanitizeMarketCredentials, validateMarketCredentials } from "../utils";

vi.mock("@/lib/core/redis", () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
	},
	CACHE_KEYS: {
		MARKET_CREDENTIALS: "admin:market:credentials",
	},
}));

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

describe("Market Credentials Suite", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Validation & Sanitization", () => {
		it("rejects missing base URL", () => {
			const res = validateMarketCredentials({ baseUrl: "", token: "abc" });
			expect(res.isValid).toBe(false);
			expect(res.error).toBe("Base URL is required");
		});

		it("rejects non-https base URL", () => {
			const res = validateMarketCredentials({
				baseUrl: "http://api.broker.co.id",
				token: "abc",
			});
			expect(res.isValid).toBe(false);
			expect(res.error).toBe("Base URL must use secure https://");
		});

		it("rejects malformed base URL", () => {
			const res = validateMarketCredentials({
				baseUrl: "https://",
				token: "abc",
			});
			expect(res.isValid).toBe(false);
		});

		it("rejects empty token", () => {
			const res = validateMarketCredentials({
				baseUrl: "https://api.broker.co.id",
				token: "   ",
			});
			expect(res.isValid).toBe(false);
			expect(res.error).toBe("Bearer Token is required");
		});

		it("sanitizes trailing slashes and trims token", () => {
			const sanitized = sanitizeMarketCredentials({
				baseUrl: "  https://api.broker.co.id/// ",
				token: "  jwt-token-123  ",
			});
			expect(sanitized.baseUrl).toBe("https://api.broker.co.id");
			expect(sanitized.token).toBe("jwt-token-123");
			expect(sanitized.updatedAt).toBeDefined();
		});
	});

	describe("Server Actions", () => {
		it("getMarketCredentialsAction returns null when non-admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const res = await getMarketCredentialsAction();
			expect(res).toBeNull();
			expect(redis.get).not.toHaveBeenCalled();
		});

		it("getMarketCredentialsAction returns credentials from Redis for admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.get).mockResolvedValue(
				JSON.stringify({
					baseUrl: "https://api.broker.co.id",
					token: "tok-123",
					updatedAt: "2026-10-28T00:00:00Z",
				}),
			);

			const res = await getMarketCredentialsAction();
			expect(res?.baseUrl).toBe("https://api.broker.co.id");
			expect(res?.token).toBe("tok-123");
		});

		it("saveMarketCredentialsAction rejects non-admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const res = await saveMarketCredentialsAction({
				baseUrl: "https://api.broker.co.id",
				token: "tok-123",
			});
			expect(res.success).toBe(false);
			expect(res.error).toBe("Unauthorized");
		});

		it("saveMarketCredentialsAction stores valid credentials in Redis", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			const res = await saveMarketCredentialsAction({
				baseUrl: "https://api.broker.co.id",
				token: "tok-123",
			});
			expect(res.success).toBe(true);
			expect(redis.set).toHaveBeenCalledWith(
				"admin:market:credentials",
				expect.stringContaining("https://api.broker.co.id"),
			);
		});

		it("clearMarketCredentialsAction removes credentials from Redis", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			const res = await clearMarketCredentialsAction();
			expect(res.success).toBe(true);
			expect(redis.del).toHaveBeenCalledWith("admin:market:credentials");
		});
	});

	describe("resolveMarketCredentials Helper", () => {
		it("returns body credentials if both are provided", async () => {
			const resolved = await resolveMarketCredentials(
				"https://custom.api.com/",
				"token-custom",
			);
			expect(resolved).toEqual({
				baseUrl: "https://custom.api.com",
				token: "token-custom",
			});
			expect(redis.get).not.toHaveBeenCalled();
		});

		it("falls back to Redis if body credentials are omitted", async () => {
			vi.mocked(redis.get).mockResolvedValue(
				JSON.stringify({
					baseUrl: "https://redis.api.com",
					token: "token-redis",
				}),
			);
			const resolved = await resolveMarketCredentials();
			expect(resolved).toEqual({
				baseUrl: "https://redis.api.com",
				token: "token-redis",
			});
		});

		it("returns null when no body and no Redis credentials exist", async () => {
			vi.mocked(redis.get).mockResolvedValue(null);
			const resolved = await resolveMarketCredentials();
			expect(resolved).toBeNull();
		});
	});
});
