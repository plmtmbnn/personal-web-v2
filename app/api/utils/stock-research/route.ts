import { z } from "zod";
import {
	readIdxResearch,
	readIdxOutcomes,
} from "@/services/market-data/idx-research-store";

const symbolSchema = z
	.string()
	.trim()
	.toUpperCase()
	.regex(/^[A-Z0-9]{1,10}$/);

export async function GET(request: Request) {
	const symbol = symbolSchema.safeParse(
		new URL(request.url).searchParams.get("symbol"),
	);
	if (!symbol.success)
		return Response.json({ error: "Invalid IDX symbol" }, { status: 400 });
	try {
		const [snapshot, outcomes] = await Promise.all([
			readIdxResearch(),
			readIdxOutcomes(),
		]);
		return Response.json(
			{
				session: snapshot?.session ?? null,
				version: snapshot?.version ?? null,
				evidence: snapshot?.results[symbol.data] ?? null,
				outcomes: outcomes.filter((outcome) => outcome.symbol === symbol.data),
			},
			{
				headers: {
					"Cache-Control": "public, max-age=60, stale-while-revalidate=300",
				},
			},
		);
	} catch (error) {
		console.error("[IDX Research] Cannot load cached evidence", error);
		return Response.json(
			{ error: "Research evidence is temporarily unavailable." },
			{ status: 503 },
		);
	}
}
