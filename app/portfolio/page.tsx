import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import PortfolioView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Project Portfolio",
	description:
		"A comprehensive look at high-impact systems I've architected, focused on fintech core operations (LOS & LMS) and scalable platforms.",
	path: "/portfolio",
	keywords: [
		"Fintech Portfolio",
		"Loan Origination System",
		"Loan Management System",
		"eKYC",
		"InsurTech",
		"Software Architecture",
	],
});

export default function PortfolioPage() {
	return <PortfolioView />;
}
