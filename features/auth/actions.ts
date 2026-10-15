"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/core/redis";
import { createClient } from "@/lib/core/supabase-server";
import { checkAuth } from "./server";

/**
 * Authorization Helper: Checks if the current user is an authorized admin.
 * Evaluates active AuthMode (login_only, pin_only, serial, disabled).
 */
export async function checkAdmin(): Promise<boolean> {
	const result = await checkAuth({ requireAdmin: true });
	return result.authorized;
}

/**
 * Logout Action
 * Clears Redis session, Supabase session, and the custom cookie.
 */
export async function logout() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("app_session")?.value;

	if (sessionId) {
		await deleteSession(sessionId);
	}

	try {
		const supabase = await createClient();
		await supabase.auth.signOut();
	} catch {
		// Ignore if client cannot sign out
	}

	cookieStore.delete("app_session");
	redirect("/login");
}
