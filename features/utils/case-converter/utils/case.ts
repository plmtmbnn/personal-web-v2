export type CaseType =
	| "camel"
	| "pascal"
	| "snake"
	| "kebab"
	| "upper"
	| "lower"
	| "capitalize";

/**
 * Splits a string into words regardless of its current case
 */
export const toWords = (str: string): string[] => {
	return str
		.replace(/([A-Z])/g, " $1") // Split camel/pascal
		.replace(/[_-]+/g, " ") // Split snake/kebab
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0)
		.map((w) => w.toLowerCase());
};

/**
 * Joins words into the target case
 */
export const fromWords = (words: string[], target: CaseType): string => {
	if (words.length === 0) return "";

	switch (target) {
		case "camel":
			return (
				words[0] +
				words
					.slice(1)
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join("")
			);
		case "pascal":
			return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
		case "snake":
			return words.join("_");
		case "kebab":
			return words.join("-");
		case "upper":
			return words.join(" ").toUpperCase();
		case "lower":
			return words.join(" ").toLowerCase();
		case "capitalize":
			return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
		default:
			return words.join(" ");
	}
};

/**
 * Recursively transforms keys of a JSON object
 */
export const transformObject = (obj: any, target: CaseType): any => {
	if (Array.isArray(obj)) {
		return obj.map((v) => transformObject(v, target));
	}
	if (obj !== null && typeof obj === "object") {
		const newObj: any = {};
		for (const key of Object.keys(obj)) {
			const words = toWords(key);
			const newKey = fromWords(words, target);
			newObj[newKey] = transformObject(obj[key], target);
		}
		return newObj;
	}
	return obj;
};
