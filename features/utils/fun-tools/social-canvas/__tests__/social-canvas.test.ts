import { describe, it, expect, vi } from "vitest";
import { TEMPLATE_GROUPS, TEMPLATES, type TemplateCategory } from "../types";
import { getDimensions, wrapText } from "../components/CanvasRenderer";

describe("Social Canvas Templates & Groups Configuration", () => {
	it("contains all expected template groups with required fields", () => {
		expect(TEMPLATE_GROUPS).toHaveLength(4);
		const groupIds: TemplateCategory[] = [
			"editorial-social",
			"modern-structural",
			"narrative-text",
			"minimal-focus",
		];

		for (const id of groupIds) {
			const group = TEMPLATE_GROUPS.find((g) => g.id === id);
			expect(group).toBeDefined();
			expect(group?.label).toBeTruthy();
			expect(group?.description).toBeTruthy();
		}
	});

	it("has 21 templates with valid groupings and field definitions", () => {
		expect(TEMPLATES).toHaveLength(21);

		const validGroupIds = new Set(TEMPLATE_GROUPS.map((g) => g.id));
		const templateIds = new Set<string>();

		for (const tmpl of TEMPLATES) {
			// Ensure unique IDs
			expect(templateIds.has(tmpl.id)).toBe(false);
			templateIds.add(tmpl.id);

			// Valid category
			expect(validGroupIds.has(tmpl.group)).toBe(true);

			// Valid field labels
			expect(tmpl.label).toBeTruthy();
			expect(tmpl.fields.titleLabel).toBeTruthy();
			expect(tmpl.fields.descriptionLabel).toBeTruthy();
			expect(tmpl.fields.imageLabel).toBeTruthy();
		}
	});

	it("correctly identifies special template capabilities", () => {
		// Breaking News template
		const breakingNews = TEMPLATES.find((t) => t.id === "breaking-news");
		expect(breakingNews).toBeDefined();
		expect(breakingNews?.group).toBe("editorial-social");
		expect(breakingNews?.fields.titleLabel).toBe("News Headline");

		// Classy Offset template with theme selector
		const classyOffset = TEMPLATES.find((t) => t.id === "classy-offset");
		expect(classyOffset).toBeDefined();
		expect(classyOffset?.group).toBe("minimal-focus");
		expect(classyOffset?.fields.hasTheme).toBe(true);

		// Thread Starter template with avatar support
		const threadStarter = TEMPLATES.find((t) => t.id === "thread-starter");
		expect(threadStarter).toBeDefined();
		expect(threadStarter?.group).toBe("editorial-social");
		expect(threadStarter?.fields.hasAvatar).toBe(true);
	});
});

describe("getDimensions", () => {
	it("returns correct dimensions for standard aspect ratios", () => {
		expect(getDimensions("1:1")).toEqual({ width: 1080, height: 1080 });
		expect(getDimensions("4:5")).toEqual({ width: 1080, height: 1350 });
		expect(getDimensions("9:16")).toEqual({ width: 1080, height: 1920 });
		expect(getDimensions("16:9")).toEqual({ width: 1920, height: 1080 });
	});

	it("falls back to 1:1 for invalid or unexpected aspect ratio", () => {
		// @ts-expect-error Testing fallback for unknown ratio
		expect(getDimensions("unknown")).toEqual({ width: 1080, height: 1080 });
	});
});

describe("wrapText", () => {
	const createMockContext = () => {
		const filledLines: { text: string; x: number; y: number; align: string }[] =
			[];
		const ctx = {
			textAlign: "left" as CanvasTextAlign,
			measureText: (text: string) =>
				({
					width: text.length * 10,
				}) as TextMetrics,
			fillText: vi.fn((text: string, x: number, y: number) => {
				filledLines.push({ text, x, y, align: ctx.textAlign });
			}),
		} as unknown as CanvasRenderingContext2D;

		return { ctx, filledLines };
	};

	it("renders single-line text when within maxWidth", () => {
		const { ctx, filledLines } = createMockContext();
		const finalY = wrapText(ctx, "Hello World", 50, 100, 300, 30, "left");

		expect(filledLines).toHaveLength(1);
		expect(filledLines[0]).toEqual({
			text: "Hello World",
			x: 50,
			y: 100,
			align: "left",
		});
		expect(finalY).toBe(130);
	});

	it("wraps words when text exceeds maxWidth", () => {
		const { ctx, filledLines } = createMockContext();
		// "One Two Three Four" has lengths 3, 3, 5, 4. Each char = 10px.
		// maxWidth = 80px can hold ~8 chars ("One Two" = 7 chars = 70px)
		wrapText(ctx, "One Two Three Four", 0, 0, 80, 20, "left");

		expect(filledLines.length).toBeGreaterThan(1);
		expect(filledLines[0]?.text).toBe("One Two");
		expect(filledLines[1]?.text).toBe("Three");
		expect(filledLines[2]?.text).toBe("Four");
	});

	it("respects explicit newlines and paragraph breaks", () => {
		const { ctx, filledLines } = createMockContext();
		wrapText(ctx, "Line 1\n\nLine 2", 10, 20, 200, 25, "left");

		expect(filledLines).toHaveLength(2);
		expect(filledLines[0]?.text).toBe("Line 1");
		expect(filledLines[0]?.y).toBe(20);
		// Empty line adds lineHeight
		expect(filledLines[1]?.text).toBe("Line 2");
		expect(filledLines[1]?.y).toBe(70);
	});

	it("handles different text alignments (center, right, left)", () => {
		const { ctx, filledLines } = createMockContext();

		wrapText(ctx, "Center", 100, 50, 200, 30, "center");
		expect(filledLines[0]?.align).toBe("center");
		expect(filledLines[0]?.x).toBe(200); // 100 + 200/2

		wrapText(ctx, "Right", 100, 100, 200, 30, "right");
		expect(filledLines[1]?.align).toBe("right");
		expect(filledLines[1]?.x).toBe(300); // 100 + 200
	});

	it("splits oversized unbroken words that exceed maxWidth", () => {
		const { ctx, filledLines } = createMockContext();
		// "Supercalifragilistic" is 20 chars = 200px. maxWidth is 50px (5 chars max per chunk)
		wrapText(ctx, "Supercalifragilistic", 0, 0, 50, 20, "left");

		expect(filledLines.length).toBe(4);
		for (const line of filledLines) {
			expect(line.text.length).toBeLessThanOrEqual(5);
		}
	});
});
