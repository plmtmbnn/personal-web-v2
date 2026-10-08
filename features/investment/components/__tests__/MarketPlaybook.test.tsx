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

	it("renders Circuit Breaker lock when composite score is below 40", () => {
		const mockPlaybooks = {
			ihsg: PLAYBOOK_SCRIPTS.IHSG.defensive,
			crypto: PLAYBOOK_SCRIPTS.Crypto.defensive,
		};

		const { container } = render(
			<MarketPlaybook
				playbooks={mockPlaybooks}
				scores={{ ihsg: 30, crypto: 30 }}
			/>,
		);

		expect(container.textContent).toContain("No Trade Zone");
		expect(container.textContent).toContain(
			"Circuit breaker active. All tactical trading locked.",
		);
	});

	it("renders Volatility Alert when short-term volatility expands", () => {
		const mockPlaybooks = {
			ihsg: PLAYBOOK_SCRIPTS.IHSG.risk_on,
			crypto: PLAYBOOK_SCRIPTS.Crypto.risk_on,
		};

		// Fake PriceHistory that triggers volatility expansion.
		// We can just simulate it by passing high variance data
		const points = [];
		let p = 100;
		for (let i = 0; i < 90; i++) {
			points.push({ c: p });
		}
		// Last 14 days highly volatile
		for (let i = 0; i < 14; i++) {
			p = p * (i % 2 === 0 ? 1.05 : 0.95); // 5% daily swings
			points.push({ c: p });
		}

		const mockData: any = {
			markets: {
				history: {
					"^JKSE": { points },
				},
			},
		};

		const { container } = render(
			<MarketPlaybook playbooks={mockPlaybooks} compassData={mockData} />,
		);

		expect(container.textContent).toContain("EXPANDED VOLATILITY DETECTED");
	});
});
