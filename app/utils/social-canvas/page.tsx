import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import SocialCanvasView from "@/features/utils/fun-tools/social-canvas/components/View";

export const metadata: Metadata = createMetadata({
	title: "Faceless Social Canvas - Template Generator",
	description:
		"Generate clean, high-fidelity social media images and templates tailored for faceless accounts.",
	path: "/utils/social-canvas",
	keywords: [
		"Social Canvas",
		"Faceless Account",
		"Template Generator",
		"Image Generator",
		"Social Media Tools",
		"Developer Tools",
	],
});

export default function SocialCanvasPage() {
	return <SocialCanvasView />;
}
