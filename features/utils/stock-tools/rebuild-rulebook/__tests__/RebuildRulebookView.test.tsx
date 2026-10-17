import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import RebuildRulebookView from "../components/View";

vi.mock("framer-motion", () => ({
	motion: new Proxy(
		{},
		{
			get: (_target, prop: string) => {
				return ({
					children,
					className,
				}: {
					children?: React.ReactNode;
					className?: string;
				}) => {
					const Tag = prop as keyof React.JSX.IntrinsicElements;
					return <Tag className={className}>{children}</Tag>;
				};
			},
		},
	),
	useReducedMotion: () => false,
}));

describe("RebuildRulebookView Component", () => {
	it("renders all interactive workstations and reference protocols", () => {
		const { container } = render(<RebuildRulebookView />);

		expect(container.textContent).toContain("Disciplined Rebuild Rulebook");
		expect(container.textContent).toContain(
			"1. Interactive Capital Bucket Sizer",
		);
		expect(container.textContent).toContain(
			"2. Pre-Trade Execution Checklist (5 Gates)",
		);
		expect(container.textContent).toContain(
			"3. The Brutal Math of Drawdown Simulator",
		);
		expect(container.textContent).toContain(
			"4. The Six Golden Rules of Trading Discipline",
		);
		expect(container.textContent).toContain(
			"5. Mechanical Drawdown Circuit Breakers",
		);
		expect(container.textContent).toContain("6. Non-Negotiable Hard Bans");
	});

	it("calculates 40/45/15 capital bucket allocations correctly", () => {
		render(<RebuildRulebookView />);

		// Default capital is Rp 100,000,000 (100M)
		// Safe Yield (40%): Rp 40,000,000
		// Core (45%): Rp 45,000,000
		// Swing (15%): Rp 15,000,000
		expect(screen.getByText("Rp 40.000.000")).toBeDefined();
		expect(screen.getByText("Rp 45.000.000")).toBeDefined();
		expect(screen.getByText("Rp 15.000.000")).toBeDefined();
	});

	it("toggles 5-gate checklist and authorizes trade only when all 5 pass", () => {
		render(<RebuildRulebookView />);

		// Initially blocked (0/5)
		expect(screen.getByText(/0\/5 Passed • Trade Blocked/)).toBeDefined();

		// Click all 5 gates
		const gate1 = screen.getByText(/Gate 1:/);
		const gate2 = screen.getByText(/Gate 2:/);
		const gate3 = screen.getByText(/Gate 3:/);
		const gate4 = screen.getByText(/Gate 4:/);
		const gate5 = screen.getByText(/Gate 5:/);

		fireEvent.click(gate1);
		expect(screen.getByText(/1\/5 Passed • Trade Blocked/)).toBeDefined();

		fireEvent.click(gate2);
		fireEvent.click(gate3);
		fireEvent.click(gate4);
		fireEvent.click(gate5);

		// Now all 5 passed
		expect(screen.getByText(/5\/5 Passed • Trade Authorized/)).toBeDefined();

		// Reset gates
		const resetBtn = screen.getByText("Reset Gates");
		fireEvent.click(resetBtn);
		expect(screen.getByText(/0\/5 Passed • Trade Blocked/)).toBeDefined();
	});

	it("updates drawdown recovery math simulator dynamically", () => {
		render(<RebuildRulebookView />);

		// Default loss is 20% -> +25.0% gain needed
		expect(screen.getAllByText("+25.0%").length).toBeGreaterThan(0);

		const slider = screen.getByLabelText(/Simulate Portfolio Loss Percentage:/);
		fireEvent.change(slider, { target: { value: "50" } });

		// 50% loss -> +100.0% gain needed
		expect(screen.getAllByText("+100.0%").length).toBeGreaterThan(0);
	});
});
