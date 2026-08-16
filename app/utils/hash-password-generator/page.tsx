import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import HashPasswordGeneratorView from "@/features/utils/security-tools/hash-password-generator/components/View";

export const metadata: Metadata = createMetadata({
	title:
		"Security, Hashing & Password Studio - SHA256, MD5, Base64, Passphrase",
	description:
		"Cryptographically secure password and passphrase generator with entropy analysis, multi-algorithm hasher (SHA-256, SHA-512, MD5, HMAC) with file checksum verification, and Base64/Hex/URL security formatter.",
	path: "/utils/hash-password-generator",
	keywords: [
		"Password Generator",
		"Passphrase Generator",
		"SHA256 Hash Generator",
		"MD5 Generator",
		"File Checksum Verifier",
		"HMAC Generator",
		"Base64 Encoder",
		"Base64 Decoder",
		"Hex Converter",
		"Entropy Calculator",
		"Security Tools",
		"Developer Tools",
	],
});

export default function HashPasswordGeneratorPage() {
	return <HashPasswordGeneratorView />;
}
