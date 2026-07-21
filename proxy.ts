import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers for CSP, XSS protection, etc.
const securityHeaders = {
		// Content Security Policy
		"Content-Security-Policy": `
			default-src 'self';
			script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com https://*.googletagmanager.com;
			style-src 'self' 'unsafe-inline';
			img-src 'self' data: blob: https://*.unsplash.com https://*.cloudinary.com https://*.pexels.com https://*.githubusercontent.com https://*.googleusercontent.com https://*.ibb.co;
			connect-src 'self' https://*.supabase.co https://*.firebaseio.com https://*.googleapis.com wss://*.supabase.co https://o4511591853850625.ingest.us.sentry.io;
			font-src 'self';
			object-src 'none';
			frame-src 'none';
			base-uri 'self';
			form-action 'self';
			frame-ancestors 'none';
		`,
	// XSS Protection
	"X-XSS-Protection": "1; mode=block",
	// Prevent MIME-sniffing
	"X-Content-Type-Options": "nosniff",
	// Prevent clickjacking
	"X-Frame-Options": "DENY",
	// Referrer Policy
	"Referrer-Policy": "strict-origin-when-cross-origin",
	// Permissions Policy
	"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

// Paths to exclude from security headers (e.g., API routes that need custom headers)
const excludedPaths = [
	"/api/upload",
	"/api/webhook",
];

export function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Skip security headers for excluded paths
	if (excludedPaths.some((path) => pathname.startsWith(path))) {
		return NextResponse.next();
	}

	// Clone the request headers and add security headers
	const response = NextResponse.next();
	Object.entries(securityHeaders).forEach(([key, value]) => {
		response.headers.set(key, value.replace(/\s+/g, " "));
	});

	return response;
}

export const config = {
	matcher: [
		// Apply to all paths except static files
		"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
	],
};
