import { describe, it, expect } from "vitest";
import { tokenizeLine, THEMES } from "../utils/syntax-highlighter";
import { BACKDROPS, CODE_PRESETS } from "../utils/presets";
import { exportCardToSvg } from "../utils/canvas-exporter";
import type { CardConfig } from "../types";

describe("tokenizeLine (Syntax Highlighter)", () => {
	it("tokenizes keywords, types, and variables in TypeScript", () => {
		const line = "const count: number = 42;";
		const tokens = tokenizeLine(line, "typescript");

		const kw = tokens.find((t) => t.type === "keyword");
		const type = tokens.find((t) => t.type === "type");
		const num = tokens.find((t) => t.type === "number");

		expect(kw?.text).toBe("const");
		expect(type?.text).toBe("number");
		expect(num?.text).toBe("42");
	});

	it("identifies strings and comments accurately", () => {
		const line = 'const msg = "hello"; // greeting';
		const tokens = tokenizeLine(line, "typescript");

		const str = tokens.find((t) => t.type === "string");
		const comment = tokens.find((t) => t.type === "comment");

		expect(str?.text).toBe('"hello"');
		expect(comment?.text).toBe("// greeting");
	});

	it("handles SQL syntax with uppercase keywords", () => {
		const line = "SELECT id, name FROM users WHERE active = true;";
		const tokens = tokenizeLine(line, "sql");

		const selectKw = tokens.find((t) => t.text === "SELECT");
		const fromKw = tokens.find((t) => t.text === "FROM");
		const whereKw = tokens.find((t) => t.text === "WHERE");

		expect(selectKw?.type).toBe("keyword");
		expect(fromKw?.type).toBe("keyword");
		expect(whereKw?.type).toBe("keyword");
	});

	it("handles empty and whitespace lines gracefully", () => {
		const tokens = tokenizeLine("   ", "typescript");
		expect(tokens).toHaveLength(1);
		expect(tokens[0]?.type).toBe("plain");
	});
});

describe("THEMES and BACKDROPS", () => {
	it("has complete theme palettes with required token colors", () => {
		const themeKeys = Object.keys(THEMES);
		expect(themeKeys.length).toBeGreaterThanOrEqual(7);

		for (const key of themeKeys) {
			const th = THEMES[key as keyof typeof THEMES];
			expect(th.background).toBeDefined();
			expect(th.tokens.keyword).toBeDefined();
			expect(th.tokens.string).toBeDefined();
			expect(th.tokens.comment).toBeDefined();
			expect(th.tokens.function).toBeDefined();
		}
	});

	it("has diverse backdrop definitions", () => {
		const backdropKeys = Object.keys(BACKDROPS);
		expect(backdropKeys.length).toBeGreaterThanOrEqual(8);

		for (const key of backdropKeys) {
			const bg = BACKDROPS[key as keyof typeof BACKDROPS];
			expect(bg.gradientCss).toBeDefined();
			expect(bg.colors.length).toBeGreaterThan(0);
		}
	});
});

describe("CODE_PRESETS", () => {
	it("contains valid code presets", () => {
		expect(CODE_PRESETS.length).toBeGreaterThanOrEqual(5);

		for (const preset of CODE_PRESETS) {
			expect(preset.id).toBeDefined();
			expect(preset.title).toBeDefined();
			expect(preset.code.length).toBeGreaterThan(0);
			expect(preset.filename).toBeDefined();
		}
	});
});

describe("exportCardToSvg", () => {
	it("generates valid SVG markup from CardConfig", () => {
		const sampleConfig: CardConfig = {
			code: 'export const hello = "world";',
			language: "typescript",
			theme: "dracula",
			windowStyle: "mac",
			title: "hello.ts",
			showLineNumbers: true,
			showWatermark: true,
			watermarkText: "@polm",
			backdrop: "aurora",
			padding: 32,
			shadow: "soft",
			borderRadius: 16,
			fontSize: 14,
		};

		const svg = exportCardToSvg(sampleConfig);
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
		expect(svg).toContain("<rect");
		expect(svg).toContain("<text");
		expect(svg).toContain("hello");
	});
});
