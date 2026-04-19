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
		],
	},
};

export default nextConfig;
