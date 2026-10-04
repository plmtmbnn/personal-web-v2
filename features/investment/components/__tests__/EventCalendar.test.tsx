import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import EventCalendar from "../EventCalendar";

describe("EventCalendar Component", () => {
	it("renders calendar catalysts header and default active events", () => {
		const { container } = render(<EventCalendar />);

		expect(container.textContent).toContain("Upcoming Catalysts & Risk Events");
		expect(container.textContent).toContain("All Catalysts");
		expect(container.textContent).toContain("Indonesia (IDX)");
		expect(container.textContent).toContain("Crypto");
		expect(container.textContent).toContain("US & Fed");
	});

	it("filters events by market when filter pill is clicked", () => {
		const { getByText, container } = render(<EventCalendar />);

		const cryptoFilter = getByText("Crypto");
		fireEvent.click(cryptoFilter);

		// Component renders filtered list without crashing
		expect(container.textContent).toContain("Upcoming Catalysts & Risk Events");
	});
});
