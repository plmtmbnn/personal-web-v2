import { useMemo } from "react";
import { destinations } from "../data";

const useDestinations = () => {
	const visitedDestinations = useMemo(
		() =>
			destinations
				.filter((d) => d.isVisited)
				.sort((a, b) => {
					const dateA = a.visitedDate || "0000-00";
					const dateB = b.visitedDate || "0000-00";
					return dateB.localeCompare(dateA);
				}),
		[],
	);

	const wishlistDestinations = useMemo(
		() => destinations.filter((d) => !d.isVisited),
		[],
	);

	return { visitedDestinations, wishlistDestinations };
};

export default useDestinations;
