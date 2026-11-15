import { checkAdmin } from "@/features/auth/actions";
import { redis } from "@/lib/core/redis";
import {
	idxResearchStatusKey,
	syncIdxResearch,
} from "@/services/market-data/idx-research-store";

export const maxDuration = 180;

export async function GET() {
	if (!(await checkAdmin()))
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	const status = await redis.get(idxResearchStatusKey).catch(() => null);
	return Response.json({ status });
}

export async function POST() {
	if (!(await checkAdmin()))
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	const status = await syncIdxResearch();
	return Response.json(
		{ status },
		{ status: status.state === "error" ? 503 : 200 },
	);
}
