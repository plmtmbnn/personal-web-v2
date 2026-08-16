import type {
	CronFieldType,
	CronParts,
	CronValidationResult,
	NextExecutionItem,
} from "../types";

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const MONTH_SHORT = [
	"JAN",
	"FEB",
	"MAR",
	"APR",
	"MAY",
	"JUN",
	"JUL",
	"AUG",
	"SEP",
	"OCT",
	"NOV",
	"DEC",
];

const DAY_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const DAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Normalizes aliases (JAN-DEC -> 1-12, SUN-SAT -> 0-6).
 */
function normalizeCronToken(token: string, type: CronFieldType): string {
	let normalized = token.trim().toUpperCase();

	if (type === "month") {
		MONTH_SHORT.forEach((name, idx) => {
			normalized = normalized.replace(
				new RegExp(`\\b${name}\\b`, "g"),
				String(idx + 1),
			);
		});
	}

	if (type === "dayOfWeek") {
		DAY_SHORT.forEach((name, idx) => {
			normalized = normalized.replace(
				new RegExp(`\\b${name}\\b`, "g"),
				String(idx),
			);
		});
		// 7 is Sunday in some implementations -> replace with 0
		normalized = normalized.replace(/\b7\b/g, "0");
	}

	return normalized;
}

/**
 * Parses and validates a single cron field token.
 */
function validateField(
	rawToken: string,
	type: CronFieldType,
	min: number,
	max: number,
): { isValid: boolean; error?: string } {
	const token = normalizeCronToken(rawToken, type);

	if (token === "*") return { isValid: true };
	if (token === "?") return { isValid: true };
	if (token === "L" && (type === "dayOfMonth" || type === "dayOfWeek")) {
		return { isValid: true };
	}

	// List of values: e.g. 1,2,5 or 1-5,10-15
	const listParts = token.split(",");
	for (const part of listParts) {
		const trimmed = part.trim();
		if (!trimmed) {
			return { isValid: false, error: `Empty element in ${type} list.` };
		}

		// Step: */5 or 1-30/5
		if (trimmed.includes("/")) {
			const [rangePart, stepPart] = trimmed.split("/");
			if (!stepPart || !/^\d+$/.test(stepPart)) {
				return {
					isValid: false,
					error: `Invalid step in '${trimmed}' for ${type}.`,
				};
			}
			const stepVal = Number(stepPart);
			if (stepVal <= 0 || stepVal > max) {
				return {
					isValid: false,
					error: `Step value ${stepVal} out of range for ${type}.`,
				};
			}

			if (rangePart && rangePart !== "*") {
				const rangeCheck = validateField(rangePart, type, min, max);
				if (!rangeCheck.isValid) return rangeCheck;
			}
			continue;
		}

		// Range: 1-5
		if (trimmed.includes("-")) {
			const [startStr, endStr] = trimmed.split("-");
			if (
				!startStr ||
				!endStr ||
				!/^\d+$/.test(startStr) ||
				!/^\d+$/.test(endStr)
			) {
				return {
					isValid: false,
					error: `Invalid range '${trimmed}' for ${type}.`,
				};
			}
			const start = Number(startStr);
			const end = Number(endStr);
			if (start < min || start > max || end < min || end > max) {
				return {
					isValid: false,
					error: `Range ${start}-${end} outside allowed bounds (${min}-${max}) for ${type}.`,
				};
			}
			if (start > end) {
				return {
					isValid: false,
					error: `Range start ${start} cannot exceed end ${end}.`,
				};
			}
			continue;
		}

		// Single Number
		if (!/^\d+$/.test(trimmed)) {
			return {
				isValid: false,
				error: `Invalid value '${trimmed}' for ${type}.`,
			};
		}
		const num = Number(trimmed);
		if (num < min || num > max) {
			return {
				isValid: false,
				error: `Value ${num} is out of bounds (${min}-${max}) for ${type}.`,
			};
		}
	}

	return { isValid: true };
}

/**
 * Validates and decomposes a full 5-part cron expression.
 */
