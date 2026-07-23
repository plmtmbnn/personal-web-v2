import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	productionBrowserSourceMaps: false,
	compress: true,

	// Enable React Strict Mode for better development
	reactStrictMode: true,

	// Compiler optimization with SWC
	compiler: {
		// Enable styled-components optimization if used
		styledComponents: false,
		// Remove console logs in production
		removeConsole: process.env.NODE_ENV === "production",
	},

	// Enable build caching

	// Optimize images: enable optimization for local images and remote patterns
	images: {
		// Remote image domains (optimized via proxy)
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "**.cloudinary.com",
			},
			{
				protocol: "https",
				hostname: "**.pexels.com",
			},
			{
				protocol: "https",
				hostname: "**.githubusercontent.com",
			},
			{
				protocol: "https",
				hostname: "**.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "**.ibb.co",
			},
			{
				protocol: "https",
				hostname: "**.idx.co.id",
			},
		],
		// Device sizes for responsive images - optimized for common breakpoints
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		// Custom image sizes for `next/image` - reduced for faster builds
		imageSizes: [16, 32, 48, 64, 96, 128, 256],
		// Output formats (AVIF for modern browsers, WebP as fallback)
		formats: ["image/avif", "image/webp"],
		// Enable image optimization caching
		minimumCacheTTL: 60,
		// Dangerously allow SVG uploads (if needed)
		dangerouslyAllowSVG: false,
		// Content security policy for images
		contentSecurityPolicy: "default-src 'self'; img-src 'self' data: https:;",
	},

	// TypeScript: Ignore build errors in development for faster builds
	typescript: {
		ignoreBuildErrors: process.env.FAST_BUILD === "true",
	},

	serverExternalPackages: [
		"node-sql-parser",
		"got-scraping",
		"header-generator",
		"jsdom",
		"@mozilla/readability",
		"turndown",
		"papaparse",
		"sql-formatter",
		"dompurify",
		"firebase",
		"@upstash/redis",
		"@upstash/ratelimit",
	],

	// Use Turbopack (default in Next.js 16) with optimizations
	turbopack: {},

	// Experimental features for performance and DX
	experimental: {
		// Optimize imports from these packages (tree-shaking)
		optimizePackageImports: [
			"lucide-react",
			"date-fns",
			"react-icons",
			"framer-motion",
			"@supabase/supabase-js",
			"recharts",
			"react-syntax-highlighter",
			"react-chartjs-2",
			"chart.js",
			"react-hook-form",
			"zod",
		],
		// Enable Web Vitals attribution for performance monitoring
		webVitalsAttribution: ["CLS", "LCP", "FCP", "TTFB", "INP"],
		// Enable server actions
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},

	// Enable standalone output for self-hosting (bypassed on Vercel to prevent deployment packaging symlink errors)
	output:
		process.env.NODE_ENV === "production" && !process.env.VERCEL
			? "standalone"
			: undefined,

	// Optimize static generation
	staticPageGenerationTimeout: 120,
};

let finalConfig = nextConfig;

// Lazy-load bundle analyzer only when ANALYZE=true
if (process.env.ANALYZE === "true") {
	const withBundleAnalyzer = require("@next/bundle-analyzer")({
		enabled: true,
		openAnalyzer: true,
		analyzerMode: "static",
	});
	finalConfig = withBundleAnalyzer(finalConfig);
}

// Lazy-load Sentry plugin only for production releases
const isProd = process.env.NODE_ENV === "production";
const shouldEnableSentry =
	isProd &&
	(process.env.VERCEL_ENV === "production" ||
		process.env.ENABLE_SENTRY_BUILD === "true");

if (shouldEnableSentry) {
	const { withSentryConfig } = require("@sentry/nextjs");
	finalConfig = withSentryConfig(finalConfig, {
		org: "peoel-corps",
		project: "javascript-nextjs",

		// Silence Sentry CLI logs to prevent build log clutter
		silent: true,

		// Upload a larger set of source maps for prettier stack traces (disabled for fast builds)
		widenClientFileUpload: false,

		// Delete sourcemaps after upload to keep public bundles lightweight
		sourcemaps: {
			deleteSourcemapsAfterUpload: true,
		},

		webpack: {
			automaticVercelMonitors: true,

			// Tree-shaking options for reducing bundle size
			treeshake: {
				removeDebugLogging: true,
			},
		},
	});
}

export default finalConfig;
