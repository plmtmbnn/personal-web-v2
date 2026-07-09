import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import dynamic from "next/dynamic";

const JsonToSchemaView = dynamic(
	() => import("@/features/utils/json-converter-advanced/components/View"),
);

export const metadata: Metadata = createMetadata({
	title: "Advanced JSON to Schema Converter",
	description:
		"Convert JSON objects into TypeScript Interfaces, Go Structs, Zod Schemas, Mongoose Models, and Joi Validations instantly.",
	path: "/utils/json-converter-advanced",
	keywords: [
		"JSON to TypeScript",
		"JSON to Go Struct",
		"JSON to Zod",
		"JSON to Mongoose",
		"JSON to Joi",
		"Schema Generator",
		"Developer Utilities",
	],
});

export default function JsonToSchemaPage() {
	return <JsonToSchemaView />;
}
