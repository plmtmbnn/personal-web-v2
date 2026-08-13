import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import SpinnerWheelView from "@/features/utils/fun-tools/spinner-wheel/components/View";

export const metadata: Metadata = createMetadata({
	title: "Spinner Wheel - Random Decision & Name Picker",
	description:
		"Interactive random spinner wheel for selecting names, making decisions, and picking random items with custom themes and sound effects.",
	path: "/utils/spinner-wheel",
	keywords: [
		"Spinner Wheel",
		"Random Name Picker",
		"Decision Wheel",
		"Wheel of Fortune",
		"Random Selector",
		"Team Lunch Picker",
		"Developer Tools",
	],
});

export default function SpinnerWheelPage() {
	return <SpinnerWheelView />;
}
