/**
 * Input Sanitization Utility
 * Uses DOMPurify to sanitize user-generated content before rendering.
 */
import DOMPurify from "dompurify";

export function sanitizeInput(input: string): string {
	return DOMPurify.sanitize(input, {
		ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "code", "pre"],
		ALLOWED_ATTR: ["href", "title", "target", "rel"],
		ALLOW_DATA_ATTR: false,
	});
}

export function sanitizeTaskTitle(title: string): string {
	// Remove any HTML tags completely for task titles (text only)
	return DOMPurify.sanitize(title, {
		ALLOWED_TAGS: [],
		KEEP_CONTENT: true,
	});
}
