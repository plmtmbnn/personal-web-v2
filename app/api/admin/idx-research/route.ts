import { checkAdmin } from "@/features/auth/actions";
import { redis } from "@/lib/core/redis";
import {
	idxResearchStatusKey,
	idxResearchLockKey,
	syncIdxResearch,
} from "@/services/market-data/idx-research-store";

export const maxDuration = 180;

export async function GET() {
	if (!(await checkAdmin()))
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	const [status, running] = await Promise.all([
		redis.get(idxResearchStatusKey).catch(() => null),
		redis.exists(idxResearchLockKey).catch(() => 0),
	]);
	return Response.json({ status: running ? { state: "busy" } : status });
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
