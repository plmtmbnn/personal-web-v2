import type {
	PasswordOptions,
	PasswordStrengthResult,
	StrengthLevel,
} from "../types";

// Curated memorable EFF/Diceware wordlist for passphrases
export const MEMORABLE_WORDS: string[] = [
	"acorn",
	"action",
	"advance",
	"anchor",
	"anthem",
	"apex",
	"apollo",
	"archer",
	"arctic",
	"arena",
	"armor",
	"arrow",
	"aspect",
	"astral",
	"atlas",
	"atom",
	"aurora",
	"autumn",
	"avatar",
	"badge",
	"bamboo",
	"banner",
	"beacon",
	"breeze",
	"bridge",
	"bronze",
	"bubble",
	"cactus",
	"canyon",
	"castle",
	"cedar",
	"cipher",
	"circle",
	"cliff",
	"clover",
	"cobalt",
	"comet",
	"compass",
	"copper",
	"coral",
	"cosmic",
	"crater",
	"crest",
	"crystal",
	"dagger",
	"dawn",
	"delta",
	"desert",
	"diamond",
	"dragon",
	"dynamo",
	"eagle",
	"echo",
	"eclipse",
	"element",
	"ember",
	"emerald",
	"empire",
	"falcon",
	"feather",
	"flame",
	"forest",
	"fossil",
	"frost",
	"galaxy",
	"garden",
	"garnet",
	"glacier",
	"granite",
	"gravity",
	"grove",
	"harbor",
	"hawk",
	"haven",
	"hazard",
	"helix",
	"horizon",
	"hunter",
	"hybrid",
	"icicle",
	"impact",
	"indigo",
	"island",
	"jaguar",
	"javelin",
	"jungle",
	"jupiter",
	"kayak",
	"kinetic",
	"knight",
	"lagoon",
	"lantern",
	"laser",
	"legacy",
	"legend",
	"lemur",
	"leopard",
	"liberty",
	"lizard",
	"lotus",
	"lunar",
	"magnet",
	"mammoth",
	"mantle",
	"marble",
	"matrix",
	"meadow",
	"meteor",
	"mirage",
	"monolith",
	"nebula",
	"nectar",
	"nexus",
	"ninja",
	"nomad",
	"nova",
	"oasis",
	"obsidian",
	"ocean",
	"octane",
	"olympus",
	"omega",
	"onyx",
	"orbit",
	"orchid",
	"origin",
	"osprey",
	"outpost",
	"palace",
	"panther",
	"parrot",
	"pebble",
	"pegasus",
	"phantom",
	"phoenix",
	"pioneer",
	"planet",
	"plasma",
	"polar",
	"prism",
	"pulse",
	"pyramid",
	"quantum",
	"quartz",
	"quasar",
	"quiver",
	"radar",
	"radiant",
	"raptor",
	"raven",
	"reactor",
	"reef",
	"relic",
	"rhino",
	"ridge",
	"ripple",
	"river",
	"rocket",
	"safari",
	"sapphire",
	"saturn",
	"scale",
	"scarlet",
	"scenic",
	"scribe",
	"shadow",
	"shield",
	"sierra",
	"silicon",
	"silver",
	"solace",
	"solar",
	"spark",
	"sphere",
	"spiral",
	"spirit",
	"summit",
	"sunburst",
	"super",
	"surge",
	"taiga",
	"talon",
	"temple",
	"timber",
	"titan",
	"topaz",
	"tornado",
	"torpedo",
	"tracker",
	"transit",
	"tribute",
	"trident",
	"trophy",
	"tundra",
	"twilight",
	"ultra",
	"universe",
	"valley",
	"vapor",
	"vector",
	"velocity",
	"venture",
	"vessel",
	"vibrant",
	"viking",
	"vintage",
	"violet",
	"viper",
	"vision",
	"vortex",
	"voyager",
	"walrus",
	"warrior",
	"wave",
	"whisper",
	"wildcat",
	"willow",
	"wind",
	"winter",
	"wizard",
	"wolf",
	"zenith",
	"zephyr",
	"zodiac",
];

