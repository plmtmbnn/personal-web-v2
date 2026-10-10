export type TemplateId =
	| "hero-overlay"
	| "minimalist-split"
	| "floating-card"
	| "breaking-news"
	| "quote-minimal"
	| "duotone-overlay"
	| "thread-starter"
	| "flat-bento"
	| "neo-brutalist"
	| "swiss-grid"
	| "polaroid-brutalist"
	| "typography-poster"
	| "split-monochrome"
	| "manifesto-block"
	| "narrative-focus"
	| "minimal-chapter"
	| "classy-offset"
	| "premium-glass"
	| "cinematic-subtitles"
	| "vinyl-now-playing"
	| "terminal-window"
	| "social-post";

export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

export interface CanvasInputs {
	title: string;
	description: string;
	imageSource: string | null; // Data URL or null
	avatarSource?: string | null; // Data URL for avatars
	imageOffsetX?: number; // 0 to 1 for object-position (default 0.5)
	imageOffsetY?: number; // 0 to 1 for object-position (default 0.5)
	avatarOffsetX?: number; // 0 to 1 for avatar object-position
	avatarOffsetY?: number; // 0 to 1 for avatar object-position
	template: TemplateId;
	aspectRatio: AspectRatio;
	theme?: "light" | "dark";
}

export type TemplateCategory =
	| "editorial-social"
	| "modern-structural"
	| "narrative-text"
	| "minimal-focus";

export interface TemplateGroup {
	id: TemplateCategory;
	label: string;
	description: string;
}

export const TEMPLATE_GROUPS: TemplateGroup[] = [
	{
		id: "editorial-social",
		label: "Editorial & Social",
		description: "High-impact layouts for news, media, threads, and cards",
	},
	{
		id: "modern-structural",
		label: "Modern & Structural",
		description: "Bento grids, neo-brutalist cards, and Swiss typography",
	},
	{
		id: "narrative-text",
		label: "Narrative & Text",
		description: "Bold manifestos, posters, chapters, and statement cards",
	},
	{
		id: "minimal-focus",
		label: "Minimal & Focus",
		description: "Clean splits, minimal quotes, and duotone photography",
	},
];

