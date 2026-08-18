import type {
	ConnectionSuitability,
	SpeedTestMetrics,
	SuitabilityMetric,
} from "../types";

/**
 * Calculates connection capability ratings and bufferbloat/latency grade
 * based on measured bandwidth, ping, and jitter.
 */
export function calculateConnectionSuitability(
	metrics: SpeedTestMetrics,
): ConnectionSuitability {
	const { downloadMbps, uploadMbps, pingMs, jitterMs } = metrics;

	// Calculate 4K Streaming Suitability
	let streaming: SuitabilityMetric;
	if (downloadMbps >= 25 && pingMs < 100) {
		streaming = {
			title: "4K UHD Video Streaming",
			verdict: "Ultra Smooth (4K 60fps)",
			status: "optimal",
			details:
				"Capable of simultaneous 4K streams with instant buffer playback.",
			iconName: "tv",
		};
	} else if (downloadMbps >= 10) {
		streaming = {
			title: "Full HD Video Streaming",
			verdict: "Ready for 1080p FHD",
			status: "good",
			details: "Smooth 1080p high bitrate playback on multiple screens.",
			iconName: "tv",
		};
	} else if (downloadMbps >= 5) {
		streaming = {
			title: "Standard HD Streaming",
			verdict: "720p HD Capable",
			status: "moderate",
			details: "Adequate for 720p streams; 4K may experience buffering.",
			iconName: "tv",
		};
	} else {
		streaming = {
			title: "Basic Video Streaming",
			verdict: "Standard Definition",
			status: "poor",
			details: "Low bandwidth may cause frequent video rebuffering.",
			iconName: "tv",
		};
	}

	// Calculate Gaming Suitability
	let gaming: SuitabilityMetric;
	if (pingMs <= 35 && jitterMs <= 4) {
		gaming = {
			title: "Competitive Online Gaming",
			verdict: "Esports Tournament Grade",
			status: "optimal",
			details:
				"Sub-40ms latency with minimal jitter for twitch reaction times.",
			iconName: "gamepad",
		};
	} else if (pingMs <= 60 && jitterMs <= 8) {
		gaming = {
			title: "Online Multiplayer Gaming",
			verdict: "Great for Competitive Play",
			status: "good",
			details: "Stable ping with low packet delay variation.",
			iconName: "gamepad",
		};
	} else if (pingMs <= 100) {
		gaming = {
			title: "Casual Online Gaming",
			verdict: "Playable / Moderate Delay",
			status: "moderate",
			details: "Sufficient for casual gaming; noticeable latency in fast FPS.",
			iconName: "gamepad",
		};
	} else {
		gaming = {
			title: "Online Gaming",
			verdict: "High Latency Detected",
			status: "poor",
			details: "Lag spikes likely due to elevated round-trip time (>100ms).",
			iconName: "gamepad",
		};
	}

	// Calculate Video Conferencing Suitability
	let videoConf: SuitabilityMetric;
	if (downloadMbps >= 10 && uploadMbps >= 5 && pingMs < 75) {
		videoConf = {
			title: "HD Video Calls (Zoom / Meet)",
			verdict: "Flawless Multi-party HD",
			status: "optimal",
			details: "Crystal clear 1080p screen sharing and group calls.",
			iconName: "video",
		};
	} else if (downloadMbps >= 5 && uploadMbps >= 2) {
		videoConf = {
			title: "Video Calling",
			verdict: "Stable 720p Calls",
			status: "good",
			details: "Reliable audio/video transmission for 1-on-1 and team syncs.",
			iconName: "video",
		};
	} else if (downloadMbps >= 2 && uploadMbps >= 1) {
		videoConf = {
			title: "Basic Video Calling",
			verdict: "Audio / Low-Res Video",
			status: "moderate",
			details:
				"Screen sharing may lag; recommend disabling camera if bandwidth drops.",
			iconName: "video",
		};
	} else {
		videoConf = {
			title: "Video Calling",
			verdict: "Unstable Connection",
			status: "poor",
			details: "Insufficient upstream bandwidth for uninterrupted video.",
			iconName: "video",
		};
	}

	// Calculate Cloud Transfer Suitability
	let cloudTransfer: SuitabilityMetric;
	if (uploadMbps >= 25) {
		cloudTransfer = {
			title: "Cloud Backup & Uploads",
			verdict: "Ultra Fast Uplink",
			status: "optimal",
			details: "Gigabyte backups and 4K footage upload in minutes.",
			iconName: "cloud-upload",
		};
	} else if (uploadMbps >= 10) {
		cloudTransfer = {
			title: "Cloud Storage Sync",
			verdict: "Fast Upload Sync",
			status: "good",
			details:
				"Rapid synchronization for Dropbox, Google Drive, and Git pushes.",
			iconName: "cloud-upload",
		};
	} else if (uploadMbps >= 3) {
		cloudTransfer = {
			title: "Standard Cloud Sync",
			verdict: "Standard Upload Speed",
			status: "moderate",
			details:
				"Adequate for documents and photos; large video uploads take time.",
			iconName: "cloud-upload",
		};
	} else {
		cloudTransfer = {
			title: "Cloud Uploads",
			verdict: "Slow Uplink",
			status: "poor",
			details: "Severely constrained upstream throughput.",
			iconName: "cloud-upload",
		};
	}

	// Overall Latency & Quality Grade
	let grade: "A+" | "A" | "B" | "C" | "D" | "F";
	let gradeLabel: string;

	if (pingMs <= 25 && jitterMs <= 3 && downloadMbps >= 50 && uploadMbps >= 20) {
		grade = "A+";
		gradeLabel = "Exceptional Broadband Quality";
	} else if (
		pingMs <= 45 &&
		jitterMs <= 6 &&
		downloadMbps >= 25 &&
		uploadMbps >= 8
	) {
		grade = "A";
		gradeLabel = "High-Speed Performance";
	} else if (
		pingMs <= 80 &&
		jitterMs <= 12 &&
		downloadMbps >= 15 &&
		uploadMbps >= 4
	) {
		grade = "B";
		gradeLabel = "Solid Standard Connection";
	} else if (pingMs <= 120 && downloadMbps >= 5) {
		grade = "C";
		gradeLabel = "Moderate / Usable Connection";
	} else if (downloadMbps > 0) {
		grade = "D";
		gradeLabel = "Constrained Throughput";
	} else {
		grade = "F";
		gradeLabel = "Awaiting Measurement";
	}

	return {
		grade,
		gradeLabel,
		metrics: [streaming, gaming, videoConf, cloudTransfer],
	};
}
