import { describe, it, expect } from "vitest";
import {
	generateTS,
	generateGo,
	generateMongoose,
	generateZod,
	generateJoi,
} from "../utils/generators";

describe("JSON Converter Advanced Code Generators", () => {
	const sampleData = {
		name: "Polma",
		age: 28,
		isActive: true,
		tags: ["dev", "nextjs"],
		address: {
			city: "Jakarta",
			zipCode: 12345,
		},
	};

	describe("generateTS()", () => {
		it("generates valid TypeScript interfaces with nested types", () => {
			const ts = generateTS(sampleData, "User");
			expect(ts).toContain("export interface User {");
			expect(ts).toContain("name: string;");
			expect(ts).toContain("age: number;");
			expect(ts).toContain("isActive: boolean;");
			expect(ts).toContain("tags: string[];");
			expect(ts).toContain("address: Address;");
			expect(ts).toContain("export interface Address {");
			expect(ts).toContain("city: string;");
			expect(ts).toContain("zipCode: number;");
		});

		it("handles empty arrays", () => {
			const ts = generateTS({ items: [] }, "Inventory");
			expect(ts).toContain("items: any[];");
		});
	});

	describe("generateGo()", () => {
		it("generates Go structs with json tags", () => {
			const go = generateGo(sampleData, "User");
			expect(go).toContain("type User struct {");
			expect(go).toContain('Name string `json:"name"`');
			expect(go).toContain('Age float64 `json:"age"`');
			expect(go).toContain('IsActive bool `json:"isActive"`');
			expect(go).toContain('Tags []string `json:"tags"`');
			expect(go).toContain('Address Address `json:"address"`');
			expect(go).toContain("type Address struct {");
		});

		it("handles empty arrays in Go", () => {
			const go = generateGo({ items: [] }, "Inventory");
			expect(go).toContain("Items []interface{}");
		});
	});

	describe("generateMongoose()", () => {
		it("generates Mongoose schema with type constructors", () => {
			const schema = generateMongoose(sampleData, "User");
			expect(schema).toContain("const UserSchema = new Schema({");
			expect(schema).toContain("name: String");
			expect(schema).toContain("age: Number");
			expect(schema).toContain("isActive: Boolean");
			expect(schema).toContain("tags: [String]");
			expect(schema).toContain("address: {");
		});
	});

	describe("generateZod()", () => {
		it("generates Zod validation schema", () => {
			const zod = generateZod(sampleData, "User");
			expect(zod).toContain("const userSchema = z.object({");
			expect(zod).toContain("name: z.string()");
			expect(zod).toContain("age: z.number()");
			expect(zod).toContain("isActive: z.boolean()");
			expect(zod).toContain("tags: z.array(z.string())");
			expect(zod).toContain("address: z.object({");
		});
	});

	describe("generateJoi()", () => {
		it("generates Joi schema", () => {
			const joi = generateJoi(sampleData, "User");
			expect(joi).toContain("const userSchema = Joi.object({");
			expect(joi).toContain("name: Joi.string()");
			expect(joi).toContain("age: Joi.number()");
			expect(joi).toContain("isActive: Joi.boolean()");
			expect(joi).toContain("tags: Joi.array().items(Joi.string())");
			expect(joi).toContain("address: Joi.object({");
		});
	});
});
