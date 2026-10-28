import { describe, expect, it } from "vitest";
import type {
	BrokerDistributionData,
	TopBrokerBuy,
	TopBrokerSell,
} from "../types";

describe("Broker Distribution Data Processing", () => {
	const sampleData: BrokerDistributionData = {
		date_info: "Session 2 - 2026-10-27",
		start_date: "2026-07-27",
		end_date: "2026-10-27",
		by_volume: {
			top_broker_buy: [
				{
					detail: { code: "XL", type: "Lokal", amount: 1586912 },
					distribute_to: [
						{ code: "YB", type: "Lokal", amount: 800000 },
						{ code: "SF", type: "Lokal", amount: 400000 },
					],
				},
			],
			top_broker_sell: [
				{
					detail: { code: "YB", type: "Lokal", amount: 2151022 },
					distribute_to: [
						{ code: "XL", type: "Lokal", amount: 800000 },
						{ code: "CP", type: "Asing", amount: 600000 },
					],
				},
			],
		},
		by_value: {
			top_broker_buy: [
				{
					detail: { code: "XL", type: "Lokal", amount: 60031754200 },
					distribute_to: [{ code: "YB", type: "Lokal", amount: 30000000000 }],
				},
			],
			top_broker_sell: [
				{
					detail: { code: "YB", type: "Lokal", amount: 66439622400 },
					distribute_to: [{ code: "XL", type: "Lokal", amount: 30000000000 }],
				},
			],
		},
	};

	it("correctly identifies top buyer details and counterparties", () => {
		const buyer = sampleData.by_volume.top_broker_buy[0] as TopBrokerBuy;
		expect(buyer.detail.code).toBe("XL");
		expect(buyer.detail.amount).toBe(1586912);
		expect(buyer.distribute_to.length).toBe(2);

		const firstCounterparty = buyer.distribute_to[0];
		expect(firstCounterparty.code).toBe("YB");
		expect(firstCounterparty.amount).toBe(800000);

		// Calculate percentage of total buyer volume
		const pct = Math.round(
			(firstCounterparty.amount / buyer.detail.amount) * 100,
		);
		expect(pct).toBe(50);
	});

	it("correctly identifies top seller details and counterparties", () => {
		const seller = sampleData.by_volume.top_broker_sell[0] as TopBrokerSell;
		expect(seller.detail.code).toBe("YB");
		expect(seller.detail.amount).toBe(2151022);
		expect(seller.distribute_to.length).toBe(2);

		const foreignCp = seller.distribute_to[1];
		expect(foreignCp.code).toBe("CP");
		expect(foreignCp.type).toBe("Asing");
	});

	it("switches cleanly between volume and value data representations", () => {
		const volumeBuyers = sampleData.by_volume.top_broker_buy;
		const valueBuyers = sampleData.by_value.top_broker_buy;

		expect(volumeBuyers[0].detail.amount).toBe(1586912);
		expect(valueBuyers[0].detail.amount).toBe(60031754200);
	});
});
