import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import JWTInspectorView from "@/features/utils/security-tools/jwt-inspector/components/View";

export const metadata: Metadata = createMetadata({
	title: "JWT & API Token Inspector",
	description:
		"Decode JSON Web Tokens, inspect RFC 7519 claims, monitor live expiration countdowns, and verify HMAC signatures locally with zero server telemetry.",
	path: "/utils/jwt-inspector",
	keywords: [
		"JWT Inspector",
		"JWT Decoder",
		"Token Debugger",
		"HMAC Verification",
		"JSON Web Token",
		"Security Tools",
		"OAuth2 Token Inspector",
		"Developer Tools",
	],
});

export default function JWTInspectorPage() {
	return <JWTInspectorView />;
}