export const TEMPLATES: {
	id: TemplateId;
	label: string;
	group: TemplateCategory;
	fields: {
		titleLabel: string;
		descriptionLabel: string;
		imageLabel: string;
		hasAvatar?: boolean;
		hasTheme?: boolean;
	};
}[] = [
	{
		id: "hero-overlay",
		label: "Hero Overlay",
		group: "editorial-social",
		fields: {
			titleLabel: "Headline",
			descriptionLabel: "Subtitle",
			imageLabel: "Background Image",
		},
	},
	{
		id: "breaking-news",
		label: "Breaking News",
		group: "editorial-social",
		fields: {
			titleLabel: "News Headline",
			descriptionLabel: "News Details",
			imageLabel: "News Photo",
		},
	},
	{
		id: "thread-starter",
		label: "Thread Starter",
		group: "editorial-social",
		fields: {
			titleLabel: "Username",
			descriptionLabel: "Thread Content",
			imageLabel: "Thread Attachment (Optional)",
			hasAvatar: true,
		},
	},
	{
		id: "floating-card",
		label: "Floating Card",
		group: "editorial-social",
		fields: {
			titleLabel: "Card Title",
			descriptionLabel: "Card Description",
			imageLabel: "Background / Thumbnail",
		},
	},
	{
		id: "flat-bento",
		label: "Flat Bento",
		group: "modern-structural",
		fields: {
			titleLabel: "Main Module",
			descriptionLabel: "Detail Module",
			imageLabel: "Image Module",
		},
	},
	{
		id: "neo-brutalist",
		label: "Neo Brutalist",
		group: "modern-structural",
		fields: {
			titleLabel: "Brutalist Headline",
			descriptionLabel: "Context Block",
			imageLabel: "Hero Image",
		},
	},
	{
		id: "swiss-grid",
		label: "Swiss Grid",
		group: "modern-structural",
		fields: {
			titleLabel: "Grid Headline",
			descriptionLabel: "Structured Data",
			imageLabel: "Grid Window",
		},
	},
	{
		id: "polaroid-brutalist",
		label: "Brutalist Card",
		group: "modern-structural",
		fields: {
			titleLabel: "Card Title",
			descriptionLabel: "Footer Text",
			imageLabel: "Photo Centerpiece",
		},
	},
	{
		id: "typography-poster",
		label: "Typography Poster",
		group: "narrative-text",
		fields: {
			titleLabel: "Massive Typo",
			descriptionLabel: "Small Context",
			imageLabel: "Accent Sticker (Optional)",
		},
	},
	{
		id: "manifesto-block",
		label: "The Manifesto",
		group: "narrative-text",
		fields: {
			titleLabel: "Bold Manifesto (Short)",
			descriptionLabel: "Sign-off / Context",
			imageLabel: "Small Brand Icon (Optional)",
		},
	},
	{
		id: "narrative-focus",
		label: "Narrative Focus",
		group: "narrative-text",
		fields: {
			titleLabel: "Core Narrative",
			descriptionLabel: "Source / Chapter",
			imageLabel: "Cinematic Background",
		},
	},
	{
		id: "minimal-chapter",
		label: "Minimal Chapter",
		group: "narrative-text",
		fields: {
			titleLabel: "Chapter Title",
			descriptionLabel: "The Core Message",
			imageLabel: "Chapter Artwork",
		},
	},
	{
		id: "minimalist-split",
		label: "Minimalist Split",
		group: "minimal-focus",
		fields: {
			titleLabel: "Headline",
			descriptionLabel: "Body Text",
			imageLabel: "Side Image",
		},
	},
	{
		id: "quote-minimal",
		label: "Minimal Quote",
		group: "minimal-focus",
		fields: {
			titleLabel: "The Quote",
			descriptionLabel: "Author Name",
			imageLabel: "Background Image",
		},
	},
	{
		id: "duotone-overlay",
		label: "Duotone Overlay",
		group: "minimal-focus",
		fields: {
			titleLabel: "Bold Statement",
			descriptionLabel: "Subtext",
			imageLabel: "Background Image",
		},
	},
	{
		id: "split-monochrome",
		label: "Split Monochrome",
		group: "minimal-focus",
		fields: {
			titleLabel: "Top Statement",
			descriptionLabel: "Bottom Detail",
			imageLabel: "Center Image",
		},
	},
	{
		id: "classy-offset",
		label: "Classy Offset",
		group: "minimal-focus",
		fields: {
			titleLabel: "Main Statement",
			descriptionLabel: "Lead-in text",
			imageLabel: "Background Image",
			hasTheme: true,
		},
	},
	{
		id: "premium-glass",
		label: "Premium Glass",
		group: "modern-structural",
		fields: {
			titleLabel: "Hero Headline",
			descriptionLabel: "Secondary Detail",
			imageLabel: "Background Image",
			hasTheme: true,
		},
	},
	{
		id: "cinematic-subtitles",
		label: "Cinematic Subtitle",
		group: "narrative-text",
		fields: {
			titleLabel: "Subtitle Text",
			descriptionLabel: "Scene / Timecode",
			imageLabel: "Cinematic Still",
			hasTheme: true,
		},
	},
	{
		id: "vinyl-now-playing",
		label: "Now Playing",
		group: "editorial-social",
		fields: {
			titleLabel: "Track / Main Title",
			descriptionLabel: "Artist / Author",
			imageLabel: "Album Cover Art",
			hasTheme: true,
		},
	},
	{
		id: "terminal-window",
		label: "Code Terminal",
		group: "modern-structural",
		fields: {
			titleLabel: "Command / File Header",
			descriptionLabel: "Code / Terminal Output",
			imageLabel: "Backdrop (Optional)",
			hasTheme: true,
		},
	},
	{
		id: "social-post",
		label: "Social Post Mockup",
		group: "editorial-social",
		fields: {
			titleLabel: "Name & Handle (e.g. User @handle)",
			descriptionLabel: "Post Content",
			imageLabel: "Attachment (Optional)",
			hasAvatar: true,
			hasTheme: true,
		},
	},
];
