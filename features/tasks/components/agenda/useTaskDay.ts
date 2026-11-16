"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJakartaDateString, jakartaMidnight, nextDate } from "../../dates";

export function useTaskDay() {
	const [day, setDay] = useState(getJakartaDateString);
	const router = useRouter();
	useEffect(() => {
		const refresh = () => {
			const next = getJakartaDateString();
			if (next !== day) {
				setDay(next);
				router.refresh();
			}
		};
		const timer = setTimeout(
			refresh,
			Math.max(0, Date.parse(jakartaMidnight(nextDate(day))) - Date.now()) + 50,
		);
		window.addEventListener("focus", refresh);
		document.addEventListener("visibilitychange", refresh);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("focus", refresh);
			document.removeEventListener("visibilitychange", refresh);
		};
	}, [day, router]);
	return day;
}
