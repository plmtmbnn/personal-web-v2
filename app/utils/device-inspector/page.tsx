import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import DeviceInspectorView from "@/features/utils/data-tools/device-inspector/components/View";

export const metadata: Metadata = createMetadata({
	title:
		"Device, Internet Speed Test & Browser Diagnostics Inspector - Live Network & Hardware Telemetry",
	description:
		"Real-time internet speed test (download, upload, ping, jitter), hardware telemetry (CPU, RAM, GPU WebGL renderer), display and refresh rate analysis, and media codec audit.",
	path: "/utils/device-inspector",
	keywords: [
		"Speed Test",
		"Internet Speed Test",
		"Device Inspector",
		"Browser Diagnostics",
		"GPU Renderer Inspector",
		"Display Refresh Rate",
		"Ping Jitter Test",
		"Hardware Telemetry",
		"Media Codec Support",
		"Developer Tools",
	],
});

export default function DeviceInspectorPage() {
	return <DeviceInspectorView />;
}
