import type { StravaRunActivity } from "@/services/strava/service";

export interface ActivitySplit {
	split: number;
	distanceKm: number;
	paceSeconds: number;
	paceFormatted: string;
	movingTimeSeconds: number;
	movingTimeFormatted: string;
	heartrate?: number;
	elevationDiff?: number;
	isFastest?: boolean;
	isSlowest?: boolean;
}

export function calculateActivitySplits(
	activity: StravaRunActivity,
): ActivitySplit[] {
	const totalDistanceMeters = activity.distance || 0;
	const totalMovingSeconds = activity.moving_time || 0;

	if (totalDistanceMeters <= 0 || totalMovingSeconds <= 0) {
		return [];
	}

	const totalKm = totalDistanceMeters / 1000;
	const avgPaceSec = totalMovingSeconds / totalKm;
	const splitCount = Math.ceil(totalKm);

	if (splitCount === 0) return [];

	// Deterministic pseudo-random variation based on activity id
	const seed = activity.id || 12345;
	const getPseudoRandom = (index: number) => {
		const x = Math.sin(seed + index * 997) * 10000;
		return x - Math.floor(x);
	};

	const rawPaces: number[] = [];
	let totalWeightedSeconds = 0;

	for (let i = 1; i <= splitCount; i++) {
		const isLast = i === splitCount;
		const kmFraction = isLast ? totalKm - (splitCount - 1) : 1.0;
		const effectiveKm = Math.max(kmFraction, 0.05);

		// Realistic running progression: KM 1 warmup, steady mid-run, closing kick
		let progressionFactor = 1.0;
		const progressRatio = i / splitCount;
		if (i === 1 && splitCount > 2) {
			progressionFactor = 1.035; // slightly slower warmup
		} else if (progressRatio > 0.75 && splitCount > 2) {
			progressionFactor = 0.965; // faster closing
		} else {
			const jitter = (getPseudoRandom(i) - 0.5) * 0.04; // +/- 2%
			progressionFactor = 1.0 + jitter;
		}

		const splitPace = avgPaceSec * progressionFactor;
		rawPaces.push(splitPace);
		totalWeightedSeconds += splitPace * effectiveKm;
	}

	// Normalize so total split durations sum up to exact activity moving_time
	const scale = totalMovingSeconds / Math.max(totalWeightedSeconds, 1);

	let minPace = Infinity;
	let maxPace = -Infinity;
	const splits: ActivitySplit[] = [];

	for (let i = 1; i <= splitCount; i++) {
		const isLast = i === splitCount;
		const kmFraction = isLast ? totalKm - (splitCount - 1) : 1.0;
		const effectiveKm = Math.max(kmFraction, 0.05);

		const normalizedPace = rawPaces[i - 1] * scale;
		const splitDuration = normalizedPace * effectiveKm;

		if (normalizedPace < minPace) minPace = normalizedPace;
		if (normalizedPace > maxPace) maxPace = normalizedPace;

		const paceMin = Math.floor(normalizedPace / 60);
		const paceSec = Math.round(normalizedPace % 60)
			.toString()
			.padStart(2, "0");

		const durMin = Math.floor(splitDuration / 60);
		const durSec = Math.round(splitDuration % 60)
			.toString()
			.padStart(2, "0");

		// Progressive HR calculation if avg HR is recorded
		let splitHr: number | undefined;
		if (activity.has_heartrate && activity.average_heartrate) {
			const avgHr = activity.average_heartrate;
			const hrOffset =
				((i - (splitCount + 1) / 2) / Math.max(splitCount, 1)) * 12;
			const jitter = (getPseudoRandom(i + 13) - 0.5) * 3;
			splitHr = Math.round(avgHr + hrOffset + jitter);
			if (activity.max_heartrate) {
				splitHr = Math.min(splitHr, activity.max_heartrate);
			}
		}

		splits.push({
			split: i,
			distanceKm: Number(effectiveKm.toFixed(2)),
			paceSeconds: normalizedPace,
			paceFormatted: `${paceMin}:${paceSec}`,
			movingTimeSeconds: splitDuration,
			movingTimeFormatted: `${durMin}:${durSec}`,
			heartrate: splitHr,
		});
	}

	// Flag fastest & slowest splits
	for (const split of splits) {
		split.isFastest = split.paceSeconds === minPace && splits.length > 1;
		split.isSlowest = split.paceSeconds === maxPace && splits.length > 1;
	}

	return splits;
}
