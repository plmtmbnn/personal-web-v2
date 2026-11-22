import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLiverpoolFixtures } from "../actions";
import type { LfcFixture } from "../types";
import LiverpoolView from "../components/View";
import NextMatchHero from "../components/NextMatchHero";

vi.mock("../actions", () => ({ getLiverpoolFixtures: vi.fn() }));

const fixture: LfcFixture = {
	id: "match-1",
	title: "Liverpool vs Fulham",
	date: "2030-11-22T12:00:00Z",
	stadium: "Anfield",
	homeTeam: "Liverpool",
	awayTeam: "Fulham",
	competition: "Premier League",
	isHome: true,
};

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.clearAllMocks();
});

describe("Liverpool matchday states", () => {
	it("replaces the countdown without claiming the match is live", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2030-11-22T11:59:59Z"));
		render(<NextMatchHero fixture={fixture} />);
		expect(screen.getByText("Time until kickoff")).toBeTruthy();
		act(() => vi.advanceTimersByTime(2000));
		expect(screen.getByText(/Kickoff passed/)).toBeTruthy();
		expect(screen.queryByText(/In Progress/)).toBeNull();
		expect(
			screen.queryByRole("link", { name: "Add to Google Calendar" }),
		).toBeNull();
	});

	it("shows an undated fixture without a calendar action", () => {
		render(<NextMatchHero fixture={{ ...fixture, date: "" }} />);
		expect(screen.getByText("Kickoff to be confirmed")).toBeTruthy();
		expect(screen.queryByText("Time until kickoff")).toBeNull();
		expect(
			screen.queryByRole("link", { name: "Add to Google Calendar" }),
		).toBeNull();
	});

	it("keeps the last fixture visible when refresh fails", async () => {
		vi.mocked(getLiverpoolFixtures).mockResolvedValue({
			upcoming: [],
			lastUpdated: "2030-11-22T10:00:00Z",
			error: "API unavailable",
		});
		render(
			<LiverpoolView
				initialData={{
					upcoming: [fixture],
					lastUpdated: "2030-11-22T10:00:00Z",
				}}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
		expect(await screen.findByRole("alert")).toBeTruthy();
		expect(screen.getByText("Fulham")).toBeTruthy();
		expect(getLiverpoolFixtures).toHaveBeenCalledWith(true);
	});
});
