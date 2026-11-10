import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DestinationCard from "../DestinationCard";
import type { Destination } from "../../types";

const mockDestination: Destination = {
	id: "2",
	name: "Bali",
	location: "Canggu & Ubud",
	country: "Indonesia",
	type: "domestic",
	visitedDate: "2019-12",
	imageUrl: "https://example.com/bali.jpg",
	description:
		"Slow mornings along the Canggu coast followed by a few quiet days up in Ubud.",
};

describe("DestinationCard Component", () => {
	it("renders postal field-log card with country, formatted date, and postcard action", () => {
		const handleSelect = vi.fn();
		render(
			<DestinationCard
				destination={mockDestination}
				index={0}
				onSelect={handleSelect}
			/>,
		);

		expect(screen.getByText("Bali")).toBeDefined();
		expect(screen.getByText("Indonesia")).toBeDefined();
		expect(screen.getByText("Domestic")).toBeDefined();
		expect(screen.getByText("Dec 2019")).toBeDefined();
		expect(screen.getByText("Open Postcard")).toBeDefined();

		const card = screen.getByRole("button", {
			name: /Open 3D postcard for Bali/i,
		});
		fireEvent.click(card);
		expect(handleSelect).toHaveBeenCalledWith(mockDestination);
	});

	it("activates onSelect via keyboard Enter or Space", () => {
		const handleSelect = vi.fn();
		render(
			<DestinationCard
				destination={mockDestination}
				index={0}
				onSelect={handleSelect}
			/>,
		);

		const card = screen.getByRole("button", {
			name: /Open 3D postcard for Bali/i,
		});
		fireEvent.keyDown(card, { key: "Enter" });
		expect(handleSelect).toHaveBeenCalledTimes(1);

		fireEvent.keyDown(card, { key: " " });
		expect(handleSelect).toHaveBeenCalledTimes(2);
	});
});