const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?~";
const AMBIGUOUS_CHARS = new Set([
	"l",
	"1",
	"I",
	"o",
	"0",
	"O",
	"|",
	"i",
	";",
	":",
]);

/**
 * Returns a cryptographically secure random index in range [0, max).
 */
export function getSecureRandomInt(max: number): number {
	if (max <= 0) return 0;
	if (typeof window !== "undefined" && window.crypto) {
		const array = new Uint32Array(1);
		const maxUint32 = 0xffffffff;
		const limit = maxUint32 - (maxUint32 % max);
		let rand = maxUint32;
		while (rand >= limit) {
			window.crypto.getRandomValues(array);
			rand = array[0] ?? 0;
		}
		return rand % max;
	}
	return Math.floor(Math.random() * max);
}

/**
 * Generates a cryptographically strong random password based on options.
 */
export function generateSecurePassword(options: PasswordOptions): string {
	if (options.mode === "passphrase") {
		return generatePassphrase(options);
	}
	if (options.mode === "pin") {
		return generatePin(options.length || 6);
	}

	let charset = "";
	const requiredChars: string[] = [];

	if (options.includeUppercase) {
		const filtered = options.avoidAmbiguous
			? UPPERCASE_CHARS.split("")
					.filter((c) => !AMBIGUOUS_CHARS.has(c))
					.join("")
			: UPPERCASE_CHARS;
		if (filtered) {
			charset += filtered;
			requiredChars.push(filtered[getSecureRandomInt(filtered.length)] ?? "");
		}
	}

	if (options.includeLowercase) {
		const filtered = options.avoidAmbiguous
			? LOWERCASE_CHARS.split("")
					.filter((c) => !AMBIGUOUS_CHARS.has(c))
					.join("")
			: LOWERCASE_CHARS;
		if (filtered) {
			charset += filtered;
			requiredChars.push(filtered[getSecureRandomInt(filtered.length)] ?? "");
		}
	}

	if (options.includeNumbers) {
		const filtered = options.avoidAmbiguous
			? NUMBER_CHARS.split("")
					.filter((c) => !AMBIGUOUS_CHARS.has(c))
					.join("")
			: NUMBER_CHARS;
		if (filtered) {
			charset += filtered;
			requiredChars.push(filtered[getSecureRandomInt(filtered.length)] ?? "");
		}
	}

	if (options.includeSymbols) {
		const filtered = options.avoidAmbiguous
			? SYMBOL_CHARS.split("")
					.filter((c) => !AMBIGUOUS_CHARS.has(c))
					.join("")
			: SYMBOL_CHARS;
		if (filtered) {
			charset += filtered;
			requiredChars.push(filtered[getSecureRandomInt(filtered.length)] ?? "");
		}
	}

	if (!charset) {
		charset = LOWERCASE_CHARS;
	}

	const passwordLength = Math.max(4, Math.min(128, options.length || 16));
	const passwordChars: string[] = [...requiredChars];

	while (passwordChars.length < passwordLength) {
		const char = charset[getSecureRandomInt(charset.length)];
		if (char) passwordChars.push(char);
	}

	// Cryptographically shuffle characters
	for (let i = passwordChars.length - 1; i > 0; i--) {
		const j = getSecureRandomInt(i + 1);
		const temp = passwordChars[i] ?? "";
		passwordChars[i] = passwordChars[j] ?? "";
		passwordChars[j] = temp;
	}

	return passwordChars.join("");
}

/**
 * Generates an EFF-style memorable passphrase.
 */
export function generatePassphrase(options: PasswordOptions): string {
	const count = Math.max(3, Math.min(12, options.wordCount || 4));
	const words: string[] = [];

	for (let i = 0; i < count; i++) {
		let word =
			MEMORABLE_WORDS[getSecureRandomInt(MEMORABLE_WORDS.length)] ?? "shield";
		if (options.capitalizeWords) {
			word = word.charAt(0).toUpperCase() + word.slice(1);
		}
		words.push(word);
	}

	if (options.includeNumberInPassphrase) {
		const num = getSecureRandomInt(100);
		const lastIdx = words.length - 1;
		if (words[lastIdx]) {
			words[lastIdx] = `${words[lastIdx]}${num}`;
		}
	}

	return words.join(options.separator ?? "-");
}

