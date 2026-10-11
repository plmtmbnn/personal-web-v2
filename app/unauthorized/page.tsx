import type { Metadata } from "next";
import { Suspense } from "react";
import UnauthorizedView from "@/features/auth/components/UnauthorizedView";

export const metadata: Metadata = {
	title: "Access Restricted | Personal Hub",
	description:
		"Authorization required to access this restricted administrative portal.",
};

interface UnauthorizedPageProps {
	searchParams?: Promise<{
		message?: string;
	}>;
}

export default async function UnauthorizedPage({
	searchParams,
}: UnauthorizedPageProps) {
	const params = searchParams ? await searchParams : {};

	return (
		<Suspense fallback={null}>
			<UnauthorizedView initialMessage={params?.message} />
		</Suspense>
	);
}