export function parseCronExpression(cron: string): {
	parts: CronParts | null;
	validation: CronValidationResult;
} {
	const trimmed = cron.trim();
	if (!trimmed) {
		return {
			parts: null,
			validation: { isValid: false, error: "Cron expression is empty." },
		};
	}

	const tokens = trimmed.split(/\s+/);
	if (tokens.length !== 5) {
		return {
			parts: null,
			validation: {
				isValid: false,
				error: `Expected 5 fields (Minute Hour Day-of-Month Month Day-of-Week), found ${tokens.length}.`,
			},
		};
	}

	const [minTok = "*", hrTok = "*", domTok = "*", monTok = "*", dowTok = "*"] =
		tokens;

	const vMin = validateField(minTok, "minute", 0, 59);
	const vHr = validateField(hrTok, "hour", 0, 23);
	const vDom = validateField(domTok, "dayOfMonth", 1, 31);
	const vMon = validateField(monTok, "month", 1, 12);
	const vDow = validateField(dowTok, "dayOfWeek", 0, 6);

	const fieldErrors: Partial<Record<CronFieldType, string>> = {};
	if (!vMin.isValid && vMin.error) fieldErrors.minute = vMin.error;
	if (!vHr.isValid && vHr.error) fieldErrors.hour = vHr.error;
	if (!vDom.isValid && vDom.error) fieldErrors.dayOfMonth = vDom.error;
	if (!vMon.isValid && vMon.error) fieldErrors.month = vMon.error;
	if (!vDow.isValid && vDow.error) fieldErrors.dayOfWeek = vDow.error;

	const firstError = Object.values(fieldErrors)[0];
	if (firstError) {
		return {
			parts: null,
			validation: { isValid: false, error: firstError, fieldErrors },
		};
	}

	return {
		parts: {
			minute: minTok,
			hour: hrTok,
			dayOfMonth: domTok,
			month: monTok,
			dayOfWeek: dowTok,
		},
		validation: { isValid: true },
	};
}

/**
 * Formats hour and minute into 12-hour AM/PM string.
 */
function formatTime12h(hour: number, minute: number): string {
	const h = hour % 24;
	const period = h >= 12 ? "PM" : "AM";
	const displayH = h % 12 === 0 ? 12 : h % 12;
	const displayM = minute.toString().padStart(2, "0");
	return `${displayH}:${displayM} ${period}`;
}

/**
 * Translates a cron expression into a clear, natural English sentence.
 */
