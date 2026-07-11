import type { Metadata } from "next";
import { getNotes } from "@/features/brain/actions";
import { checkAdmin } from "@/features/auth/actions";
import BrainSidebar from "@/features/brain/components/BrainSidebar";

export const metadata: Metadata = {
	title: "Second Brain | Knowledge Graph",
	description:
		"Interconnected notes and ideas visualized through an interactive network graph.",
};

export default async function BrainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const notes = await getNotes();
	const isAdmin = await checkAdmin();
	const isDevelopment = process.env.NODE_ENV === "development";

	return (
		<div className="flex flex-col md:flex-row h-screen overflow-hidden pb-20 sm:pb-24">
			<BrainSidebar
				notes={notes}
				isAdmin={isAdmin}
				isDevelopment={isDevelopment}
			/>
			<main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
				{children}
			</main>
		</div>
	);
}
