import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import URLInspectorView from "@/features/utils/security-tools/url-inspector/components/View";

export const metadata: Metadata = createMetadata({
	title: "URL Safety & Threat Inspector",
	description:
		"Detect phishing links, IDN homograph attacks, typosquatting, raw IP hosts, shortener obfuscation, and invalid URL characters.",
	path: "/utils/url-inspector",
	keywords: [
		"URL Inspector",
		"Phishing Detector",
		"Homograph Attack",
		"URL Shortener Unmasker",
		"Link Safety Scanner",
		"Malware Link Inspector",
		"Security Tools",
	],
});

export default function URLInspectorPage() {
	return <URLInspectorView />;
}