export function humanizeCron(cron: string): string {
	const { parts, validation } = parseCronExpression(cron);
	if (!validation.isValid || !parts) {
		return validation.error || "Invalid cron expression.";
	}

	const { minute, hour, dayOfMonth, month, dayOfWeek } = parts;

	// Special full wildcard: * * * * *
	if (
		minute === "*" &&
		hour === "*" &&
		dayOfMonth === "*" &&
		month === "*" &&
		dayOfWeek === "*"
	) {
		return "Every minute, every day";
	}

	const descParts: string[] = [];

	// 1. Time / Minute & Hour logic
	if (minute === "*" && hour === "*") {
		descParts.push("Every minute");
	} else if (minute.startsWith("*/") && hour === "*") {
		const step = minute.slice(2);
		descParts.push(`Every ${step} minutes`);
	} else if (/^\d+$/.test(minute) && hour === "*") {
		descParts.push(`At minute ${minute} of every hour`);
	} else if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
		descParts.push(`At ${formatTime12h(Number(hour), Number(minute))}`);
	} else if (minute === "0" && hour.startsWith("*/")) {
		const step = hour.slice(2);
		descParts.push(`Every ${step} hours, on the hour`);
	} else if (/^\d+$/.test(minute) && hour.includes("-")) {
		const [startH, endH] = hour.split("-");
		descParts.push(
			`At minute ${minute}, between ${formatTime12h(Number(startH), 0)} and ${formatTime12h(Number(endH), 59)}`,
		);
	} else {
		// Complex minute/hour combination
		let mText = minute === "*" ? "every minute" : `minute ${minute}`;
		if (minute.startsWith("*/")) mText = `every ${minute.slice(2)} minutes`;
		let hText = hour === "*" ? "every hour" : `past hour ${hour}`;
		if (hour.startsWith("*/")) hText = `every ${hour.slice(2)} hours`;
		descParts.push(`At ${mText} ${hText}`);
	}

	// 2. Day of Month
	if (dayOfMonth !== "*") {
		if (dayOfMonth === "L") {
			descParts.push("on the last day of the month");
		} else if (dayOfMonth.startsWith("*/")) {
			descParts.push(`every ${dayOfMonth.slice(2)} days`);
		} else if (dayOfMonth.includes(",")) {
			descParts.push(`on day ${dayOfMonth} of the month`);
		} else if (dayOfMonth.includes("-")) {
			descParts.push(`between days ${dayOfMonth} of the month`);
		} else {
			descParts.push(`on day ${dayOfMonth} of the month`);
		}
	}

	// 3. Month
	if (month !== "*") {
		const normMon = normalizeCronToken(month, "month");
		if (normMon.includes(",")) {
			const mNames = normMon
				.split(",")
				.map((m) => MONTH_NAMES[Number(m) - 1] || m)
				.join(", ");
			descParts.push(`in ${mNames}`);
		} else if (normMon.includes("-")) {
			const [s, e] = normMon.split("-");
			const sName = MONTH_NAMES[Number(s) - 1] || s;
			const eName = MONTH_NAMES[Number(e) - 1] || e;
			descParts.push(`from ${sName} through ${eName}`);
		} else if (/^\d+$/.test(normMon)) {
			descParts.push(`in ${MONTH_NAMES[Number(normMon) - 1] || normMon}`);
		}
	}

	// 4. Day of Week
	if (dayOfWeek !== "*") {
		const normDow = normalizeCronToken(dayOfWeek, "dayOfWeek");
		if (normDow === "1-5") {
			descParts.push("on weekdays (Monday through Friday)");
		} else if (normDow === "0,6" || normDow === "6,0") {
			descParts.push("on weekends (Saturday and Sunday)");
		} else if (normDow.includes(",")) {
			const dNames = normDow
				.split(",")
				.map((d) => DAY_NAMES[Number(d)] || d)
				.join(", ");
			descParts.push(`on ${dNames}`);
		} else if (normDow.includes("-")) {
			const [s, e] = normDow.split("-");
			const sName = DAY_NAMES[Number(s)] || s;
			const eName = DAY_NAMES[Number(e)] || e;
			descParts.push(`from ${sName} through ${eName}`);
		} else if (/^\d+$/.test(normDow)) {
			descParts.push(`only on ${DAY_NAMES[Number(normDow)] || normDow}`);
		}
	}

	const sentence = descParts.join(", ");
	return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/**
 * Expands a cron field token into a Set of matching integers.
 */
function expandFieldToSet(
	rawToken: string,
	type: CronFieldType,
	min: number,
	max: number,
): Set<number> {
	const token = normalizeCronToken(rawToken, type);
	const result = new Set<number>();

	if (token === "*" || token === "?") {
		for (let i = min; i <= max; i++) result.add(i);
		return result;
	}

	const parts = token.split(",");
	for (const part of parts) {
		if (part.startsWith("*/")) {
			const step = Number(part.slice(2));
			if (step > 0) {
				for (let i = min; i <= max; i += step) result.add(i);
			}
			continue;
		}

		if (part.includes("/")) {
			const [rangeStr, stepStr] = part.split("/");
			const step = Number(stepStr);
			const [startStr = String(min), endStr = String(max)] = (
				rangeStr || ""
			).split("-");
			const start = Number(startStr);
			const end = Number(endStr);
			if (step > 0 && start <= end) {
				for (let i = start; i <= end; i += step) result.add(i);
			}
			continue;
		}

		if (part.includes("-")) {
			const [startStr, endStr] = part.split("-");
			const start = Number(startStr);
			const end = Number(endStr);
			if (start <= end) {
				for (let i = start; i <= end; i++) result.add(i);
			}
			continue;
		}

		const num = Number(part);
		if (!Number.isNaN(num) && num >= min && num <= max) {
			result.add(num);
		}
	}

	return result;
}

