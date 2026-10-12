/**
 * Requests browser notification permission if available.
 */
export async function requestNotificationPermission(): Promise<boolean> {
	if (typeof window === "undefined" || !("Notification" in window)) {
		return false;
	}

	if (Notification.permission === "granted") {
		return true;
	}

	if (Notification.permission !== "denied") {
		try {
			const perm = await Notification.requestPermission();
			return perm === "granted";
		} catch {
			return false;
		}
	}

	return false;
}

/**
 * Checks if browser notification permission is currently granted.
 */
export function isNotificationGranted(): boolean {
	if (typeof window === "undefined" || !("Notification" in window)) {
		return false;
	}
	return Notification.permission === "granted";
}

/**
 * Sends a native browser notification if granted and tab is blurred.
 */
export function sendMovementNotification(
	title: string,
	options?: NotificationOptions,
): void {
	if (!isNotificationGranted()) return;

	try {
		new Notification(title, {
			icon: "/favicon.ico",
			badge: "/favicon.ico",
			...options,
		});
	} catch {
		// Ignore notification dispatch errors
	}
}
