import MovementSkeleton from "@/features/movement/components/MovementSkeleton";

export default function Loading() {
	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<MovementSkeleton />
			</div>
		</main>
	);
}
