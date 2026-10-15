import { requireAuth } from "@/features/auth/server";

/**
 * Stock Admin Server Layout:
 * Enforces centralized server-side authentication before the client page loads.
 */
export default async function StockAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireAuth({
		requireAdmin: true,
		redirectTo: "/utils/stock-explorer/admin",
	});

	return <>{children}</>;
}
