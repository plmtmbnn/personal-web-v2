import { Parser } from "node-sql-parser";
import type { Dialect } from "../types";

/**
 * Validates SQL using node-sql-parser
 */
export const validateSql = (sql: string, dialect: Dialect) => {
	const parser = new Parser();
	try {
		parser.astify(sql, { database: dialect });
		return { isValid: true, error: null };
	} catch (err: any) {
		return {
			isValid: false,
			error: {
				message: err.message,
				line: err.location?.start?.line,
				column: err.location?.start?.column,
			},
		};
	}
};
