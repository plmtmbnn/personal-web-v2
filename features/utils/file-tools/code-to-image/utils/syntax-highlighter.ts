import type {
	CodeThemeId,
	SupportedLanguage,
	SyntaxToken,
	ThemeColors,
	TokenType,
} from "../types";

export const THEMES: Record<CodeThemeId, ThemeColors> = {
	"one-dark": {
		id: "one-dark",
		name: "One Dark Pro",
		background: "#282c34",
		foreground: "#abb2bf",
		headerBackground: "#21252b",
		headerBorder: "rgba(255, 255, 255, 0.08)",
		lineNumber: "#5c6370",
		tokens: {
			keyword: "#c678dd",
			string: "#98c379",
			comment: "#5c6370",
			number: "#d19a66",
			function: "#61afef",
			type: "#e5c07b",
			variable: "#e06c75",
			operator: "#56b6c2",
			punctuation: "#abb2bf",
			plain: "#abb2bf",
		},
	},
	dracula: {
		id: "dracula",
		name: "Dracula",
		background: "#282a36",
		foreground: "#f8f8f2",
		headerBackground: "#1e1f29",
		headerBorder: "rgba(255, 255, 255, 0.1)",
		lineNumber: "#6272a4",
		tokens: {
			keyword: "#ff79c6",
			string: "#f1fa8c",
			comment: "#6272a4",
			number: "#bd93f9",
			function: "#50fa7b",
			type: "#8be9fd",
			variable: "#ffb86c",
			operator: "#ff79c6",
			punctuation: "#f8f8f2",
			plain: "#f8f8f2",
		},
	},
	"github-dark": {
		id: "github-dark",
		name: "GitHub Dark",
		background: "#0d1117",
		foreground: "#c9d1d9",
		headerBackground: "#161b22",
		headerBorder: "#30363d",
		lineNumber: "#484f58",
		tokens: {
			keyword: "#ff7b72",
			string: "#a5d6ff",
			comment: "#8b949e",
			number: "#79c0ff",
			function: "#d2a8ff",
			type: "#ffa657",
			variable: "#c9d1d9",
			operator: "#ff7b72",
			punctuation: "#c9d1d9",
			plain: "#c9d1d9",
		},
	},
	monokai: {
		id: "monokai",
		name: "Monokai Pro",
		background: "#272822",
		foreground: "#f8f8f2",
		headerBackground: "#1e1f1c",
		headerBorder: "rgba(255, 255, 255, 0.08)",
		lineNumber: "#75715e",
		tokens: {
			keyword: "#f92672",
			string: "#e6db74",
			comment: "#75715e",
			number: "#ae81ff",
			function: "#a6e22e",
			type: "#66d9ef",
			variable: "#fd971f",
			operator: "#f92672",
			punctuation: "#f8f8f2",
			plain: "#f8f8f2",
		},
	},
	nord: {
		id: "nord",
		name: "Nord",
		background: "#2e3440",
		foreground: "#d8dee9",
		headerBackground: "#242933",
		headerBorder: "rgba(255, 255, 255, 0.08)",
		lineNumber: "#4c566a",
		tokens: {
			keyword: "#81a1c1",
			string: "#a3be8c",
			comment: "#616e88",
			number: "#b48ead",
			function: "#88c0d0",
			type: "#8fbcbb",
			variable: "#d8dee9",
			operator: "#81a1c1",
			punctuation: "#eceff4",
			plain: "#d8dee9",
		},
	},
	synthwave: {
		id: "synthwave",
		name: "Synthwave '84",
		background: "#262335",
		foreground: "#ff7edb",
		headerBackground: "#1d1a27",
		headerBorder: "rgba(255, 126, 219, 0.2)",
		lineNumber: "#614d85",
		tokens: {
			keyword: "#fede5d",
			string: "#ff8b39",
			comment: "#614d85",
			number: "#f97e72",
			function: "#36f9f6",
			type: "#fe4450",
			variable: "#ff7edb",
			operator: "#fede5d",
			punctuation: "#b6b1b1",
			plain: "#ff7edb",
		},
	},
	midnight: {
		id: "midnight",
		name: "Obsidian Midnight",
		background: "#090a0f",
		foreground: "#e2e8f0",
		headerBackground: "#030407",
		headerBorder: "rgba(255, 255, 255, 0.12)",
		lineNumber: "#334155",
		tokens: {
			keyword: "#38bdf8",
			string: "#4ade80",
			comment: "#475569",
			number: "#f59e0b",
			function: "#818cf8",
			type: "#c084fc",
			variable: "#f1f5f9",
			operator: "#38bdf8",
			punctuation: "#94a3b8",
			plain: "#e2e8f0",
		},
	},
};

