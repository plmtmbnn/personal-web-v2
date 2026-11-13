"use server";

import * as actions from "./stockpicks";

export async function fetchCloudStockPicksAction(
	...args: Parameters<typeof actions.fetchCloudStockPicksAction>
) {
	return actions.fetchCloudStockPicksAction(...args);
}

export async function saveCloudStockPickAction(
	...args: Parameters<typeof actions.saveCloudStockPickAction>
) {
	return actions.saveCloudStockPickAction(...args);
}

export async function closeCloudStockPickAction(
	...args: Parameters<typeof actions.closeCloudStockPickAction>
) {
	return actions.closeCloudStockPickAction(...args);
}

export async function deleteCloudStockPickAction(
	...args: Parameters<typeof actions.deleteCloudStockPickAction>
) {
	return actions.deleteCloudStockPickAction(...args);
}

export async function syncCloudWatermarksAction(
	...args: Parameters<typeof actions.syncCloudWatermarksAction>
) {
	return actions.syncCloudWatermarksAction(...args);
}
