export type SupportedLanguage =
	| "typescript"
	| "javascript"
	| "python"
	| "go"
	| "rust"
	| "sql"
	| "json"
	| "html"
	| "css"
	| "shell"
	| "markdown"
	| "text";

export type CodeThemeId =
	| "one-dark"
	| "dracula"
	| "github-dark"
	| "monokai"
	| "nord"
	| "synthwave"
	| "midnight";

export type WindowStyle = "mac" | "windows" | "dots" | "none";

export type BackdropId =
	| "cosmic-sunset"
	| "aurora"
	| "neon-violet"
	| "ocean-blue"
	| "cyberpunk"
	| "sunset-peach"
	| "slate-dark"
	| "pure-dark"
	| "transparent";

export type TokenType =
	| "keyword"
	| "string"
	| "comment"
	| "number"
	| "function"
	| "type"
	| "variable"
	| "operator"
	| "punctuation"
	| "plain";

export interface SyntaxToken {
	text: string;
	type: TokenType;
}

export interface CardConfig {
	code: string;
	language: SupportedLanguage;
	theme: CodeThemeId;
	windowStyle: WindowStyle;
	title: string;
	showLineNumbers: boolean;
	showWatermark: boolean;
	watermarkText: string;
	backdrop: BackdropId;
	padding: number; // 16, 32, 48, 64, 80
	shadow: "none" | "soft" | "heavy" | "glow";
	borderRadius: number;
	fontSize: number;
}

export interface ThemeColors {
	id: CodeThemeId;
	name: string;
	background: string;
	foreground: string;
	headerBackground: string;
	headerBorder: string;
	lineNumber: string;
	tokens: Record<TokenType, string>;
}

export interface BackdropDefinition {
	id: BackdropId;
	name: string;
	gradientCss: string;
	colors: string[];
}

export interface CodePreset {
	id: string;
	title: string;
	category: string;
	language: SupportedLanguage;
	filename: string;
	code: string;
}
