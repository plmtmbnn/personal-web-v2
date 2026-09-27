"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(
	() => import("@/features/shared/components/CommandPalette"),
	{ ssr: false },
);

export default function CommandPaletteWrapper() {
	return <CommandPalette />;
}
