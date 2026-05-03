import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import SqlFormatterView from "./View";

export const metadata: Metadata = createMetadata({
	title: "SQL Formatter & Validator",
	description:
		"Advanced SQL beautifier and syntax validator supporting PostgreSQL, MySQL, and T-SQL with real-time error hinting.",
	path: "/utils/sql-formatter",
	keywords: [
		"SQL Formatter",
		"SQL Validator",
		"PostgreSQL",
		"MySQL",
		"T-SQL",
		"Query Beautifier",
		"Developer Tools",
	],
});

export default function SqlFormatterPage() {
	return <SqlFormatterView />;
}
