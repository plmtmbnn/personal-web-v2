import { afterEach, expect, test, vi } from "vitest";
import { AUTHOR } from "@/lib/shared/constants";
import { destinations } from "../../data";
import { formatVisitDate, renderPostcardBackToCanvas } from "../postcardCanvas";

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

test("back export keeps every current message and address inside the postcard", async () => {
	const fontHost = document.createElement("div");
	fontHost.innerHTML = '<h2 id="journal-title"></h2>';
	document.body.appendChild(fontHost);
	let resolvedFromHost = false;
	vi.spyOn(window, "getComputedStyle").mockImplementation((element) => {
		resolvedFromHost ||= element.parentElement === fontHost;
		return { fontFamily: "TestCaveat" } as CSSStyleDeclaration;
	});
	const fillText = vi.fn();
	const translate = vi.fn();
	const context = new Proxy(
		{
			fillText,
			translate,
			measureText: (text: string) => ({ width: text.length * 14 }),
		},
		{ get: (target, property) => Reflect.get(target, property) ?? (() => {}) },
	) as unknown as CanvasRenderingContext2D;
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
		() => context,
	);
	vi.stubGlobal(
		"Image",
		class {
			onerror?: () => void;
			set src(_url: string) {
				queueMicrotask(() => this.onerror?.());
			}
		},
	);

	for (const destination of destinations) {
		fillText.mockClear();
		translate.mockClear();
		const canvas = await renderPostcardBackToCanvas(destination);
		expect(resolvedFromHost).toBe(true);
		const draws = fillText.mock.calls as [string, number, number][];
		const dateIndex = draws.findIndex(
			([text]) => text === formatVisitDate(destination.visitedDate),
		);
		const authorIndex = draws.findIndex(([text]) => text === AUTHOR.name);
		const message = draws.slice(dateIndex + 1, authorIndex);

		expect(canvas.width).toBe(1600);
		expect(canvas.height).toBe(1000);
		expect(message.map(([text]) => text).join(" ")).toBe(
			destination.description,
		);
		expect(message.length).toBeLessThanOrEqual(6);
		expect(
			translate.mock.calls.filter(([x, y]) => x === 40 && y >= 110 && y < 400),
		).toHaveLength(message.length);

		for (const [index, address] of [
			destination.name,
			destination.location,
			destination.country.toUpperCase(),
		].entries()) {
			const row = draws.filter(
				([, x, y]) =>
					x === 440 && y >= 230 + index * 60 && y < 290 + index * 60,
			);
			expect(row.map(([text]) => text).join(" ")).toBe(address);
			expect(row.length).toBeLessThanOrEqual(2);
		}
	}
	fontHost.remove();
});
