/**
 * Custom hook for managing tags in forms and components.
 * Prevents duplicate tag logic across TaskItem, TaskForm, and other components.
 */
import { useState, useCallback } from "react";

export function useTags(initialTags: string[] = []) {
	const [tags, setTags] = useState<string[]>(initialTags);
	const [tagInput, setTagInput] = useState("");

	const handleTagKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
				e.preventDefault();
				const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
				if (!tags.includes(newTag)) {
					setTags((prev) => [...prev, newTag]);
				}
				setTagInput("");
			} else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
				setTags((prev) => prev.slice(0, -1));
			}
		},
		[tagInput, tags],
	);

	const removeTag = useCallback(
		(tag: string) => {
			setTags((prev) => prev.filter((t) => t !== tag));
		},
		[tags],
	);

	return {
		tags,
		tagInput,
		setTagInput,
		handleTagKeyDown,
		removeTag,
		setTags,
	};
}
