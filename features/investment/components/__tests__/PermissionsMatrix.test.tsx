import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import PermissionsMatrix from "../PermissionsMatrix";
import type { PermissionsMatrixData } from "../../types";

const mockPermissions: PermissionsMatrixData = {
	ihsg: {
		scalp: {
			status: "not_allowed",
			label: "Not Allowed",
			reason: "Bearish trend",
		},
		swing: {
			status: "selective",
			label: "Selective Only",
			reason: "Only on oversold pullbacks",
		},
		dca: {
			status: "allowed",
			label: "Permitted",
			reason: "Disciplined value accumulation",
		},
		maxExposure: "20% equity cap",
	},
	crypto: {
		scalp: {
			status: "allowed",
			label: "Permitted",
			reason: "High volatility regime",
		},
		swing: {
			status: "allowed",
			label: "Permitted",
			reason: "Clear upward trend",
		},
		dca: {
			status: "allowed",
			label: "Permitted",
			reason: "Monthly tranche",
		},
		maxExposure: "15% total portfolio",
	},
	altcoins: {
		scalp: {
			status: "not_allowed",
			label: "Gated",
			reason: "BTC dominance > 54%",
		},
		swing: {
			status: "not_allowed",
			label: "Gated",
			reason: "BTC dominance > 54%",
		},
		dca: {
			status: "not_allowed",
			label: "Forbidden",
			reason: "Altcoins strictly non-DCA",
		},
		maxExposure: "0% (Hard Lock)",
	},
	ihsgSectorGates: ["Consumer Non-Cyclicals", "Healthcare"],
	globalStressActive: false,
	summaryNotes: ["Selective market environment"],
};

describe("PermissionsMatrix Component", () => {
	it("renders permissions matrix table and rows", () => {
		const { container } = render(
			<PermissionsMatrix permissions={mockPermissions} />,
		);

		expect(container.textContent).toContain("Tactical Permissions Matrix");
		expect(container.textContent).toContain("Indonesia (IHSG)");
		expect(container.textContent).toContain("Crypto Majors");
		expect(container.textContent).toContain("Speculative Altcoins");
		expect(container.textContent).toContain("20% equity cap");
		expect(container.textContent).toContain("0% (Hard Lock)");
	});

	it("renders capital preservation banner when globalStressActive is true", () => {
		const stressPermissions: PermissionsMatrixData = {
			...mockPermissions,
			globalStressActive: true,
		};

		const { container } = render(
			<PermissionsMatrix permissions={stressPermissions} />,
		);

		expect(container.textContent).toContain(
			"Capital Preservation Protocol Active",
		);
		expect(container.textContent).toContain("Zero New Margin / Leverage");
		expect(container.textContent).toContain("Hold Dry Powder in SBN / Cash");
	});

	it("does not render capital preservation banner when globalStressActive is false", () => {
		const { container } = render(
			<PermissionsMatrix permissions={mockPermissions} />,
		);

		expect(container.textContent).not.toContain(
			"Capital Preservation Protocol Active",
		);
	});
});
