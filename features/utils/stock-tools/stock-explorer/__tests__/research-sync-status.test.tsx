import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ResearchSyncStatus } from "../components/dashboard/ResearchSyncStatus";

afterEach(() => vi.unstubAllGlobals());

describe("IDX research sync status", () => {
	it("prioritizes history coverage and separates the latest backfill result", async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				Response.json({
					status: {
						state: "ready",
						session: "2026-11-24",
						retrievedAt: "2026-11-24T13:00:39Z",
						covered: 142,
						universe: 945,
						rejected: 363,
						previouslyAttempted: 200,
						backfillBatch: 10,
						backfillFailures: 0,
					},
				}),
			)
			.mockResolvedValueOnce(Response.json({ status: { state: "busy" } }));
		vi.stubGlobal("fetch", fetcher);
		render(<ResearchSyncStatus />);

		const progress = await screen.findByRole("progressbar", {
			name: "Stocks with 260-session history coverage",
		});
		expect(progress.getAttribute("aria-valuenow")).toBe("142");
		expect(progress.getAttribute("aria-valuemax")).toBe("945");
		expect(screen.getByText("24 Nov 2026, 20:00 WIB")).toBeTruthy();
		expect(screen.getByText("200 symbols attempted")).toBeTruthy();
		expect(screen.getByText("Latest batch: 10 symbols, 0 failed")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Run research batch" }));
		await screen.findByText("A research batch is already running.");
		expect(screen.getByRole("button", { name: "Check status" })).toBeTruthy();
		expect(fetcher).toHaveBeenLastCalledWith(
			"/api/admin/idx-research",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("offers recovery after a status failure and explains a failed batch", async () => {
		const fetcher = vi
			.fn()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce(
				Response.json({
					status: {
						state: "waiting",
						reason: "A current, verified IDX close is unavailable.",
					},
				}),
			)
			.mockResolvedValueOnce(
				Response.json(
					{ status: { state: "error", reason: "Research sync failed." } },
					{ status: 503 },
				),
			);
		vi.stubGlobal("fetch", fetcher);
		render(<ResearchSyncStatus />);

		await screen.findByText(
			"Could not load research status. Retry to check the latest result.",
		);
		fireEvent.click(screen.getByRole("button", { name: "Check status" }));
		await screen.findByText("A current, verified IDX close is unavailable.");
		fireEvent.click(screen.getByRole("button", { name: "Run research batch" }));
		await screen.findByText("Research sync failed.");
		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: "Retry research batch" }),
			).toBeTruthy(),
		);
		expect(screen.queryByRole("progressbar")).toBeNull();
	});
});