/**
 * Formats relative duration from now to future timestamp.
 */
export function formatRelativeTime(
	targetDate: Date,
	baseDate = new Date(),
): string {
	const diffMs = targetDate.getTime() - baseDate.getTime();
	if (diffMs <= 0) return "Just now";

	const diffSec = Math.floor(diffMs / 1000);
	if (diffSec < 60) return `in ${diffSec}s`;

	const diffMin = Math.floor(diffSec / 60);
	const remSec = diffSec % 60;
	if (diffMin < 60) {
		return `in ${diffMin}m ${remSec > 0 ? `${remSec}s` : ""}`.trim();
	}

	const diffHours = Math.floor(diffMin / 60);
	const remMin = diffMin % 60;
	if (diffHours < 24) {
		return `in ${diffHours}h ${remMin > 0 ? `${remMin}m` : ""}`.trim();
	}

	const diffDays = Math.floor(diffHours / 24);
	const remHours = diffHours % 24;
	return `in ${diffDays}d ${remHours > 0 ? `${remHours}h` : ""}`.trim();
}

/**
 * Calculates the next N execution timestamps for a cron expression.
 */
export function getNextExecutions(
	cron: string,
	count = 10,
	startDate = new Date(),
): NextExecutionItem[] {
	const { parts, validation } = parseCronExpression(cron);
	if (!validation.isValid || !parts) return [];

	const validMinutes = expandFieldToSet(parts.minute, "minute", 0, 59);
	const validHours = expandFieldToSet(parts.hour, "hour", 0, 23);
	const validDoms = expandFieldToSet(parts.dayOfMonth, "dayOfMonth", 1, 31);
	const validMonths = expandFieldToSet(parts.month, "month", 1, 12);
	const validDows = expandFieldToSet(parts.dayOfWeek, "dayOfWeek", 0, 6);

	const executions: NextExecutionItem[] = [];
	const current = new Date(startDate.getTime());
	// Advance to start of next minute
	current.setSeconds(0, 0);
	current.setMinutes(current.getMinutes() + 1);

	const maxIterations = 500000; // Safety limit (~1 year scan)
	let iterations = 0;

	while (executions.length < count && iterations < maxIterations) {
		iterations++;

		const mon = current.getMonth() + 1; // 1-12
		if (!validMonths.has(mon)) {
			// Fast forward to next month
			current.setMonth(current.getMonth() + 1, 1);
			current.setHours(0, 0, 0, 0);
			continue;
		}

		const dom = current.getDate();
		const dow = current.getDay(); // 0-6

		// Both day-of-month and day-of-week handling:
		// Standard cron: if both are restricted, either matching fires; if one is *, the other restricts.
		const domRestricted = parts.dayOfMonth !== "*";
		const dowRestricted = parts.dayOfWeek !== "*";
		let dayMatches = false;

		if (domRestricted && dowRestricted) {
			dayMatches = validDoms.has(dom) || validDows.has(dow);
		} else if (domRestricted) {
			dayMatches = validDoms.has(dom);
		} else if (dowRestricted) {
			dayMatches = validDows.has(dow);
		} else {
			dayMatches = true;
		}

		if (!dayMatches) {
			current.setDate(current.getDate() + 1);
			current.setHours(0, 0, 0, 0);
			continue;
		}

		const hour = current.getHours();
		if (!validHours.has(hour)) {
			current.setHours(current.getHours() + 1, 0, 0, 0);
			continue;
		}

		const min = current.getMinutes();
		if (!validMinutes.has(min)) {
			current.setMinutes(current.getMinutes() + 1);
			continue;
		}

		// Found valid trigger
		const execDate = new Date(current.getTime());
		executions.push({
			timestamp: execDate.getTime(),
			localString: execDate.toLocaleString("en-US", {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
			}),
			utcString: execDate.toUTCString(),
			relativeString: formatRelativeTime(execDate, startDate),
		});

		// Advance 1 minute for next iteration
		current.setMinutes(current.getMinutes() + 1);
	}

	return executions;
}
