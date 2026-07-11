"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { GraphData } from "../types";

// Dynamically import ForceGraph2D with ssr: false to prevent canvas crashes on server rendering
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
			Initializing Graph Interface...
		</div>
	),
});

interface KnowledgeGraphProps {
	data: GraphData;
	activeSlug?: string;
}

export default function KnowledgeGraph({
	data,
	activeSlug,
}: KnowledgeGraphProps) {
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
	const fgRef = useRef<any>(null);

	// Responsively adapt graph canvas dimensions to parent container
	useEffect(() => {
		if (!containerRef.current) return;

		const handleResize = () => {
			if (containerRef.current) {
				setDimensions({
					width: containerRef.current.clientWidth,
					height: containerRef.current.clientHeight,
				});
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		// Zoom to fit nodes with a brief delay once rendering starts
		setTimeout(() => {
			if (fgRef.current) {
				fgRef.current.zoomToFit(400, 50);
			}
		}, 600);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// Recenter and focus graph when data or activeSlug shifts
	useEffect(() => {
		if (fgRef.current && activeSlug) {
			const node = data.nodes.find((n) => n.id === activeSlug) as any;
			if (node && node.x !== undefined && node.y !== undefined) {
				// Focus on active node
				fgRef.current.centerAt(node.x, node.y, 1000);
				fgRef.current.zoom(1.8, 1000);
			}
		}
	}, [activeSlug, data.nodes]);

	return (
		<div
			ref={containerRef}
			className="w-full h-full min-h-[300px] relative bg-slate-50 overflow-hidden"
		>
			<ForceGraph2D
				ref={fgRef}
				graphData={data}
				width={dimensions.width}
				height={dimensions.height}
				nodeLabel={(node: any) => node.title}
				linkColor={() => "#cbd5e1"} // slate-300
				linkWidth={1.5}
				onNodeClick={(node: any) => {
					router.push(`/brain/${node.id}`);
				}}
				nodeCanvasObject={(node: any, ctx, globalScale) => {
					const label = node.title;
					const radius = Math.sqrt(node.val || 1) * 3 + 2;
					const isActive = node.id === activeSlug;

					// Draw node circle
					ctx.beginPath();
					ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);

					// Draw glow effect for active node
					if (isActive) {
						ctx.shadowColor = "#10b981";
						ctx.shadowBlur = 12;
					}

					ctx.fillStyle = isActive ? "#10b981" : "#64748b"; // Emerald-500 for active, Slate-500 for others
					ctx.fill();
					ctx.shadowBlur = 0; // Reset shadow

					// Render label above nodes if zoomed in sufficiently
					if (globalScale > 0.6) {
						const fontSize = Math.max(11 / globalScale, 5);
						ctx.font = `${isActive ? "600" : "400"} ${fontSize}px Inter, system-ui, sans-serif`;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";

						// Render text backdrop/halo for readability
						ctx.strokeStyle = "#f8fafc"; // slate-50 background color
						ctx.lineWidth = 3 / globalScale;
						ctx.strokeText(label, node.x, node.y - radius - 5);

						ctx.fillStyle = isActive ? "#065f46" : "#334155"; // Dark emerald or slate-700
						ctx.fillText(label, node.x, node.y - radius - 5);
					}
				}}
			/>

			{/* Graph Legend overlay */}
			<div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 flex flex-col gap-1.5 pointer-events-none shadow-sm">
				<span className="font-semibold uppercase text-slate-600 tracking-wider">
					Knowledge Network
				</span>
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
					<span>Active Note</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="w-2.5 h-2.5 bg-slate-500 rounded-full inline-block" />
					<span>Linked Note</span>
				</div>
				<div className="text-[9px] text-slate-400 mt-0.5 italic">
					Scroll to zoom. Drag to pan. Click to navigate.
				</div>
			</div>
		</div>
	);
}
