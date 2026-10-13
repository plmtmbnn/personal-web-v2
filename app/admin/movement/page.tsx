import { redirect } from "next/navigation";
import { checkAdmin } from "@/features/auth/actions";
import { getMovementStateAction } from "@/features/movement/actions";
import MovementView from "@/features/movement/components/MovementView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Daily Movement Snacks | Admin Hub",
	description:
		"Lightweight daily activity tracker for desk work movement breaks, habits, and active recovery.",
};

export const dynamic = "force-dynamic";

export default async function AdminMovementPage() {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const initialState = await getMovementStateAction();

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<MovementView initialState={initialState} />
			</div>
		</main>
	);
}
