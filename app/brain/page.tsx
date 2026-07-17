import { getNotes, getGraphData } from "@/features/brain/actions";
import KnowledgeGraph from "@/features/brain/components/KnowledgeGraph";
import { Network, FileText, Tag, Link2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function BrainPage() {
	const notes = await getNotes();
	const graphData = await getGraphData();

	// Calculate statistics
	const totalNotes = notes.length;
	const totalConnections = graphData.links.length;
	const totalTags = new Set(notes.flatMap((n) => n.tags)).size;

	// Get top most connected notes
	const topConnected = [...notes]
		.sort((a, b) => b.backlinks.length - a.backlinks.length)
		.slice(0, 3)
		.filter((n) => n.backlinks.length > 0);

	return (
		<div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
			{/* Top Header Grid */}
			<div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between flex-shrink-0 gap-3">
				<div>
					<h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
						<Network className="w-5 h-5 text-emerald-500" />
						<span>Knowledge Graph Vault</span>
					</h1>
					<p className="text-xs text-slate-400 mt-0.5">
						A visualization of linked ideas, notes, and references.
					</p>
				</div>

				{/* Quick Stats */}
				<div className="flex gap-4 text-xs font-medium text-slate-500">
					<div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
						<FileText className="w-3.5 h-3.5 text-slate-400" />
						<span>{totalNotes} Notes</span>
					</div>
					<div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
						<Link2 className="w-3.5 h-3.5 text-slate-400" />
						<span>{totalConnections} Links</span>
					</div>
					<div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
						<Tag className="w-3.5 h-3.5 text-slate-400" />
						<span>{totalTags} Tags</span>
					</div>
				</div>
			</div>

			{/* Main Split Layout */}
			<div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
				{/* Visual Knowledge Graph */}
				<div className="flex-[3] relative border-b lg:border-b-0 lg:border-r border-slate-100 h-1/2 lg:h-full">
					<KnowledgeGraph data={graphData} />
				</div>

				{/* Side Overview / Dashboard */}
				<div className="flex-[2] overflow-y-auto p-6 flex flex-col gap-6 h-1/2 lg:h-full bg-slate-50/50">
					{/* Welcome Widget */}
					<div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
						<h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">
							Vault Overview
						</h2>
						<p className="text-sm text-slate-500 leading-relaxed">
							Welcome to your personal Second Brain. This workspace leverages
							bi-directional linking (Obsidian style) to help connect disjointed
							thoughts. Select any note from the sidebar or click on nodes in
							the network to inspect content.
						</p>
					</div>

					{/* Top Nodes */}
					{topConnected.length > 0 && (
						<div className="flex flex-col gap-2.5">
							<h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
								Most Connected Hubs
							</h3>
							<div className="flex flex-col gap-2">
								{topConnected.map((node) => (
									<Link
										key={node.slug}
										href={`/brain/${node.slug}`}
										className="bg-white hover:bg-emerald-50/10 border border-slate-100 hover:border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all group"
									>
										<div className="flex flex-col gap-0.5">
											<span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
												{node.title}
											</span>
											<span className="text-[10px] text-slate-400">
												Linked by {node.backlinks.length} notes
											</span>
										</div>
										<ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Recent Notes */}
					<div className="flex flex-col gap-2.5">
						<h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
							Recently Added Note
						</h3>
						{notes.length === 0 ? (
							<div className="bg-white border border-slate-100 rounded-xl p-6 text-center text-sm text-slate-400">
								No notes created yet. Click the "+" button in the sidebar to
								write one.
							</div>
						) : (
							<Link
								href={`/brain/${notes[0].slug}`}
								className="bg-white hover:bg-emerald-50/10 border border-slate-100 hover:border-emerald-100 rounded-xl p-4 flex flex-col gap-2 shadow-sm transition-all group"
							>
								<div className="flex justify-between items-start">
									<span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
										{notes[0].title}
									</span>
									<span className="text-[10px] text-slate-400">
										{notes[0].createdAt}
									</span>
								</div>
								<p className="text-xs text-slate-500 line-clamp-2">
									{notes[0].content.replace(/[#*`_[\]]/g, "")}
								</p>
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
