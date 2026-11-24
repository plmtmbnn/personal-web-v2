import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CustomModal from "../components/CustomModal";

describe("CustomModal keyboard access", () => {
	it("focuses the dialog, contains Tab navigation, and restores focus", async () => {
		const onClose = vi.fn();
		const { rerender } = render(
			<>
				<button type="button">Open modal</button>
				<CustomModal
					isOpen={false}
					onClose={onClose}
					title="Confirm"
					onConfirm={vi.fn()}
				/>
			</>,
		);
		const opener = screen.getByRole("button", { name: "Open modal" });
		opener.focus();
		rerender(
			<>
				<button type="button">Open modal</button>
				<CustomModal
					isOpen
					onClose={onClose}
					title="Confirm"
					onConfirm={vi.fn()}
				/>
			</>,
		);
		expect(
			screen
				.getByRole("dialog", { name: "Confirm" })
				.getAttribute("aria-modal"),
		).toBe("true");
		await waitFor(() =>
			expect(document.activeElement).toBe(
				screen.getByRole("button", { name: "Cancel" }),
			),
		);
		fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
		expect(document.activeElement).toBe(
			screen.getByRole("button", { name: "Confirm" }),
		);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onClose).toHaveBeenCalledOnce();
		rerender(
			<>
				<button type="button">Open modal</button>
				<CustomModal
					isOpen={false}
					onClose={onClose}
					title="Confirm"
					onConfirm={vi.fn()}
				/>
			</>,
		);
		expect(document.activeElement).toBe(opener);
	});
});
