import { describe, it, expect } from "vitest";
import { setDeep, transformToNested } from "../utils/transform";

describe("CSV to JSON Transformer", () => {
	describe("setDeep()", () => {
		it("sets a direct property on an object", () => {
			const obj: Record<string, any> = {};
			setDeep(obj, "name", "Alice");
			expect(obj).toEqual({ name: "Alice" });
		});

		it("sets nested properties via dot notation", () => {
			const obj: Record<string, any> = {};
			setDeep(obj, "user.profile.age", 28);
			expect(obj).toEqual({
				user: {
					profile: {
						age: 28,
					},
				},
			});
		});

		it("preserves existing sibling keys while setting deep path", () => {
			const obj: Record<string, any> = {
				user: {
					profile: {
						firstName: "John",
					},
				},
			};
			setDeep(obj, "user.profile.lastName", "Doe");
			expect(obj).toEqual({
				user: {
					profile: {
						firstName: "John",
						lastName: "Doe",
					},
				},
			});
		});
	});

	describe("transformToNested()", () => {
		it("converts flat dot-notation records into structured nested records", () => {
			const input = [
				{
					id: "1",
					"user.name": "Alice",
					"user.address.city": "Jakarta",
					role: "Admin",
				},
				{
					id: "2",
					"user.name": "Bob",
					"user.address.city": "Surabaya",
					role: "User",
				},
			];

			const output = transformToNested(input);

			expect(output).toEqual([
				{
					id: "1",
					role: "Admin",
					user: {
						name: "Alice",
						address: {
							city: "Jakarta",
						},
					},
				},
				{
					id: "2",
					role: "User",
					user: {
						name: "Bob",
						address: {
							city: "Surabaya",
						},
					},
				},
			]);
		});

		it("handles records with no dot notation without modification", () => {
			const input = [{ a: 1, b: 2 }];
			expect(transformToNested(input)).toEqual([{ a: 1, b: 2 }]);
		});
	});
});
