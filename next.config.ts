import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
	productionBrowserSourceMaps: false,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
};

export default nextConfig;
