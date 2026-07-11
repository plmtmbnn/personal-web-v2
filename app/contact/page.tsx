import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import ContactView from "@/features/contact/components/ContactView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
	title: "Contact | Polma Tambunan",
	description:
		"Get in touch with Polma Tambunan. Open for collaboration, fintech consulting, contracting, or technology discussions.",
	path: "/contact",
});

export default function ContactPage() {
	return <ContactView />;
}
