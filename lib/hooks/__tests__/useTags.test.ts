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

	it("adds a new tag on Enter key", () => {
		const { result } = renderHook(() => useTags());
		act(() => {
			result.current.setTagInput("new-task");
		});
		act(() => {
			const mockEvent = {
				key: "Enter",
				nativeEvent: { isComposing: false },
				preventDefault: () => {},
			} as React.KeyboardEvent<HTMLInputElement>;
			result.current.handleTagKeyDown(mockEvent);
		});
		expect(result.current.tags).toContain("new-task");
		expect(result.current.tagInput).toBe("");
	});

	it.each([
		{ isComposing: true, keyCode: 13 },
		{ isComposing: false, keyCode: 229 },
	])(
		"keeps an unfinished IME tag on Enter ($keyCode)",
		({ isComposing, keyCode }) => {
			const { result } = renderHook(() => useTags());
			act(() => result.current.setTagInput("unfinished"));
			act(() => {
				result.current.handleTagKeyDown({
					key: "Enter",
					nativeEvent: { isComposing },
					keyCode,
					preventDefault: () => {},
				} as React.KeyboardEvent<HTMLInputElement>);
			});
			expect(result.current.tags).toEqual([]);
			expect(result.current.tagInput).toBe("unfinished");
		},
	);
});
