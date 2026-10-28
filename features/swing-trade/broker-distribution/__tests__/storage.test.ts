import { beforeEach, describe, expect, it } from "vitest";
import {
	BROKER_DISTRIBUTION_STORAGE_KEY,
	readBrokerDistributionSettings,
	saveBrokerDistributionSettings,
} from "../lib/storage";
import { DEFAULT_BROKER_DISTRIBUTION_SETTINGS } from "../types";

describe("Broker Distribution Storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns defaults when localStorage is empty", () => {
		const settings = readBrokerDistributionSettings();
		expect(settings).toEqual(DEFAULT_BROKER_DISTRIBUTION_SETTINGS);
	});

	it("pre-fills baseUrl and token from market-detector or running-trade-chart settings", () => {
		localStorage.setItem(
			"market-detector:settings",
			JSON.stringify({
				baseUrl: "https://api.broker.id",
				token: "broker-test-token-123",
			}),
		);

		const settings = readBrokerDistributionSettings();
		expect(settings.baseUrl).toBe("https://api.broker.id");
		expect(settings.token).toBe("broker-test-token-123");
		expect(settings.period).toBe("TB_PERIOD_LAST_3_MONTHS");
	});

	it("saves and reads settings to broker-distribution:settings", () => {
		const custom = {
			...DEFAULT_BROKER_DISTRIBUTION_SETTINGS,
			symbol: "DOOH",
			token: "custom-token-bd",
			period: "TB_PERIOD_LAST_6_MONTHS" as const,
			dataType: "BROKER_DISTRIBUTION_DATA_TYPE_VALUE" as const,
		};

		saveBrokerDistributionSettings(custom);
		const read = readBrokerDistributionSettings();
		expect(read.symbol).toBe("DOOH");
		expect(read.token).toBe("custom-token-bd");
		expect(read.period).toBe("TB_PERIOD_LAST_6_MONTHS");
		expect(read.dataType).toBe("BROKER_DISTRIBUTION_DATA_TYPE_VALUE");
		expect(localStorage.getItem(BROKER_DISTRIBUTION_STORAGE_KEY)).toBeDefined();
	});
});
