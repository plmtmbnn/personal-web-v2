"use client";

import { useCallback, useEffect, useState } from "react";
import {
	getMarketCredentialsAction,
	saveMarketCredentialsAction,
} from "../actions";
import type { MarketCredentials } from "../types";

export function useMarketCredentials() {
	const [credentials, setCredentials] = useState<MarketCredentials | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	const loadCredentials = useCallback(async () => {
		try {
			const data = await getMarketCredentialsAction();
			setCredentials(data);
		} catch (error) {
			console.error("Failed to load market credentials from Redis:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCredentials();

		const handleUpdated = (event: Event) => {
			const customEvent = event as CustomEvent<{
				credentials?: MarketCredentials;
			}>;
			if (customEvent.detail?.credentials) {
				setCredentials(customEvent.detail.credentials);
			} else {
				loadCredentials();
			}
		};

		window.addEventListener("market:credentials:updated", handleUpdated);
		return () => {
			window.removeEventListener("market:credentials:updated", handleUpdated);
		};
	}, [loadCredentials]);

	const saveCredentials = async (input: { baseUrl: string; token: string }) => {
		const res = await saveMarketCredentialsAction(input);
		if (res.success && res.credentials) {
			setCredentials(res.credentials);
			window.dispatchEvent(
				new CustomEvent("market:credentials:updated", {
					detail: { credentials: res.credentials },
				}),
			);
		}
		return res;
	};

	return {
		credentials,
		loading,
		saveCredentials,
		reload: loadCredentials,
	};
}
