import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	productionBrowserSourceMaps: false,
	compress: true,

	// Enable React Strict Mode for better development
	reactStrictMode: true,

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
		// Device sizes for responsive images
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		// Custom image sizes for `next/image`
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// Output formats (AVIF for modern browsers, WebP as fallback)
		formats: ["image/avif", "image/webp"],
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
	],

	// Experimental features for performance and DX
	experimental: {
		// Optimize imports from these packages (tree-shaking)
		optimizePackageImports: [
			"lucide-react", // Icons (already optimized)
			"date-fns", // Date utilities (already optimized)
			// Note: Removed recharts, react-icons, framer-motion to avoid issues
			// They will be lazy-loaded where needed
		],
		// Enable Web Vitals attribution for performance monitoring
		webVitalsAttribution: ["CLS", "LCP", "FCP", "TTFB", "INP"],
		// Enable server actions
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},

	// Webpack optimizations
	webpack: (config, { isServer }) => {
		// Filesystem cache for faster rebuilds
		config.cache = {
			type: "filesystem",
			buildDependencies: {
				config: [__filename],
				tsconfig: ["./tsconfig.json"],
			},
			cacheDirectory: path.resolve(".next/cache/webpack"),
		};

		// Split chunks for better caching (client-side only)
		if (!isServer) {
			config.optimization.splitChunks = {
				chunks: "all",
				cacheGroups: {
					// Group node_modules chunks separately
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendor",
						chunks: "initial",
						priority: 10,
					},
					// Group common chunks
					common: {
						name: "common",
						minChunks: 2,
						chunks: "initial",
						priority: 5,
					},
				},
			};
		}

		// NOTE: Do NOT add server-side splitChunks or runtimeChunk:"single" here.
		// Vercel packages each Serverless Function independently; shared runtime
		// chunks created by those options are seen as symlinked directories and
		// cause the "invalid deployment package" error.

		return config;
	},

	// Enable standalone output for self-hosting (bypassed on Vercel to prevent deployment packaging symlink errors)
	output:
		process.env.NODE_ENV === "production" && !process.env.VERCEL
			? "standalone"
			: undefined,
};

const isProd = process.env.NODE_ENV === "production";

// Apply bundle analyzer first
const configWithAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
	openAnalyzer: true,
	analyzerMode: "static",
})(nextConfig);

// Then apply Sentry config for production
export default isProd
	? withSentryConfig(configWithAnalyzer, {
			// For all available options, see:
			// https://www.npmjs.com/package/@sentry/webpack-plugin#options

			org: "peoel-corps",
			project: "javascript-nextjs",

			// Silence Sentry CLI logs to prevent build log clutter from Turbopack chunks
			silent: true,

			// For all available options, see:
			// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

			// Upload a larger set of source maps for prettier stack traces (increases build time)
			widenClientFileUpload: false,

			// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
			// This can increase your server load as well as your hosting bill.
			// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
			// side errors will fail.
			// tunnelRoute: "/monitoring",

			webpack: {
				// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
				// See the following for more information:
				// https://docs.sentry.io/product/crons/
				// https://vercel.com/docs/cron-jobs
				automaticVercelMonitors: true,

				// Tree-shaking options for reducing bundle size
				treeshake: {
					// Automatically tree-shake Sentry logger statements to reduce bundle size
					removeDebugLogging: true,
				},
			},
		})
	: configWithAnalyzer;
