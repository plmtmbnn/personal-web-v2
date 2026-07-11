export interface BrainNote {
	slug: string;
	title: string;
	content: string;
	tags: string[];
	createdAt: string;
	backlinks: { slug: string; title: string }[];
	rawContent: string;
}

export interface GraphNode {
	id: string;
	title: string;
	val: number; // size multiplier for the node
}

export interface GraphLink {
	source: string;
	target: string;
}

export interface GraphData {
	nodes: GraphNode[];
	links: GraphLink[];
}
