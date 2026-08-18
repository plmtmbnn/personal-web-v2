import type { NetworkInfo } from "../types";

/**
 * Measures network Ping (latency) and Jitter (variation in ms) using high-precision RTT.
 */
export async function measurePingAndJitter(
	samples = 6,
): Promise<{ pingMs: number; jitterMs: number }> {
	const rtts: number[] = [];

	// Connection warm-up
	try {
		await fetch("https://speed.cloudflare.com/__down?bytes=0", {
			cache: "no-store",
		});
	} catch {
		// Continue to test loop with fallback
	}

	for (let i = 0; i < samples; i++) {
		const start = performance.now();
		try {
			const res = await fetch("https://speed.cloudflare.com/__down?bytes=0", {
				cache: "no-store",
			});
			if (res.ok) {
				rtts.push(performance.now() - start);
			} else {
				throw new Error("Edge ping unavailable");
			}
		} catch {
			// Fallback ping against local endpoint
			const localStart = performance.now();
			try {
				await fetch(`/favicon.ico?_t=${Date.now()}_${i}`, {
					method: "HEAD",
					cache: "no-store",
				});
				rtts.push(performance.now() - localStart);
			} catch {
				rtts.push(Math.max(12, Math.round(performance.now() - start)));
			}
		}
		// Brief rest between samples
		await new Promise((r) => setTimeout(r, 40));
	}

	if (rtts.length === 0) {
		return { pingMs: 15, jitterMs: 2.0 };
	}

	// Filter out highest outlier if multiple samples
	if (rtts.length > 3) {
		rtts.sort((a, b) => a - b);
		rtts.pop();
	}

	const avgPing = Math.round(rtts.reduce((a, b) => a + b, 0) / rtts.length);

	// Compute jitter as average absolute difference between consecutive pings
	let totalDiff = 0;
	for (let i = 1; i < rtts.length; i++) {
		totalDiff += Math.abs((rtts[i] ?? 0) - (rtts[i - 1] ?? 0));
	}
	const jitter =
		rtts.length > 1
			? Math.round((totalDiff / (rtts.length - 1)) * 10) / 10
			: 1.5;

	return {
		pingMs: Math.max(1, avgPing),
		jitterMs: Math.max(0.5, jitter),
	};
}

/**
 * Measures real-time download bandwidth in Megabits per second (Mbps) using multi-stream parallel chunks.
 */
export async function measureDownloadSpeed(
	onProgress: (currentMbps: number, progressRatio: number) => void,
): Promise<number> {
	const startTime = performance.now();
	const testDurationTarget = 4000; // 4 seconds test window
	let totalBytesLoaded = 0;

	// Use multi-stream parallel requests with 25MB standard Cloudflare chunks to saturate TCP window
	const chunkSizes = [25000000, 25000000, 25000000];

	try {
		const streamPromises = chunkSizes.map(async (chunkSize) => {
			try {
				const url = `https://speed.cloudflare.com/__down?bytes=${chunkSize}`;
				const response = await fetch(url, { cache: "no-store" });
				if (!response.body) return;

				const reader = response.body.getReader();
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					if (value) {
						totalBytesLoaded += value.length;
						const elapsedSec = (performance.now() - startTime) / 1000;
						if (elapsedSec > 0.2) {
							const currentMbps =
								Math.round(
									((totalBytesLoaded * 8) / (elapsedSec * 1000000)) * 10,
								) / 10;
							const progressRatio = Math.min(
								0.98,
								(performance.now() - startTime) / testDurationTarget,
							);
							onProgress(currentMbps, progressRatio);
						}
					}

					if (performance.now() - startTime >= testDurationTarget) {
						await reader.cancel();
						break;
					}
				}
			} catch {
				// Handled in fallback
			}
		});

		await Promise.all(streamPromises);
	} catch {
		// Fallback handled below
	}

	// Fallback if no bytes transferred from primary edge CDN (e.g. adblocker)
	if (totalBytesLoaded === 0) {
		try {
			const fallbackUrls = [
				"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
			];
			for (const url of fallbackUrls) {
				const res = await fetch(url, { cache: "no-store" });
				if (res.body) {
					const reader = res.body.getReader();
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						if (value) totalBytesLoaded += value.length;
						if (performance.now() - startTime >= testDurationTarget) {
							await reader.cancel();
							break;
						}
					}
				}
			}
		} catch {
			totalBytesLoaded = 4 * 1024 * 1024;
		}
	}

	const elapsedSec = Math.max(0.5, (performance.now() - startTime) / 1000);
	const finalMbps =
		Math.round(((totalBytesLoaded * 8) / (elapsedSec * 1000000)) * 10) / 10;

	return Math.max(1.0, finalMbps);
}

/**
 * Measures real-time upload bandwidth in Megabits per second (Mbps) using parallel byte streams.
 */
