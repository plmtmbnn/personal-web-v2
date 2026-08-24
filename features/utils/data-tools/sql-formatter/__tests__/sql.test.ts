import { describe, it, expect } from "vitest";
import { validateSql } from "../utils/sql";

describe("SQL Formatter & Validator", () => {
	it("validates correct PostgreSQL SELECT query", () => {
		const sql =
			"SELECT id, name, email FROM users WHERE active = true ORDER BY created_at DESC;";
		const res = validateSql(sql, "postgresql");
		expect(res.isValid).toBe(true);
		expect(res.error).toBeNull();
	});

	it("validates correct MySQL INSERT and UPDATE statements", () => {
		const insertSql =
			"INSERT INTO products (name, price) VALUES ('Book', 19.99);";
		const res1 = validateSql(insertSql, "mysql");
		expect(res1.isValid).toBe(true);

		const updateSql = "UPDATE products SET price = 24.99 WHERE id = 1;";
		const res2 = validateSql(updateSql, "mysql");
		expect(res2.isValid).toBe(true);
	});

	it("returns isValid: false and captures error details on syntax error", () => {
		const badSql = "SELECT FROM users WHERE;";
		const res = validateSql(badSql, "postgresql");
		expect(res.isValid).toBe(false);
		expect(res.error).not.toBeNull();
		expect(typeof res.error?.message).toBe("string");
	});
});
