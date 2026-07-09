export type Dialect = "postgresql" | "mysql" | "transactsql";

export const DIALECT_OPTIONS = [
	{ label: "PostgreSQL", value: "postgresql" as Dialect },
	{ label: "MySQL", value: "mysql" as Dialect },
	{ label: "T-SQL", value: "transactsql" as Dialect },
];
