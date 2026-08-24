import { describe, it, expect } from "vitest";
import { toWords, fromWords, transformObject } from "../utils/case";

describe("Case Converter Utils", () => {
	describe("toWords()", () => {
		it("splits camelCase into lowercase words", () => {
			expect(toWords("camelCaseString")).toEqual(["camel", "case", "string"]);
		});

		it("splits PascalCase into lowercase words", () => {
			expect(toWords("PascalCaseComponent")).toEqual([
				"pascal",
				"case",
				"component",
			]);
		});

		it("splits snake_case and kebab-case into lowercase words", () => {
			expect(toWords("user_first_name")).toEqual(["user", "first", "name"]);
			expect(toWords("api-response-data")).toEqual(["api", "response", "data"]);
		});

		it("handles mixed delimiters and multiple consecutive separators", () => {
			expect(toWords("hello__world--test_case")).toEqual([
				"hello",
				"world",
				"test",
				"case",
			]);
		});

		it("handles empty strings", () => {
			expect(toWords("")).toEqual([]);
			expect(toWords("   ")).toEqual([]);
		});
	});

	describe("fromWords()", () => {
		const words = ["user", "first", "name"];

		it("converts to camelCase", () => {
			expect(fromWords(words, "camel")).toBe("userFirstName");
		});

		it("converts to PascalCase", () => {
			expect(fromWords(words, "pascal")).toBe("UserFirstName");
		});

		it("converts to snake_case", () => {
			expect(fromWords(words, "snake")).toBe("user_first_name");
		});

		it("converts to kebab-case", () => {
			expect(fromWords(words, "kebab")).toBe("user-first-name");
		});

		it("converts to UPPER CASE", () => {
			expect(fromWords(words, "upper")).toBe("USER FIRST NAME");
		});

		it("converts to lower case", () => {
			expect(fromWords(words, "lower")).toBe("user first name");
		});

		it("converts to Capitalize Case", () => {
			expect(fromWords(words, "capitalize")).toBe("User First Name");
		});

		it("returns empty string for empty words array", () => {
			expect(fromWords([], "camel")).toBe("");
		});
	});

	describe("transformObject()", () => {
		it("transforms flat object keys recursively", () => {
			const input = {
				user_name: "Alice",
				user_age: 30,
			};
			const output = transformObject(input, "camel");
			expect(output).toEqual({
				userName: "Alice",
				userAge: 30,
			});
		});

		it("transforms deeply nested objects and arrays", () => {
			const input = {
				user_profile: {
					first_name: "John",
					contact_info: {
						email_address: "john@example.com",
					},
					favorite_tags: ["tech", "ai"],
				},
				order_items: [
					{ item_id: "101", unit_price: 25.5 },
					{ item_id: "102", unit_price: 40.0 },
				],
			};

			const output = transformObject(input, "camel");
			expect(output).toEqual({
				userProfile: {
					firstName: "John",
					contactInfo: {
						emailAddress: "john@example.com",
					},
					favoriteTags: ["tech", "ai"],
				},
				orderItems: [
					{ itemId: "101", unitPrice: 25.5 },
					{ itemId: "102", unitPrice: 40.0 },
				],
			});
		});

		it("handles primitive inputs gracefully", () => {
			expect(transformObject(null, "camel")).toBeNull();
			expect(transformObject("simple string", "camel")).toBe("simple string");
			expect(transformObject(12345, "camel")).toBe(12345);
			expect(transformObject(true, "camel")).toBe(true);
		});
	});
});
