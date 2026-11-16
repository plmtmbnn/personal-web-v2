"use client";

export default function TasksError({ reset }: { reset: () => void }) {
	return (
		<main className="min-h-screen bg-slate-50/80 px-4 pt-24 pb-32">
			<div
				role="alert"
				className="mx-auto max-w-xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs"
			>
				<h1 className="text-xl font-semibold text-slate-900">
					Tasks could not load
				</h1>
				<p className="mt-2 text-slate-600">
					Your tasks have not changed. Try loading them again.
				</p>
				<button
					type="button"
					onClick={reset}
					className="mt-4 min-h-11 rounded-xl bg-slate-900 px-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2"
				>
					Retry
				</button>
			</div>
		</main>
	);
}