const KEYWORDS = new Set([
	// TS/JS
	"const",
	"let",
	"var",
	"function",
	"return",
	"if",
	"else",
	"for",
	"while",
	"do",
	"switch",
	"case",
	"break",
	"continue",
	"import",
	"from",
	"export",
	"default",
	"async",
	"await",
	"try",
	"catch",
	"finally",
	"throw",
	"new",
	"class",
	"extends",
	"interface",
	"type",
	"enum",
	"implements",
	"public",
	"private",
	"protected",
	"readonly",
	"static",
	"typeof",
	"instanceof",
	"in",
	"of",
	"as",
	"is",
	// Python
	"def",
	"elif",
	"with",
	"pass",
	"lambda",
	"yield",
	"raise",
	"except",
	// Go
	"func",
	"package",
	"go",
	"chan",
	"defer",
	"struct",
	"map",
	"range",
	// SQL
	"SELECT",
	"FROM",
	"WHERE",
	"INSERT",
	"INTO",
	"VALUES",
	"UPDATE",
	"SET",
	"DELETE",
	"JOIN",
	"LEFT",
	"RIGHT",
	"INNER",
	"OUTER",
	"ON",
	"GROUP",
	"BY",
	"ORDER",
	"HAVING",
	"LIMIT",
	"OFFSET",
	"CREATE",
	"TABLE",
	"DROP",
	"ALTER",
	"AND",
	"OR",
	"NOT",
	"NULL",
	"PRIMARY",
	"KEY",
	"FOREIGN",
	"REFERENCES",
]);

const TYPES = new Set([
	"string",
	"number",
	"boolean",
	"any",
	"void",
	"null",
	"undefined",
	"never",
	"unknown",
	"object",
	"symbol",
	"bigint",
	"Promise",
	"Array",
	"Record",
	"Set",
	"Map",
	"true",
	"false",
	"None",
	"True",
	"False",
	"int",
	"float",
	"str",
	"bool",
	"list",
	"dict",
	"tuple",
	"byte",
	"rune",
	"error",
]);

/**
 * Tokenizes a single line of source code into syntax highlighted chunks.
 */
export function tokenizeLine(
	line: string,
	language: SupportedLanguage,
): SyntaxToken[] {
	if (line.trim() === "") {
		return [{ text: line, type: "plain" }];
	}

	const tokens: SyntaxToken[] = [];

	// Single line comments
	const commentPrefixes = ["//", "#", "--"];
	for (const prefix of commentPrefixes) {
		const commentIdx = line.indexOf(prefix);
		if (commentIdx !== -1) {
			// Check if comment prefix is not inside a string
			const before = line.slice(0, commentIdx);
			const doubleQuotes = (before.match(/"/g) || []).length;
			const singleQuotes = (before.match(/'/g) || []).length;
			if (doubleQuotes % 2 === 0 && singleQuotes % 2 === 0) {
				if (commentIdx > 0) {
					tokens.push(...tokenizeLineSegments(before, language));
				}
				tokens.push({
					text: line.slice(commentIdx),
					type: "comment",
				});
				return tokens;
			}
		}
	}

	return tokenizeLineSegments(line, language);
}

function tokenizeLineSegments(
	segment: string,
	language: SupportedLanguage,
): SyntaxToken[] {
	const tokens: SyntaxToken[] = [];
	// Regex matches: strings, words/identifiers, numbers, operators/punctuation, or whitespace
	const tokenRegex =
		/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|[a-zA-Z_$][a-zA-Z0-9_$]*|\d+(?:\.\d+)?|=>|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||[{}()[\].,;:+\-*/%&|^!~?=<>@]|\s+)/g;

	let match: RegExpExecArray | null = tokenRegex.exec(segment);

	while (match !== null) {
		const text = match[0];
		let type: TokenType = "plain";

		if (
			(text.startsWith('"') && text.endsWith('"')) ||
			(text.startsWith("'") && text.endsWith("'")) ||
			(text.startsWith("`") && text.endsWith("`"))
		) {
			type = "string";
		} else if (/^\d+(?:\.\d+)?$/.test(text)) {
			type = "number";
		} else if (
			KEYWORDS.has(text) ||
			(language === "sql" && KEYWORDS.has(text.toUpperCase()))
		) {
			type = "keyword";
		} else if (TYPES.has(text)) {
			type = "type";
		} else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(text)) {
			// Capitalized identifier -> Type / Class / Component
			type = "type";
		} else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(text)) {
			// Lookahead in segment to see if followed by ( -> Function call
			const afterIdx = match.index + text.length;
			const nextNonSpace = segment.slice(afterIdx).trimStart();
			if (nextNonSpace.startsWith("(")) {
				type = "function";
			} else {
				type = "variable";
			}
		} else if (/[=>+*/%&|^!~?-]/.test(text)) {
			type = "operator";
		} else if (/[{}()[\].,;:]/.test(text)) {
			type = "punctuation";
		}

		tokens.push({ text, type });
		match = tokenRegex.exec(segment);
	}

	return tokens;
}
