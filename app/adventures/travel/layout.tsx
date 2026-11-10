import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Travel Journeys | Polma Tambunan",
	description:
		"Field dispatches and interactive 3D airmail postcards from completed journeys across Indonesia and Southeast Asia.",
};

export default function TravelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
