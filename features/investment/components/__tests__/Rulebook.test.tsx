import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import Rulebook from "../Rulebook";

describe("Rulebook Component", () => {
	it("renders all six sections of the disciplined rebuild rulebook", () => {
		const { container } = render(<Rulebook />);

		expect(container.textContent).toContain("Disciplined Rebuild Rulebook");

		// Section 1: Capital Buckets
		expect(container.textContent).toContain("1. Capital Buckets Architecture");
		expect(container.textContent).toContain(
			"Safe Yield & Capital Preservation",
		);
		expect(container.textContent).toContain("Tactical Trading & Swing");

		// Section 2: Six Golden Rules
		expect(container.textContent).toContain(
			"2. The Six Golden Rules of Trading Discipline",
		);
		expect(container.textContent).toContain("Survival is the Ultimate Alpha");
		expect(container.textContent).toContain(
			"Never Average Down on a Losing Trade",
		);

		// Section 3: Circuit Breakers & Bans
		expect(container.textContent).toContain(
			"3. Mechanical Drawdown Circuit Breakers",
		);
		expect(container.textContent).toContain("4. Non-Negotiable Hard Bans");

		// Section 5: Pre-Trade Checklist
		expect(container.textContent).toContain(
			"5. Pre-Trade Execution Checklist (5 Gates)",
		);

		// Section 6: Recovery Math
		expect(container.textContent).toContain("6. The Brutal Math of Drawdown");
		expect(container.textContent).toContain("-80%");
		expect(container.textContent).toContain("+400%");
	});
});
