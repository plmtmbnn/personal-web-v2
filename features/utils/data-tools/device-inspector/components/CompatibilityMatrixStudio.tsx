"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Layers, Zap, Search, CheckCircle2, XCircle } from "lucide-react";
import type { CodecItem, WebApiItem } from "../types";

interface CompatibilityMatrixStudioProps {
	codecs: CodecItem[];
	webApis: WebApiItem[];
	reduceMotion?: boolean | null;
}

export default function CompatibilityMatrixStudio({
	codecs,
	webApis,
	reduceMotion,
}: CompatibilityMatrixStudioProps) {
	// Active sub-view toggle: codecs vs web apis
	const [activeSubTab, setActiveSubTab] = useState<"codecs" | "apis">("codecs");

	// Codec filtering state
	const [codecSearch, setCodecSearch] = useState("");
	const [codecFilter, setCodecFilter] = useState<
		"all" | "video" | "audio" | "supported"
	>("all");

	// Web API filtering state
	const [apiSearch, setApiSearch] = useState("");
	const [apiCategoryFilter, setApiCategoryFilter] = useState<string>("all");

	// Filtered Codecs
	const filteredCodecs = useMemo(() => {
		return codecs.filter((codec) => {
			const matchesSearch =
				codec.name.toLowerCase().includes(codecSearch.toLowerCase()) ||
				codec.mimeType.toLowerCase().includes(codecSearch.toLowerCase());

			if (!matchesSearch) return false;

			if (codecFilter === "video") return codec.type === "video";
			if (codecFilter === "audio") return codec.type === "audio";
			if (codecFilter === "supported") return codec.isSupported;
			return true;
		});
	}, [codecs, codecSearch, codecFilter]);

	const supportedCodecsCount = codecs.filter((c) => c.isSupported).length;

	// Categories list for Web APIs
	const apiCategories = useMemo(() => {
		const cats = Array.from(new Set(webApis.map((a) => a.category)));
		return ["all", ...cats];
	}, [webApis]);

	// Filtered Web APIs
	const filteredApis = useMemo(() => {
		return webApis.filter((api) => {
			const matchesSearch =
				api.name.toLowerCase().includes(apiSearch.toLowerCase()) ||
				api.desc.toLowerCase().includes(apiSearch.toLowerCase()) ||
				api.category.toLowerCase().includes(apiSearch.toLowerCase());

			if (!matchesSearch) return false;

			if (apiCategoryFilter !== "all") {
				return api.category.toLowerCase() === apiCategoryFilter.toLowerCase();
			}
			return true;
		});
	}, [webApis, apiSearch, apiCategoryFilter]);

	const supportedApisCount = webApis.filter((a) => a.isSupported).length;

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 sm:space-y-7"
		>
			{/* ── Sub-Tab Switcher ── */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
							{activeSubTab === "codecs" ? (
								<Layers className="w-4 h-4 text-indigo-600" />
							) : (
								<Zap className="w-4 h-4 text-indigo-600" />
							)}
						</div>
						<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
							{activeSubTab === "codecs"
								? "Media Codec Decoding Matrix"
								: "Browser Web Platform API Audit"}
						</h2>
					</div>
					<p className="text-xs text-slate-500 font-medium">
						{activeSubTab === "codecs"
							? "Hardware-accelerated and software audio/video format compatibility inspection."
							: "Modern HTML5, WebRTC, WebGPU, and client-side operating APIs support check."}
					</p>
				</div>

				{/* Segmented Selector */}
				<div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 self-start sm:self-auto shrink-0">
					<button
						type="button"
						onClick={() => setActiveSubTab("codecs")}
						className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
							activeSubTab === "codecs"
								? "bg-white text-slate-900 shadow-2xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Layers className="w-3.5 h-3.5 text-indigo-600" />
						<span>
							Media Codecs ({supportedCodecsCount}/{codecs.length})
						</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveSubTab("apis")}
						className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
							activeSubTab === "apis"
								? "bg-white text-slate-900 shadow-2xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Zap className="w-3.5 h-3.5 text-indigo-600" />
						<span>
							Web Platform APIs ({supportedApisCount}/{webApis.length})
						</span>
					</button>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════════════════════════ */}
			{/* VIEW 1: MEDIA CODECS                                                */}
			{/* ═══════════════════════════════════════════════════════════════════ */}
			{activeSubTab === "codecs" && (
				<div className="space-y-4">
					{/* Toolbar: Search & Filter Chips */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div className="relative flex-1 max-w-md">
							<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
							<input
								type="text"
								value={codecSearch}
								onChange={(e) => setCodecSearch(e.target.value)}
								placeholder="Search codec by name or mime type (e.g. av1, webm, aac)..."
								className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
							/>
						</div>

						{/* Filter Pills */}
						<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
							{(
								[
									{ id: "all", label: "All Formats" },
									{ id: "video", label: "Video Only" },
									{ id: "audio", label: "Audio Only" },
									{ id: "supported", label: "Supported Only" },
								] as const
							).map((pill) => (
								<button
									key={pill.id}
									type="button"
									onClick={() => setCodecFilter(pill.id)}
									className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
										codecFilter === pill.id
											? "bg-slate-900 text-white shadow-2xs"
											: "bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-600"
									}`}
								>
									{pill.label}
								</button>
							))}
						</div>
					</div>

					{/* Codecs Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{filteredCodecs.map((codec) => (
							<div
								key={codec.name}
								className={`p-4 rounded-2xl border space-y-2.5 flex flex-col justify-between transition-all ${
									codec.isSupported
										? "bg-white border-slate-200/80 shadow-2xs"
										: "bg-slate-50/60 border-slate-200/60 opacity-60"
								}`}
							>
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
											{codec.type} Codec
										</span>
										<span
											className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
												codec.isSupported
													? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
													: "bg-slate-100 text-slate-400 border border-slate-200"
											}`}
										>
											{codec.isSupported ? (
												<CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
											) : (
												<XCircle className="w-3 h-3 text-slate-400 shrink-0" />
											)}
											<span>
												{codec.isSupported ? "Supported" : "Unsupported"}
											</span>
										</span>
									</div>

									<h4 className="text-xs font-bold text-slate-900 truncate">
										{codec.name}
									</h4>
								</div>

								<div className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[9px] text-slate-500 truncate">
									{codec.mimeType}
								</div>
							</div>
						))}

						{filteredCodecs.length === 0 && (
							<div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium">
								No codecs matching &quot;{codecSearch}&quot; with filter &quot;
								{codecFilter}&quot;.
							</div>
						)}
					</div>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════════ */}
			{/* VIEW 2: MODERN WEB PLATFORM APIS                                    */}
			{/* ═══════════════════════════════════════════════════════════════════ */}
			{activeSubTab === "apis" && (
				<div className="space-y-4">
					{/* Toolbar: Search & Category Filter */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div className="relative flex-1 max-w-md">
							<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
							<input
								type="text"
								value={apiSearch}
								onChange={(e) => setApiSearch(e.target.value)}
								placeholder="Search API by name or description (e.g. wasm, audio, gpu)..."
								className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
							/>
						</div>

						{/* Categories Chips */}
						<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
							{apiCategories.map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setApiCategoryFilter(cat)}
									className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 capitalize ${
										apiCategoryFilter === cat
											? "bg-slate-900 text-white shadow-2xs"
											: "bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-600"
									}`}
								>
									{cat === "all" ? "All Categories" : cat}
								</button>
							))}
						</div>
					</div>

					{/* Web APIs Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{filteredApis.map((api) => (
							<div
								key={api.name}
								className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between transition-all ${
									api.isSupported
										? "bg-white border-slate-200/80 shadow-2xs"
										: "bg-rose-50/20 border-rose-200/50 opacity-80"
								}`}
							>
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
											{api.category}
										</span>
										<span
											className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
												api.isSupported
													? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
													: "bg-rose-50 text-rose-700 border border-rose-200/80"
											}`}
										>
											{api.isSupported ? (
												<CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
											) : (
												<XCircle className="w-3 h-3 text-rose-500 shrink-0" />
											)}
											<span>
												{api.isSupported ? "Available" : "Unavailable"}
											</span>
										</span>
									</div>

									<h4 className="text-xs font-bold text-slate-900">
										{api.name}
									</h4>
								</div>

								<p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
									{api.desc}
								</p>
							</div>
						))}

						{filteredApis.length === 0 && (
							<div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium">
								No APIs matching &quot;{apiSearch}&quot; in category &quot;
								{apiCategoryFilter}&quot;.
							</div>
						)}
					</div>
				</div>
			)}
		</motion.div>
	);
}
