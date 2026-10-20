import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DestinationCard from "../DestinationCard";
import type { Destination } from "../../types";

const mockVisitedDestination: Destination = {
	id: "2",
	name: "Bali",
	location: "Bali Province",
	country: "Indonesia",
	type: "domestic",
	isVisited: true,
	visitedDate: "2019-12",
	imageUrl: "https://example.com/bali.jpg",
	description: "The Island of Gods.",
};

const mockWishlistDestination: Destination = {
	id: "17",
	name: "Chamonix-Mont-Blanc",
	location: "Chamonix, Mont Blanc",
	country: "France",
	type: "international",
	isVisited: false,
	imageUrl: "https://example.com/chamonix.jpg",
	description: "The ultimate trail running bucket list destination.",
};

describe("DestinationCard Component", () => {
	it("renders visited destination card with postcard action", () => {
		const handleSelect = vi.fn();
		render(
			<DestinationCard
				destination={mockVisitedDestination}
				index={0}
				onSelect={handleSelect}
			/>,
		);

		expect(screen.getByText("Bali")).toBeDefined();
		expect(screen.getByText("Visited")).toBeDefined();
		expect(screen.getByText("Postcard")).toBeDefined();

		const card = screen.getByRole("button", {
			name: /View postcard for Bali/i,
		});
		fireEvent.click(card);
		expect(handleSelect).toHaveBeenCalledWith(mockVisitedDestination);
	});

	it("renders classified teaser card for On the Radar destination without leaking details", () => {
		render(<DestinationCard destination={mockWishlistDestination} index={0} />);

		expect(screen.getByText("On the Radar")).toBeDefined();
		expect(screen.getByText("Classified")).toBeDefined();
		expect(screen.getByText(/Coordinates: \[REDACTED\]/i)).toBeDefined();
		expect(screen.getByText("In Active Planning")).toBeDefined();
		expect(screen.getByText("Locked")).toBeDefined();
		expect(screen.getByText("EXP-01")).toBeDefined();
		// Destination name should not be leaked in the card heading
		expect(screen.queryByText("Chamonix-Mont-Blanc")).toBeNull();
	});
});