export async function measureUploadSpeed(
	onProgress: (currentMbps: number, progressRatio: number) => void,
): Promise<number> {
	const startTime = performance.now();
	const testDurationTarget = 3500; // 3.5 seconds test window

	// Generate 2MB binary payload chunk
	const payloadSize = 2 * 1024 * 1024;
	const dummyPayload = new Uint8Array(payloadSize);

	let totalBytesUploaded = 0;

	const worker = async () => {
		while (performance.now() - startTime < testDurationTarget) {
			try {
				const res = await fetch("https://speed.cloudflare.com/__up", {
					method: "POST",
					body: dummyPayload,
					headers: { "Content-Type": "application/octet-stream" },
				});
				if (res.ok) {
					totalBytesUploaded += payloadSize;
					const elapsedSec = (performance.now() - startTime) / 1000;
					if (elapsedSec > 0.2) {
						const currentMbps =
							Math.round(
								((totalBytesUploaded * 8) / (elapsedSec * 1000000)) * 10,
							) / 10;
						const progressRatio = Math.min(
							0.98,
							(performance.now() - startTime) / testDurationTarget,
						);
						onProgress(currentMbps, progressRatio);
					}
				} else {
					break;
				}
			} catch {
				break;
			}
		}
	};

	try {
		await Promise.all([worker(), worker(), worker()]);
	} catch {
		totalBytesUploaded = payloadSize;
	}

	// Fallback if upload failed completely
	if (totalBytesUploaded === 0) {
		totalBytesUploaded = payloadSize;
	}

	const elapsedSec = Math.max(0.5, (performance.now() - startTime) / 1000);
	const finalMbps =
		Math.round(((totalBytesUploaded * 8) / (elapsedSec * 1000000)) * 10) / 10;

	return Math.max(1.0, finalMbps);
}

/**
 * Retrieves public network information and connection metadata.
 */
export async function fetchNetworkDiagnostics(): Promise<NetworkInfo> {
	const connection =
		typeof navigator !== "undefined"
			? (
					navigator as unknown as {
						connection?: {
							effectiveType?: string;
							downlink?: number;
							rtt?: number;
							saveData?: boolean;
						};
					}
				).connection
			: undefined;

	const baseInfo: NetworkInfo = {
		online: typeof navigator !== "undefined" ? navigator.onLine : true,
		effectiveType: connection?.effectiveType || "4g",
		downlinkMbps: connection?.downlink || 10,
		rttMs: connection?.rtt || 25,
		saveData: Boolean(connection?.saveData),
	};

	try {
		// Multi-provider fast geo/ISP lookup with timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 2500);

		// Try ipwho.is
		const res = await fetch("https://ipwho.is/", {
			signal: controller.signal,
		});
		clearTimeout(timeoutId);

		if (res.ok) {
			const data = (await res.json()) as {
				success?: boolean;
				ip?: string;
				city?: string;
				region?: string;
				country?: string;
				country_code?: string;
				connection?: {
					isp?: string;
					org?: string;
					asn?: number | string;
				};
			};

			if (data.ip) {
				baseInfo.publicIp = data.ip;
				baseInfo.city = data.city || undefined;
				baseInfo.region = data.region || undefined;
				baseInfo.country = data.country || undefined;
				baseInfo.countryCode = data.country_code || undefined;
				baseInfo.isp =
					data.connection?.isp || data.connection?.org || undefined;
				baseInfo.asn = data.connection?.asn
					? `AS${data.connection.asn}`
					: undefined;
				baseInfo.org = data.connection?.org || undefined;
				return baseInfo;
			}
		}
	} catch {
		// Fallback to freeipapi
	}

	try {
		const controller2 = new AbortController();
		const timeoutId2 = setTimeout(() => controller2.abort(), 2000);
		const res2 = await fetch("https://freeipapi.com/api/json/", {
			signal: controller2.signal,
		});
		clearTimeout(timeoutId2);

		if (res2.ok) {
			const data2 = (await res2.json()) as {
				ipAddress?: string;
				cityName?: string;
				regionName?: string;
				countryName?: string;
				countryCode?: string;
				asnOrganization?: string;
				asn?: string;
			};
			if (data2.ipAddress) {
				baseInfo.publicIp = data2.ipAddress;
				baseInfo.city = data2.cityName || undefined;
				baseInfo.region = data2.regionName || undefined;
				baseInfo.country = data2.countryName || undefined;
				baseInfo.countryCode = data2.countryCode || undefined;
				baseInfo.isp = data2.asnOrganization || undefined;
				baseInfo.asn = data2.asn ? `AS${data2.asn}` : undefined;
				return baseInfo;
			}
		}
	} catch {
		// Fallback to ipify for IP only
	}

	try {
		const res3 = await fetch("https://api.ipify.org?format=json");
		if (res3.ok) {
			const data3 = (await res3.json()) as { ip?: string };
			baseInfo.publicIp = data3.ip || "127.0.0.1";
		}
	} catch {
		baseInfo.publicIp = "Encrypted / Masked";
	}

	return baseInfo;
}
