import { checkAdmin } from "@/features/auth/actions";
import { syncIdxStockSummary } from "@/services/market-data/idx-flows";

export async function POST() {
	if (!(await checkAdmin()))
		return Response.json({ error: "Unauthorized" }, { status: 401 });

	const result = await syncIdxStockSummary(true);
	return Response.json(result, { status: result.success ? 200 : 503 });
}
