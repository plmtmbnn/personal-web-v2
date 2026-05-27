import { describe, expect, it } from "vitest";

// Mocking simple logic for test
const formatVisitedDate = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
	});
};

describe("DestinationCard Logic", () => {
	it("should format visited date correctly", () => {
		expect(formatVisitedDate("2024-03")).toBe("Mar 2024");
		expect(formatVisitedDate("2023-11")).toBe("Nov 2023");
	});
});
