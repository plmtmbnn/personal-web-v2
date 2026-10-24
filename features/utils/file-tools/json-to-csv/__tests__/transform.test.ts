import { describe, expect, it } from "vitest";
import {
	convertJsonToCsv,
	extractRecordArray,
	findCandidateArrays,
	flattenObject,
} from "../utils/transform";

describe("JSON to CSV Transform Utility", () => {
	describe("flattenObject", () => {
		it("flattens nested object properties with dot notation", () => {
			const nested = {
				id: 101,
				user: {
					name: "Polma",
					profile: {
						role: "Engineer",
						location: "Jakarta",
					},
				},
			};

			const flat = flattenObject(nested);
			expect(flat).toEqual({
				id: 101,
				"user.name": "Polma",
				"user.profile.role": "Engineer",
				"user.profile.location": "Jakarta",
			});
		});

		it("serializes arrays into JSON string format", () => {
			const data = {
				id: 1,
				tags: ["dev", "lead"],
				metadata: [{ key: "env", val: "prod" }],
			};

			const flat = flattenObject(data);
			expect(flat.id).toBe(1);
			expect(flat.tags).toBe('["dev","lead"]');
			expect(flat.metadata).toBe('[{"key":"env","val":"prod"}]');
		});

		it("handles null, undefined, and empty objects gracefully", () => {
			expect(flattenObject(null)).toEqual({});
			expect(flattenObject(undefined)).toEqual({});
			expect(flattenObject({ empty: {} })).toEqual({ empty: "{}" });
		});
	});

	describe("findCandidateArrays and Smart Array Detection", () => {
		it("discovers outermost array of objects inside deep pure object hierarchy", () => {
			const deepObject = {
				meta: { requestId: "req-123", success: true },
				api: {
					v2: {
						members: [
							{
								id: "m-1",
								account: { username: "polma", tier: "premium" },
								roles: ["admin"],
							},
							{
								id: "m-2",
								account: { username: "sarah", tier: "standard" },
								roles: ["member"],
							},
						],
					},
				},
			};

			const candidates = findCandidateArrays(deepObject);
			expect(candidates.length).toBeGreaterThan(0);
			expect(candidates[0].path).toBe("api.v2.members");
			expect(candidates[0].count).toBe(2);
			expect(candidates[0].isObjectArray).toBe(true);

			const result = convertJsonToCsv(deepObject);
			expect(result.detectedPath).toBe("api.v2.members");
			expect(result.totalRows).toBe(2);
			expect(result.headers).toEqual([
				"id",
				"account.username",
				"account.tier",
				"roles",
			]);
			expect(result.csv).toContain("m-1,polma,premium");
			expect(result.csv).toContain("m-2,sarah,standard");
		});

		it("prioritizes array of objects over array of primitive tags", () => {
			const mixed = {
				tags: ["dev", "lead", "staff"],
				records: [
					{ sku: "A1", info: { stock: 10 } },
					{ sku: "B2", info: { stock: 20 } },
				],
			};

			const candidates = findCandidateArrays(mixed);
			expect(candidates[0].path).toBe("records");
			expect(candidates[0].isObjectArray).toBe(true);

			const result = convertJsonToCsv(mixed);
			expect(result.detectedPath).toBe("records");
			expect(result.totalRows).toBe(2);
			expect(result.headers).toEqual(["sku", "info.stock"]);
		});

		it("merges parent context fields when mergeParentFields option is true", () => {
			const payload = {
				organization: "Antigravity",
				year: 2026,
				response: {
					department: "Core Engineering",
					staff: [
						{ empId: 101, name: "Polma", location: { city: "Jakarta" } },
						{ empId: 102, name: "Elena", location: { city: "SPb" } },
					],
				},
			};

			const result = convertJsonToCsv(payload, { mergeParentFields: true });
			expect(result.detectedPath).toBe("response.staff");
			expect(result.totalRows).toBe(2);
			expect(result.headers).toContain("organization");
			expect(result.headers).toContain("year");
			expect(result.headers).toContain("response.department");
			expect(result.headers).toContain("empId");
			expect(result.headers).toContain("location.city");
			expect(result.csv).toContain(
				"Antigravity,2026,Core Engineering,101,Polma,Jakarta",
			);
		});

		it("allows selecting a specific candidate array via arrayPath option", () => {
			const multiArray = {
				orders: [{ orderId: "O-1" }, { orderId: "O-2" }],
				customers: [{ custId: "C-1", name: "Alice" }],
			};

			const result = convertJsonToCsv(multiArray, { arrayPath: "customers" });
			expect(result.detectedPath).toBe("customers");
			expect(result.totalRows).toBe(1);
			expect(result.headers).toEqual(["custId", "name"]);
			expect(result.csv).toContain("C-1,Alice");
		});
	});

	describe("extractRecordArray", () => {
		it("returns arrays untouched if already an array of objects", () => {
			const arr = [{ id: 1 }, { id: 2 }];
			expect(extractRecordArray(arr)).toEqual(arr);
		});

		it("unwraps envelope objects with data or items keys", () => {
			const envelope = {
				status: 200,
				total: 2,
				data: [
					{ id: 10, title: "Alpha" },
					{ id: 20, title: "Beta" },
				],
			};
			expect(extractRecordArray(envelope)).toEqual([
				{ id: 10, title: "Alpha" },
				{ id: 20, title: "Beta" },
			]);
		});

		it("wraps a single entity object into a single-item array", () => {
			const single = { id: 99, name: "Single User" };
			expect(extractRecordArray(single)).toEqual([single]);
		});
	});

	describe("convertJsonToCsv", () => {
		it("converts nested JSON rows into uniform CSV with dot headers", () => {
			const json = [
				{
					id: 1,
					user: { name: "Alice", email: "alice@example.com" },
					status: "active",
				},
				{
					id: 2,
					user: { name: "Bob", email: "bob@example.com" },
					status: "pending",
				},
			];

			const result = convertJsonToCsv(json);
			expect(result.totalRows).toBe(2);
			expect(result.headers).toEqual([
				"id",
				"user.name",
				"user.email",
				"status",
			]);
			expect(result.csv).toContain("id,user.name,user.email,status");
			expect(result.csv).toContain("1,Alice,alice@example.com,active");
			expect(result.csv).toContain("2,Bob,bob@example.com,pending");
		});

		it("handles heterogeneous keys across multiple objects", () => {
			const json = [
				{ id: 1, name: "Alice", extra: "one" },
				{ id: 2, name: "Bob", detail: "two" },
			];

			const result = convertJsonToCsv(json);
			expect(result.headers).toEqual(["id", "name", "extra", "detail"]);
			expect(result.rows[0].detail).toBe("");
			expect(result.rows[1].extra).toBe("");
		});

		it("supports custom delimiters such as semicolon and tab", () => {
			const json = [{ a: 1, b: 2 }];
			const semicolonResult = convertJsonToCsv(json, { delimiter: ";" });
			expect(semicolonResult.csv).toContain("a;b\r\n1;2");

			const tabResult = convertJsonToCsv(json, { delimiter: "\t" });
			expect(tabResult.csv).toContain("a\tb\r\n1\t2");
		});

		it("prepends UTF-8 BOM when bom option is true", () => {
			const json = [{ text: "Halo Dunia" }];
			const result = convertJsonToCsv(json, { bom: true });
			expect(result.csv.startsWith("\uFEFF")).toBe(true);
		});

		it("excludes specified row indices from the generated CSV output", () => {
			const json = [
				{ id: 1, name: "Alice" },
				{ id: 2, name: "Bob" },
				{ id: 3, name: "Charlie" },
			];

			// Exclude row index 1 (Bob)
			const result = convertJsonToCsv(json, { excludedIndices: [1] });
			expect(result.totalRows).toBe(2);
			expect(result.rowIndices).toEqual([0, 2]);
			expect(result.csv).toContain("1,Alice");
			expect(result.csv).not.toContain("2,Bob");
			expect(result.csv).toContain("3,Charlie");
		});

		it("excludes specified columns from headers and generated CSV", () => {
			const json = [
				{ id: 1, name: "Alice", email: "alice@test.com", role: "admin" },
				{ id: 2, name: "Bob", email: "bob@test.com", role: "dev" },
			];

			// Exclude 'email' and 'role'
			const result = convertJsonToCsv(json, {
				excludedColumns: ["email", "role"],
			});
			expect(result.headers).toEqual(["id", "name"]);
			expect(result.allHeaders).toEqual(["id", "name", "email", "role"]);
			expect(result.csv).toContain("id,name");
			expect(result.csv).not.toContain("email");
			expect(result.csv).not.toContain("role");
			expect(result.csv).toContain("1,Alice");
			expect(result.csv).toContain("2,Bob");
		});

		it("combines multiple outermost sibling arrays into a single table with _source_key while ignoring deeper nested arrays", () => {
			const payload = {
				message: "success",
				data: {
					from: "2026-10-01",
					to: "2026-10-23",
					buy: [
						{ time: "09:00", lot: { raw: "100" }, value: { raw: "500000" } },
						{ time: "09:01", lot: { raw: "200" }, value: { raw: "1000000" } },
					],
					sell: [
						{ time: "09:02", lot: { raw: "150" }, value: { raw: "750000" } },
					],
					prices: [{ time: "09:00", value: { raw: "5000" } }],
					big_money_rt: {
						buy: [{ time: "09:00", lot: { raw: "999" } }],
					},
				},
			};

			const result = convertJsonToCsv(payload);
			expect(result.detectedPath).toBe("data (all arrays)");
			expect(result.totalRows).toBe(4); // 2 buy + 1 sell + 1 prices
			expect(result.headers[0]).toBe("_source_key");
			expect(result.headers).toContain("time");
			expect(result.headers).toContain("lot.raw");
			expect(result.headers).toContain("value.raw");

			// Deeper nested array (big_money_rt.buy) is NOT merged into this outermost table
			expect(result.csv).not.toContain("999");

			// Rows have correct _source_key tags
			expect(result.csv).toContain("buy,09:00,100,500000");
			expect(result.csv).toContain("sell,09:02,150,750000");
			expect(result.csv).toContain("prices,09:00");
		});

		it("returns empty result on empty or falsy input", () => {
			const result = convertJsonToCsv([]);
			expect(result.csv).toBe("");
			expect(result.headers).toEqual([]);
			expect(result.rows).toEqual([]);
			expect(result.totalRows).toBe(0);
		});
	});
});
