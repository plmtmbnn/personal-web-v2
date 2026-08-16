export type CronFieldType =
	| "minute"
	| "hour"
	| "dayOfMonth"
	| "month"
	| "dayOfWeek";

export interface CronValidationResult {
	isValid: boolean;
	error?: string;
	fieldErrors?: Partial<Record<CronFieldType, string>>;
}

export interface CronParts {
	minute: string;
	hour: string;
	dayOfMonth: string;
	month: string;
	dayOfWeek: string;
}

export interface NextExecutionItem {
	timestamp: number;
	localString: string;
	utcString: string;
	relativeString: string;
}

export interface CronPreset {
	label: string;
	cron: string;
	description: string;
	category: "Frequent" | "Daily" | "Weekly" | "Monthly" | "DevOps";
}

export interface PlatformExport {
	id: string;
	name: string;
	badge: string;
	filename: string;
	language: string;
	snippet: string;
}
