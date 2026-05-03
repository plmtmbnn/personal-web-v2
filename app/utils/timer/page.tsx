import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import TimerView from "./View";

export const metadata: Metadata = createMetadata({
	title: "HIIT Interval Timer",
	description:
		"Professional interval timer for HIIT, running, and workout sessions. Features customizable phases, wake-lock support, and audio cues.",
	path: "/utils/timer",
	keywords: [
		"Interval Timer",
		"HIIT Timer",
		"Running Timer",
		"Workout Timer",
		"Tabata Timer",
		"Fitness Tools",
	],
});

export default function TimerPage() {
	return <TimerView />;
}
