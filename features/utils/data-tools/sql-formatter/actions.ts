"use server";

import { format as formatSql } from "sql-formatter";
import type { Dialect } from "./types";
import { validateSql } from "./utils/sql";

export interface FormatSqlResult {
	isValid: boolean;
	formattedSql?: string;
	error?: {
		message: string;
		line?: number;
		column?: number;
	} | null;
}

/**
 * Server Action for SQL syntax validation and structural formatting.
 * Runs on the server where node-sql-parser and sql-formatter are externalized,
 * saving ~2.75 MB of JavaScript from the client bundle.
 */
export async function formatSqlAction(
	sql: string,
	dialect: Dialect,
): Promise<FormatSqlResult> {
	if (!sql.trim()) {
		return { isValid: true, formattedSql: "" };
	}

	// 1. Validate SQL syntax via node-sql-parser
	const { isValid, error } = validateSql(sql, dialect);
	if (!isValid) {
		return { isValid: false, error };
	}

	// 2. Format SQL using sql-formatter
	try {
		const formatted = formatSql(sql, {
			language: dialect === "transactsql" ? "tsql" : dialect,
			tabWidth: 2,
			keywordCase: "upper",
			indentStyle: "tabularLeft",
		});
		return { isValid: true, formattedSql: formatted, error: null };
	} catch (err: any) {
		return {
			isValid: false,
			error: { message: `Formatter Error: ${err.message}` },
		};
	}
}
