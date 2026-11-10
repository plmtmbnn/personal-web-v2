export type Destination = {
	id: string;
	name: string;
	location: string;
	country: string;
	type: "domestic" | "international";
	visitedDate: string; // Format: "YYYY-MM"
	imageUrl: string;
	description: string;
};
