import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	productionBrowserSourceMaps: false,
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
				hostname: "**.ibb.co.com",
			},
			{
				protocol: "https",
				hostname: "**.idx.co.id",
			},
		],
	},
	reactStrictMode: true,
	typescript: {
		ignoreBuildErrors: process.env.FAST_BUILD === "true",
	},
	serverExternalPackages: ["node-sql-parser", "got-scraping"],
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
	webpack: (config) => {
		config.cache = {
			type: "filesystem",
			buildDependencies: {
				config: [__filename],
			},
		};
		return config;
	},
};

const isProd = process.env.NODE_ENV === "production";

export default isProd
	? withSentryConfig(nextConfig, {
			// For all available options, see:
			// https://www.npmjs.com/package/@sentry/webpack-plugin#options

			org: "peoel-corps",

			project: "javascript-nextjs",

			// Only print logs for uploading source maps in CI
			silent: !process.env.CI,

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
	: nextConfig;
