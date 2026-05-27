import type { Destination } from "./types";

export const destinations: Destination[] = [
	{
		id: "1",
		name: "Lake Toba",
		location: "North Sumatra",
		country: "Indonesia",
		type: "domestic",
		isVisited: true,
		visitedDate: "2024-03",
		imageUrl:
			"https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=2072&auto=format&fit=crop",
		description:
			"The largest volcanic lake in the world, a serene escape with rich Batak culture.",
	},
	{
		id: "2",
		name: "Wat Arun",
		location: "Bangkok",
		country: "Thailand",
		type: "international",
		isVisited: true,
		visitedDate: "2023-11",
		imageUrl:
			"https://images.unsplash.com/photo-1528181304800-2f1738b24a60?q=80&w=2070&auto=format&fit=crop",
		description:
			"The Temple of Dawn, an architectural masterpiece on the west bank of Chao Phraya.",
	},
	{
		id: "3",
		name: "Kyoto Temples",
		location: "Kyoto",
		country: "Japan",
		type: "international",
		isVisited: false,
		imageUrl:
			"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
		description:
			"Dreaming of the peaceful Zen gardens and historic shrines during autumn.",
	},
	{
		id: "4",
		name: "Labuan Bajo",
		location: "East Nusa Tenggara",
		country: "Indonesia",
		type: "domestic",
		isVisited: false,
		imageUrl:
			"https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop",
		description:
			"Gate to Komodo National Park, featuring pink beaches and prehistoric lizards.",
	},
];
