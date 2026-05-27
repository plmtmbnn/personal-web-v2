import { describe, test, expect } from "vitest";
import { destinations } from "../data";

describe("Travel Data", () => {
	test("destinations should match Destination type", () => {
		expect(destinations).toBeDefined();
		expect(Array.isArray(destinations)).toBe(true);
		expect(destinations.length).toBeGreaterThan(0);

		const firstDestination = destinations[0];
		expect(firstDestination).toHaveProperty("id");
		expect(firstDestination).toHaveProperty("name");
		expect(firstDestination).toHaveProperty("location");
		expect(firstDestination).toHaveProperty("country");
		expect(firstDestination).toHaveProperty("type");
		expect(firstDestination).toHaveProperty("isVisited");
		expect(firstDestination).toHaveProperty("imageUrl");
		expect(firstDestination).toHaveProperty("description");
	});

	test("all destinations have required fields", () => {
		for (const dest of destinations) {
			expect(typeof dest.id).toBe("string");
			expect(typeof dest.name).toBe("string");
			expect(typeof dest.location).toBe("string");
			expect(typeof dest.country).toBe("string");
			expect(["domestic", "international"]).toContain(dest.type);
			expect(typeof dest.isVisited).toBe("boolean");
			expect(typeof dest.imageUrl).toBe("string");
			expect(typeof dest.description).toBe("string");

			if (dest.isVisited) {
				expect(dest.visitedDate).toBeDefined();
				expect(typeof dest.visitedDate).toBe("string");
				expect(dest.visitedDate).toMatch(/^\d{4}-\d{2}$/);
			}
		}
	});
});
