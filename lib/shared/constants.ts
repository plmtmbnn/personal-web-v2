/**
 * Global application constants
 * Keep all site-wide values here
 */

export const EXPERIENCE_YEAR = new Date().getFullYear() - 2018;

// ─── Site Identity ─────────────────────────────────────────────────────────────

export const SITE = {
	name: "Polma Tambunan",

	/** Short tagline — used in SEO title templates and meta descriptions */
	tagline: "Engineering Systems. Miles Everywhere.",

	/**
	 * Long-form description — used as the default meta description.
	 * ~150 chars, keyword-rich for Google Search snippets.
	 */
	description: `Software engineer with ${EXPERIENCE_YEAR}+ years building reliable systems at scale — road runner, trail enthusiast, and hiker based in Indonesia.`,

	url: "https://polmatambunan.my.id",
	locale: "en_US",
	author: "Polma Tambunan",
	version: "0.1.7",
};

// ─── Author ────────────────────────────────────────────────────────────────────

export const AUTHOR = {
	name: "Polma Tambunan",
	role: "Software Engineer",
	location: "Toba, North Sumatra, Indonesia",
	email: "plmtmbnn@gmail.com",
	available: false,
};

// ─── Stats ─────────────────────────────────────────────────────────────────────

export const AUTHOR_STATS = {
	experienceFrom: 2018,
	runningKmPerYear: 1000,
	fintechSystems: 10,
};

// ─── SEO ───────────────────────────────────────────────────────────────────────

export const SEO = {
	defaultTitle: SITE.name,
	titleTemplate: "%s · Polma Tambunan",
	defaultDescription: SITE.description,
	twitterHandle: "@plmtmbnn",

	/**
	 * Structured keyword taxonomy — injected into every page's <meta keywords>.
	 * Covers both engineering and running identity signals.
	 */
	baseKeywords: [
		// Engineering identity
		"Polma Tambunan",
		"software engineer Indonesia",
		"fintech engineer",
		"backend engineer",
		"TypeScript developer",
		"React developer",
		"Next.js developer",
		"system design",
		"financial systems",
		// Running & lifestyle identity
		"distance runner Indonesia",
		"trail runner",
		"ultramarathon Indonesia",
		"toba runner",
		"running blog",
		// Geo signals
		"Toba Samosir",
		"North Sumatra",
		"Indonesia tech",
	] as string[],
};

// ─── Social Links ──────────────────────────────────────────────────────────────

export const SOCIAL_LINKS = {
	github: "https://github.com/plmtmbnn",
	linkedin: "https://linkedin.com/in/polma-tambunan",
	twitter: "https://x.com/plmtmbnn",
	strava: "https://www.strava.com/athletes/plmtmbnn",
};

// ─── Person Schema (JSON-LD) ───────────────────────────────────────────────────
// Used in <script type="application/ld+json"> on the home page for rich results.

export const PERSON_SCHEMA = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: AUTHOR.name,
	url: SITE.url,
	email: AUTHOR.email,
	jobTitle: AUTHOR.role,
	description: SITE.description,
	address: {
		"@type": "PostalAddress",
		addressLocality: "Toba",
		addressRegion: "North Sumatra",
		addressCountry: "ID",
	},
	sameAs: [
		SOCIAL_LINKS.github,
		SOCIAL_LINKS.linkedin,
		SOCIAL_LINKS.twitter,
		SOCIAL_LINKS.strava,
	],
	knowsAbout: [
		"Software Engineering",
		"Fintech Systems",
		"TypeScript",
		"React",
		"Next.js",
		"System Design",
		"Distance Running",
		"Trail Running",
		"Hiking",
	],
} as const;
