import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Travel Tracker | My Adventures",
	description: "Explore the places I've visited and my future travel wishlist.",
};

export default function TravelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
