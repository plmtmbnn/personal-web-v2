"use server";

import { getInvestmentCompass } from "./actions";

export async function refreshInvestmentCompass() {
	return getInvestmentCompass(true);
}
