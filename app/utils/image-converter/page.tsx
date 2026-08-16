import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import ImageConverterView from "@/features/utils/file-tools/image-converter/components/View";

export const metadata: Metadata = createMetadata({
	title: "Image Extension & Format Converter - PNG, JPEG, WebP, AVIF, ICO, BMP",
	description:
		"Fast, client-side image converter with binary magic-number validation. Convert images between WebP, PNG, JPEG, AVIF, BMP, and Favicon (.ico) formats with quality and scaling controls.",
	path: "/utils/image-converter",
	keywords: [
		"Image Converter",
		"Image Extension Converter",
		"Convert PNG to WebP",
		"Convert JPG to PNG",
		"Favicon Generator",
		"ICO Converter",
		"Image Compressor",
		"Batch Image Converter",
		"WebP Converter",
		"AVIF Converter",
		"Developer Tools",
	],
});

export default function ImageConverterPage() {
	return <ImageConverterView />;
}
