"use client";

import AuthGuard from "./AuthGuard";
import type { AuthMode } from "./types";

interface PinGuardProps {
	mode?: AuthMode;
	children: React.ReactNode;
}

/**
 * PinGuard: Convenience wrapper for AuthGuard.
 * Defaults to "pin_only" mode for backwards compatibility,
 * but accepts any AuthMode ("login_only", "pin_only", "serial", "disabled").
 */
export default function PinGuard({
	mode = "pin_only",
	children,
}: PinGuardProps) {
	return <AuthGuard mode={mode}>{children}</AuthGuard>;
}
