import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	productionBrowserSourceMaps: false,
	compress: true,

	images: {
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
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ["image/avif", "image/webp"],
	},

	reactStrictMode: true,
	typescript: {
		ignoreBuildErrors: process.env.FAST_BUILD === "true",
	},

	serverExternalPackages: ["node-sql-parser", "got-scraping"],
	outputFileTracingIncludes: {
		"/api/utils/stock-data": [
			"./node_modules/header-generator/data_files/**/*",
		],
	},

	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"recharts",
			"react-icons",
			"framer-motion",
			"date-fns",
			"@radix-ui/react-icons",
		],
		webVitalsAttribution: ["CLS", "LCP", "FCP", "TTFB", "INP"],
	},

	webpack: (config, { isServer, dev }) => {
		config.cache = {
			type: "filesystem",
			buildDependencies: {
				config: [__filename],
				tsconfig: ["./tsconfig.json"],
			},
			cacheDirectory: path.resolve(".next/cache/webpack"),
		};

		if (!dev && isServer) {
			config.optimization = {
				...config.optimization,
				minimize: true,
				splitChunks: {
					chunks: "all",
					maxSize: 200000,
				},
				runtimeChunk: "single",
			};
		}

		return config;
	},

	// Enable standalone output for self-hosting
	output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

const isProd = process.env.NODE_ENV === "production";

// Apply bundle analyzer first
const configWithAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
	openAnalyzer: false,
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
