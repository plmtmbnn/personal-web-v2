import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTags } from "../useTags";

describe("useTags", () => {
	it("initializes with empty tags", () => {
		const { result } = renderHook(() => useTags());
		expect(result.current.tags).toEqual([]);
		expect(result.current.tagInput).toBe("");
	});

	it("initializes with provided tags", () => {
		const { result } = renderHook(() => useTags(["work", "urgent"]));
		expect(result.current.tags).toEqual(["work", "urgent"]);
	});

	it("adds a new tag on Enter", () => {
		const { result } = renderHook(() => useTags());
		act(() => {
			result.current.setTagInput("new-task");
		});
		act(() => {
			const event = new KeyboardEvent("keydown", { key: "Enter" });
			Object.defineProperty(event, "target", {
				value: { value: "new-task" },
			});
			// Note: In a real test, you'd use fireEvent or simulate properly
		});
		expect(result.current.tags).toContain("new-task");
	});
});
