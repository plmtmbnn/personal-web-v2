import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import MarketPlaybook from "../MarketPlaybook";
import { PLAYBOOK_SCRIPTS } from "../../data/playbooks";

describe("MarketPlaybook Component", () => {
	it("renders both IHSG and Crypto playbooks and Safe Bucket Anchor card", () => {
		const mockPlaybooks = {
			ihsg: PLAYBOOK_SCRIPTS.IHSG.defensive,
			crypto: PLAYBOOK_SCRIPTS.Crypto.risk_on,
		};

		const { container } = render(<MarketPlaybook playbooks={mockPlaybooks} />);

		expect(container.textContent).toContain("Execution Playbook");
		expect(container.textContent).toContain("IHSG Tactical Playbook");
		expect(container.textContent).toContain("Crypto Tactical Playbook");

		// Posture and headlines
		expect(container.textContent).toContain(
			PLAYBOOK_SCRIPTS.IHSG.defensive.posture,
		);
		expect(container.textContent).toContain(
			PLAYBOOK_SCRIPTS.Crypto.risk_on.posture,
		);

		// Tactical Dos & Avoids
		expect(container.textContent).toContain("Tactical Dos");
		expect(container.textContent).toContain("Strict Avoids");

		// Safe Bucket 40% Anchor
		expect(container.textContent).toContain(
			"Safe Yield & Preservation Anchor (40% Target)",
		);
		expect(container.textContent).toContain("Retail SBN (ORI / SBR / ST)");
		expect(container.textContent).toContain("Liquid Bank Deposits (RDN)");
		expect(container.textContent).toContain("Physical Gold (LM Antam)");
	});

	it("renders predetermined tranche accumulation plan when provided", () => {
		const mockPlaybooks = {
			ihsg: PLAYBOOK_SCRIPTS.IHSG.stress,
			crypto: PLAYBOOK_SCRIPTS.Crypto.stress,
		};

		const { container } = render(<MarketPlaybook playbooks={mockPlaybooks} />);

		expect(container.textContent).toContain("Predetermined Tranche Plan");
	});
});
