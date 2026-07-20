import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = createMetadata({
	title: "Dummy Page | Personal Web",
	description: "A general dummy page for testing purposes.",
});

export default function DummyPage() {
	return (
		<div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute top-0 w-full h-[30vh] bg-slate-200/30 pointer-events-none" />

			<div className="z-10 bg-white rounded-2xl border border-slate-200 shadow-xl p-12 max-w-2xl w-full mx-4 text-center">
				<h1 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">
					Dummy Page
				</h1>
				<p className="text-slate-500 text-lg mb-8">
					This is a general dummy page for testing layouts, components, or
					routing.
				</p>
				<div className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-medium hover:bg-slate-200 transition-colors cursor-pointer">
					Acknowledge
				</div>
			</div>
		</div>
	);
}
