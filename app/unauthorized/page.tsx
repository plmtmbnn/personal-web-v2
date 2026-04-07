"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

function UnauthorizedContent() {
	const searchParams = useSearchParams();
	const message = searchParams.get("message");

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				<div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 ring-1 ring-red-500/20">
					<ShieldX className="w-10 h-10 text-red-500" />
				</div>

				<h1 className="text-3xl font-black mb-4 tracking-tight">
					Access Denied
				</h1>

				<p className="text-muted-foreground mb-10 leading-relaxed">
					{message === "pending"
						? "Your account has been created but is currently pending administrator verification. You will be able to access the dashboard once approved."
						: "We couldn't verify your credentials. Please ensure you are using a permitted account or contact the administrator."}
				</p>

				<Link
					href="/login"
					className="inline-flex items-center gap-2 px-8 py-4 bg-background-secondary border border-border/50 rounded-2xl font-bold hover:bg-border/20 transition-all"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Login
				</Link>
			</div>
		</div>
	);
}

export default function UnauthorizedPage() {
	return (
		<Suspense fallback={null}>
			<UnauthorizedContent />
		</Suspense>
	);
}