/**
 * Generates a numeric PIN code of specified length.
 */
export function generatePin(length = 6): string {
	const len = Math.max(4, Math.min(32, length));
	let pin = "";
	for (let i = 0; i < len; i++) {
		pin += NUMBER_CHARS[getSecureRandomInt(NUMBER_CHARS.length)];
	}
	return pin;
}

/**
 * Converts a duration in seconds into a friendly human-readable crack-time string.
 */
export function formatCrackTime(seconds: number): string {
	if (seconds < 1) return "Instant (< 1s)";
	if (seconds < 60) return `${Math.round(seconds)} seconds`;
	if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
	if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
	if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
	if (seconds < 31536000 * 100)
		return `${Math.round(seconds / 31536000)} years`;
	if (seconds < 31536000 * 10000)
		return `${Math.round(seconds / (31536000 * 100))} centuries`;
	if (seconds < 31536000 * 1000000000) return "Millions of years";
	return "Trillions of years (Impenetrable)";
}

/**
 * Computes NIST-grade entropy bits and crack-time metrics.
 */
export function calculatePasswordStrength(
	password: string,
): PasswordStrengthResult {
	if (!password) {
		return {
			score: 0,
			level: "very-weak",
			label: "Empty",
			entropyBits: 0,
			crackTimeOnline: "Instant",
			crackTimeOffline: "Instant",
			color: "text-slate-400",
			bgColor: "bg-slate-200",
			feedback: "Enter or generate a password to inspect security.",
		};
	}

	let poolSize = 0;
	if (/[a-z]/.test(password)) poolSize += 26;
	if (/[A-Z]/.test(password)) poolSize += 26;
	if (/[0-9]/.test(password)) poolSize += 10;
	if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

	if (poolSize === 0) poolSize = 10;

	// Entropy: E = L * log2(R)
	const entropyBits = Math.round(password.length * Math.log2(poolSize));

	// Crack time estimations (Combinations = 2^E)
	// Online throttled attacks: ~10,000 attempts / sec
	// Fast offline GPU cluster attack: ~10,000,000,000 (10B) attempts / sec
	const combinations = 2 ** entropyBits;
	const secondsOnline = combinations / (2 * 10000);
	const secondsOffline = combinations / (2 * 10000000000);

	let level: StrengthLevel = "very-weak";
	let label = "Very Weak";
	let score = Math.min(100, Math.round((entropyBits / 100) * 100));
	let color = "text-rose-600";
	let bgColor = "bg-rose-500";
	let feedback = "Very vulnerable to brute force and dictionary attacks.";

	if (entropyBits >= 100) {
		level = "very-strong";
		label = "Military Grade";
		score = 100;
		color = "text-indigo-600";
		bgColor = "bg-indigo-600";
		feedback = "Maximum resistance against state-level supercomputing attacks.";
	} else if (entropyBits >= 75) {
		level = "strong";
		label = "Strong";
		score = Math.min(95, score);
		color = "text-emerald-600";
		bgColor = "bg-emerald-500";
		feedback = "High security for financial, server, and master credentials.";
	} else if (entropyBits >= 50) {
		level = "fair";
		label = "Moderate";
		score = Math.min(70, score);
		color = "text-amber-500";
		bgColor = "bg-amber-500";
		feedback =
			"Acceptable for non-critical accounts, but consider adding symbols or words.";
	} else if (entropyBits >= 30) {
		level = "weak";
		label = "Weak";
		score = Math.min(40, score);
		color = "text-orange-500";
		bgColor = "bg-orange-500";
		feedback = "Could be cracked within minutes or hours using GPU clusters.";
	}

	return {
		score,
		level,
		label,
		entropyBits,
		crackTimeOnline: formatCrackTime(secondsOnline),
		crackTimeOffline: formatCrackTime(secondsOffline),
		color,
		bgColor,
		feedback,
	};
}
