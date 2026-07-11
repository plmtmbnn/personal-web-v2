"use server";

import { ENV_GLOBAL } from "@/lib/core/env";
import { TelegramChannel } from "@/services/notifications/channels/telegram";
import { notificationDispatcher } from "@/services/notifications/dispatcher";
import {
	contactFormSchema,
	type ContactFormData,
	type ActionResponse,
} from "./types";

export async function submitContactForm(
	data: ContactFormData,
): Promise<ActionResponse> {
	// 1. Validate inputs server-side
	const validation = contactFormSchema.safeParse(data);
	if (!validation.success) {
		return {
			success: false,
			message: "Validation failed.",
			errors: validation.error.flatten().fieldErrors,
		};
	}

	const { name, email, subject, message } = validation.data;

	try {
		// 2. Instantiate and register the Telegram notification channel
		const telegramToken = ENV_GLOBAL.TELEGRAM_BOT_TOKEN;
		const telegramChatId = ENV_GLOBAL.TELEGRAM_CHAT_ID;

		if (!telegramToken || !telegramChatId) {
			console.warn(
				"[ContactAction] Telegram credentials missing, falling back to console log.",
			);
		} else {
			const telegramChannel = new TelegramChannel(
				telegramToken,
				telegramChatId,
			);
			notificationDispatcher.registerChannel(telegramChannel);

			// 3. Dispatch the message
			await notificationDispatcher.dispatch({
				title: `New Contact Submission: ${subject}`,
				body: `👤 <b>Name:</b> ${name}\n✉️ <b>Email:</b> ${email}\n\n💬 <b>Message:</b>\n${message}`,
			});
		}

		return {
			success: true,
			message: "Thank you! Your message has been sent successfully.",
		};
	} catch (error: any) {
		console.error("[ContactAction] Error sending message:", error);
		return {
			success: false,
			message:
				error.message ||
				"An error occurred while sending your message. Please try again later.",
		};
	}
}
