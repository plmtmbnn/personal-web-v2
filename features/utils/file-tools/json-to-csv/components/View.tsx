"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
	FileSpreadsheet,
	Upload,
	Copy,
	Check,
	Trash2,
	Table as TableIcon,
	FileText,
	Download,
	Settings2,
	Code2,
	CheckCircle2,
	AlertTriangle,
	Maximize2,
	Minimize2,
	Layers,
	GitBranch,
	X,
} from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import { convertJsonToCsv, type JsonToCsvResult } from "../utils/transform";

const SAMPLE_NESTED_JSON = JSON.stringify(
	{
		status: "success",
		apiVersion: "v2.5",
		organization: "Antigravity Systems",
		data: {
			audit: {
				region: "ID-JKT",
				environment: "production",
			},
			users: [
				{
					id: 101,
					name: "Polma Tambunan",
					username: "plmtmbnn",
					email: "polma@example.com",
					address: {
						street: "Sudirman Boulevard",
						suite: "Tower 2, Suite 400",
						city: "Jakarta",
						zipcode: "12190",
						geo: { lat: -6.2088, lng: 106.8456 },
					},
					company: {
						name: "Antigravity Engineering",
						department: "Distributed Systems",
					},
					roles: ["Staff Engineer", "Architect"],
					status: "active",
				},
				{
					id: 102,
					name: "Sarah Jenkins",
					username: "sjenkins",
					email: "sarah.j@example.com",
					address: {
						street: "742 Evergreen Terrace",
						suite: "Apt 4B",
						city: "Springfield",
						zipcode: "97477",
						geo: { lat: 44.0462, lng: -123.022 },
					},
					company: {
						name: "Springfield Media",
						department: "Content Operations",
					},
					roles: ["Product Manager"],
					status: "active",
				},
				{
					id: 103,
					name: "Kenji Sato",
					username: "ksato",
					email: "kenji.sato@example.jp",
					address: {
						street: "Shibuya Crossing 1-1",
						suite: "Floor 12",
						city: "Tokyo",
						zipcode: "150-0002",
						geo: { lat: 35.6595, lng: 139.7005 },
					},
					company: {
						name: "Rakuten Flow",
						department: "Security Intelligence",
					},
					roles: ["Security Lead"],
					status: "verified",
				},
				{
					id: 104,
					name: "Elena Rostova",
					username: "erostova",
					email: "elena@example.com",
					address: {
						street: "Nevsky Prospekt 28",
						suite: "Studio 3",
						city: "Saint Petersburg",
						zipcode: "191186",
						geo: { lat: 59.9343, lng: 30.3351 },
					},
					company: {
						name: "Aurora Analytics",
						department: "Data Engineering",
					},
					roles: ["Senior Data Analyst"],
					status: "active",
				},
				{
					id: 105,
					name: "Marcus Vance",
					username: "mvance",
					email: "marcus.v@example.com",
					address: {
						street: "Market Street 500",
						suite: "Floor 8",
						city: "San Francisco",
						zipcode: "94105",
						geo: { lat: 37.7897, lng: -122.4014 },
					},
					company: {
						name: "Bay Capital",
						department: "Quantitative Research",
					},
					roles: ["Quant Trader"],
					status: "active",
				},
				{
					id: 106,
					name: "Amina Al-Mansoor",
					username: "amina_m",
					email: "amina@example.ae",
					address: {
						street: "Sheikh Zayed Road",
						suite: "Level 42",
						city: "Dubai",
						zipcode: "00000",
						geo: { lat: 25.2048, lng: 55.2708 },
					},
					company: {
						name: "Emirates FinTech",
						department: "Blockchain Solutions",
					},
					roles: ["Protocol Engineer"],
					status: "active",
				},
				{
					id: 107,
					name: "Lucas Silva",
					username: "lsilva",
					email: "lucas.silva@example.br",
					address: {
						street: "Avenida Paulista 1578",
						suite: "Office 201",
						city: "Sao Paulo",
						zipcode: "01310-200",
						geo: { lat: -23.5615, lng: -46.6559 },
					},
					company: {
						name: "Paulista Pay",
						department: "Core Banking",
					},
					roles: ["Backend Specialist"],
					status: "active",
				},
				{
					id: 108,
					name: "Chloe Dubois",
					username: "cdubois",
					email: "chloe@example.fr",
					address: {
						street: "Rue de Rivoli 45",
						suite: "Batiment B",
						city: "Paris",
						zipcode: "75001",
						geo: { lat: 48.8566, lng: 2.3522 },
					},
					company: {
						name: "Lumiere Design",
						department: "Brand Experience",
					},
					roles: ["Creative Director"],
					status: "active",
				},
				{
					id: 109,
					name: "David Kim",
					username: "dkim",
					email: "david.kim@example.kr",
					address: {
						street: "Teheran-ro 152",
						suite: "Gangnam Tower 14F",
						city: "Seoul",
						zipcode: "06236",
						geo: { lat: 37.5008, lng: 127.0366 },
					},
					company: {
						name: "Nexus Gaming",
						department: "Multiplayer Infrastructure",
					},
					roles: ["DevOps Engineer"],
					status: "active",
				},
				{
					id: 110,
					name: "Freja Lindqvist",
					username: "flindqvist",
					email: "freja@example.se",
					address: {
						street: "Kungsgatan 12",
						suite: "Vaning 4",
						city: "Stockholm",
						zipcode: "111 35",
						geo: { lat: 59.3326, lng: 18.0649 },
					},
					company: {
						name: "Nordic Climate Tech",
						department: "Sustainability Metrics",
					},
					roles: ["Lead Scientist"],
					status: "verified",
				},
				{
					id: 111,
					name: "Tariq Bradley",
					username: "tbradley",
					email: "tariq@example.co.uk",
					address: {
						street: "Baker Street 221",
						suite: "Flat 2",
						city: "London",
						zipcode: "NW1 6XE",
						geo: { lat: 51.5237, lng: -0.1585 },
					},
					company: {
						name: "Thames Telemetry",
						department: "Edge Computing",
					},
					roles: ["Site Reliability Engineer"],
					status: "active",
				},
				{
					id: 112,
					name: "Zoe Chen",
					username: "zchen",
					email: "zoe.chen@example.sg",
					address: {
						street: "Marina Bay Link Mall",
						suite: "Tower 1, Level 28",
						city: "Singapore",
						zipcode: "018981",
						geo: { lat: 1.2801, lng: 103.8546 },
					},
					company: {
						name: "Lion City AI",
						department: "Machine Learning",
					},
					roles: ["ML Research Scientist"],
					status: "active",
				},
			],
		},
	},
	null,
	2,
);

export default function JsonToCsvView() {
	const [input, setInput] = useState("");
	const [delimiter, setDelimiter] = useState<string>(",");
	const [enableBom, setEnableBom] = useState<boolean>(true);
	const [forceQuotes, setForceQuotes] = useState<boolean>(false);
	const [selectedArrayPath, setSelectedArrayPath] = useState<string>("");
	const [mergeParentFields, setMergeParentFields] = useState<boolean>(false);
	const [excludedIndices, setExcludedIndices] = useState<number[]>([]);
	const [excludedColumns, setExcludedColumns] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState<"table" | "raw">("table");
	const [isCopied, setIsCopied] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>("converted-data");
	const [error, setError] = useState<string | null>(null);
	const [isInputCollapsed, setIsInputCollapsed] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Convert JSON on input or options change
	const conversionResult = useMemo<JsonToCsvResult | null>(() => {
		const trimmed = input.trim();
		if (!trimmed) {
			setError(null);
			return null;
		}

		try {
			const parsed = JSON.parse(trimmed);
			const result = convertJsonToCsv(parsed, {
				delimiter,
				bom: enableBom,
				quotes: forceQuotes,
				arrayPath: selectedArrayPath || undefined,
				mergeParentFields,
				excludedIndices,
				excludedColumns,
			});
			setError(null);
			return result;
		} catch (err) {
			setError((err as Error).message || "Invalid JSON syntax");
			return null;
		}
	}, [
		input,
		delimiter,
		enableBom,
		forceQuotes,
		selectedArrayPath,
		mergeParentFields,
		excludedIndices,
		excludedColumns,
	]);

	const handleLoadSample = useCallback(() => {
		setInput(SAMPLE_NESTED_JSON);
		setFileName("sample-users");
		setSelectedArrayPath("");
		setExcludedIndices([]);
		setExcludedColumns([]);
	}, []);

	const handleReset = useCallback(() => {
		setInput("");
		setError(null);
		setFileName("converted-data");
		setSelectedArrayPath("");
		setMergeParentFields(false);
		setExcludedIndices([]);
		setExcludedColumns([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const handleExcludeRow = useCallback((originalIndex: number) => {
		setExcludedIndices((prev) => [...prev, originalIndex]);
	}, []);

	const handleRestoreAll = useCallback(() => {
		setExcludedIndices([]);
	}, []);

	const handleExcludeColumn = useCallback((columnName: string) => {
		setExcludedColumns((prev) => [...prev, columnName]);
	}, []);

	const handleRestoreColumn = useCallback((columnName: string) => {
		setExcludedColumns((prev) => prev.filter((col) => col !== columnName));
	}, []);

	const handleRestoreAllColumns = useCallback(() => {
		setExcludedColumns([]);
	}, []);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const baseName = file.name.replace(/\.[^/.]+$/, "");
		if (baseName) {
			setFileName(baseName);
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const text = event.target?.result as string;
			setInput(text);
			setSelectedArrayPath("");
			setExcludedIndices([]);
			setExcludedColumns([]);
		};
		reader.readAsText(file);
	};

	const handleCopy = useCallback(() => {
		if (!conversionResult?.csv) return;
		navigator.clipboard.writeText(conversionResult.csv);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	}, [conversionResult]);

	const handleDownload = useCallback(() => {
		if (!conversionResult?.csv) return;
		const blob = new Blob([conversionResult.csv], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${fileName.trim() || "converted-data"}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}, [conversionResult, fileName]);

	const previewRows = useMemo(() => {
		if (!conversionResult) return [];
		return conversionResult.rows.slice(0, 10);
	}, [conversionResult]);

	const csvByteSize = useMemo(() => {
		if (!conversionResult?.csv) return 0;
		return new Blob([conversionResult.csv]).size;
	}, [conversionResult]);

	const hasParentFields = useMemo(() => {
		if (!conversionResult?.detectedPath) return false;
		return (
			conversionResult.detectedPath !== "root" &&
			conversionResult.detectedPath !== "root object" &&
			conversionResult.detectedPath !== "scalar"
		);
	}, [conversionResult]);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
				{/* ── Standard Floating Card Header ── */}
				<UtilHeader
					title="JSON to CSV Converter"
					description="Transform nested JSON objects and arrays into structured, downloadable CSV tables with smart outermost array detection and automatic dot notation flattening."
					category={{
						label: "Data & File Systems",
						sublabel: "nested object flattening & csv export",
						icon: FileSpreadsheet,
						color: "emerald",
					}}
					icon={FileSpreadsheet}
					actions={
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={handleLoadSample}
								className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs active:scale-95"
							>
								<Code2 className="w-3.5 h-3.5 text-emerald-600" />
								<span>Load Sample</span>
							</button>

							<button
								type="button"
								onClick={handleReset}
								className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-2xs active:scale-95"
							>
								<Trash2 className="w-3.5 h-3.5" />
								<span>Reset</span>
							</button>
						</div>
					}
				/>

				{/* ── Two-Column Layout ── */}
				<div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-stretch min-h-[720px]">
					{/* ── Left Column: Config & JSON Input ── */}
					<motion.div
						layout
						className={`flex flex-col space-y-5 transition-all duration-300 ${
							isInputCollapsed
								? "w-full xl:w-20"
								: "w-full xl:w-[42%] flex-shrink-0"
						}`}
					>
						<div className="flex items-center justify-between px-2 h-8">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<button
									type="button"
									onClick={() => setIsInputCollapsed(!isInputCollapsed)}
									className="p-1.5 hover:bg-slate-200/80 rounded-lg transition-colors text-slate-600 cursor-pointer"
									title={isInputCollapsed ? "Expand input" : "Collapse input"}
									aria-label="Toggle input panel"
								>
									{isInputCollapsed ? (
										<Maximize2 className="w-3.5 h-3.5" />
									) : (
										<Minimize2 className="w-3.5 h-3.5" />
									)}
								</button>
								{!isInputCollapsed && (
									<>
										<Settings2 className="w-3.5 h-3.5 flex-shrink-0" />
										<span>Source &amp; Options</span>
									</>
								)}
							</div>
						</div>

						{!isInputCollapsed ? (
							<div className="flex flex-col space-y-5 flex-1">
								{/* Options Floating Card */}
								<section className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-5">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label
												htmlFor="csv-delimiter-select"
												className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5"
											>
												Delimiter
											</label>
											<select
												id="csv-delimiter-select"
												value={delimiter}
												onChange={(e) => setDelimiter(e.target.value)}
												className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
											>
												<option value=",">Comma (,)</option>
												<option value=";">Semicolon (;)</option>
												<option value="&#9;">Tab (\t)</option>
												<option value="|">Pipe (|)</option>
											</select>
										</div>

										<div>
											<label
												htmlFor="csv-filename-input"
												className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5"
											>
												Export Filename
											</label>
											<input
												id="csv-filename-input"
												type="text"
												value={fileName}
												onChange={(e) => setFileName(e.target.value)}
												placeholder="converted-data"
												className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
											/>
										</div>
									</div>

									{/* Smart Array Source Selector (if multiple candidate arrays detected) */}
									{conversionResult &&
										conversionResult.candidatePaths.length > 0 && (
											<div className="pt-3 border-t border-slate-100 space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
														<GitBranch className="w-3 h-3 text-emerald-600" />
														<span>Target Data Array</span>
													</span>
													<span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 font-mono">
														{conversionResult.detectedPath}
													</span>
												</div>

												{conversionResult.candidatePaths.length > 1 && (
													<select
														value={
															selectedArrayPath || conversionResult.detectedPath
														}
														onChange={(e) =>
															setSelectedArrayPath(e.target.value)
														}
														className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
													>
														{conversionResult.candidatePaths.map((cand) => (
															<option key={cand.path} value={cand.path}>
																{cand.path} ({cand.count}{" "}
																{cand.isObjectArray ? "objects" : "items"})
															</option>
														))}
													</select>
												)}
											</div>
										)}

									<div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6">
										<label className="flex items-center gap-2.5 cursor-pointer select-none">
											<input
												type="checkbox"
												checked={enableBom}
												onChange={(e) => setEnableBom(e.target.checked)}
												className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
											/>
											<span className="text-xs font-bold text-slate-700">
												Excel UTF-8 BOM
											</span>
										</label>

										<label className="flex items-center gap-2.5 cursor-pointer select-none">
											<input
												type="checkbox"
												checked={forceQuotes}
												onChange={(e) => setForceQuotes(e.target.checked)}
												className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
											/>
											<span className="text-xs font-bold text-slate-700">
												Quote All Cells
											</span>
										</label>

										{hasParentFields && (
											<label className="flex items-center gap-2.5 cursor-pointer select-none">
												<input
													type="checkbox"
													checked={mergeParentFields}
													onChange={(e) =>
														setMergeParentFields(e.target.checked)
													}
													className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
												/>
												<span className="text-xs font-bold text-slate-700">
													Merge Parent Fields
												</span>
											</label>
										)}
									</div>
								</section>

								{/* JSON Source Textarea Floating Card */}
								<section className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 flex-1 flex flex-col">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
											<Upload className="w-3.5 h-3.5" /> Source JSON
										</div>
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
										>
											<Upload className="w-3 h-3" />
											<span>Upload .json</span>
										</button>
										<input
											type="file"
											ref={fileInputRef}
											onChange={handleFileUpload}
											accept=".json,.txt"
											className="hidden"
										/>
									</div>

									<div className="relative flex-1 flex flex-col min-h-[360px]">
										<textarea
											value={input}
											onChange={(e) => {
												setInput(e.target.value);
												setSelectedArrayPath("");
											}}
											placeholder={`Paste JSON array or object here...\n\n{\n  "response": {\n    "members": [\n      {\n        "id": 1,\n        "user": { "name": "Polma", "city": "Jakarta" },\n        "roles": ["staff", "lead"]\n      }\n    ]\n  }\n}`}
											className={`w-full flex-1 p-4 bg-slate-50/80 border rounded-2xl text-slate-900 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 transition-all resize-none ${
												error
													? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
													: "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
											}`}
											spellCheck={false}
										/>
									</div>

									{/* Status Footer */}
									<div className="flex items-center justify-between text-xs pt-1">
										{error ? (
											<div className="flex items-center gap-1.5 text-rose-600 font-semibold text-xs">
												<AlertTriangle className="w-3.5 h-3.5 shrink-0" />
												<span className="truncate max-w-[280px] sm:max-w-md">
													{error}
												</span>
											</div>
										) : conversionResult ? (
											<div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
												<CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
												<span>
													{conversionResult.totalRows}{" "}
													{conversionResult.totalRows === 1 ? "row" : "rows"}{" "}
													from {conversionResult.detectedPath}
												</span>
											</div>
										) : (
											<span className="text-slate-400 text-xs">
												Awaiting JSON input...
											</span>
										)}

										<span className="text-[11px] font-mono text-slate-400">
											{input.length.toLocaleString()} chars
										</span>
									</div>
								</section>
							</div>
						) : (
							<button
								type="button"
								className="flex-1 bg-white border border-slate-200/80 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors opacity-60 min-h-[500px]"
								onClick={() => setIsInputCollapsed(false)}
								aria-label="Expand JSON input"
							>
								<FileSpreadsheet className="w-6 h-6 text-slate-400" />
							</button>
						)}
					</motion.div>

					{/* ── Right Column: Output, Preview (Max 10) & Actions ── */}
					<motion.div layout className="flex-1 flex flex-col space-y-5 min-w-0">
						<div className="flex items-center justify-between px-2 h-8">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<TableIcon className="w-3.5 h-3.5" />
								<span>CSV Output &amp; Preview</span>
							</div>

							{conversionResult && (
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setActiveTab("table")}
										className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
											activeTab === "table"
												? "bg-slate-900 text-white shadow-2xs"
												: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
										}`}
									>
										<TableIcon className="w-3.5 h-3.5" />
										<span>Table (Max 10)</span>
									</button>

									<button
										type="button"
										onClick={() => setActiveTab("raw")}
										className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
											activeTab === "raw"
												? "bg-slate-900 text-white shadow-2xs"
												: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
										}`}
									>
										<FileText className="w-3.5 h-3.5" />
										<span>Raw CSV</span>
									</button>
								</div>
							)}
						</div>

						{conversionResult && conversionResult.totalRows > 0 ? (
							<div className="flex flex-col space-y-5 flex-1">
								{/* Telemetry Strip */}
								<div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between flex-wrap gap-4">
									<div className="flex items-center gap-5 sm:gap-7">
										<div>
											<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
												Total Rows
											</p>
											<p className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
												{conversionResult.totalRows.toLocaleString()}
											</p>
										</div>
										<div className="w-px h-8 bg-slate-100" />
										<div>
											<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
												Columns
											</p>
											<p className="text-lg sm:text-xl font-extrabold text-emerald-700 tabular-nums">
												{conversionResult.headers.length}
											</p>
										</div>
										<div className="w-px h-8 bg-slate-100" />
										<div>
											<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
												Est. Size
											</p>
											<p className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
												{(csvByteSize / 1024).toFixed(1)} KB
											</p>
										</div>
										<div className="w-px h-8 bg-slate-100 hidden sm:block" />
										<div className="hidden sm:block">
											<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
												Source
											</p>
											<p
												className="text-xs font-mono font-bold text-slate-700 truncate max-w-[140px]"
												title={conversionResult.detectedPath}
											>
												{conversionResult.detectedPath}
											</p>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex items-center gap-2.5">
										<button
											type="button"
											onClick={handleCopy}
											className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-95"
										>
											{isCopied ? (
												<>
													<Check className="w-3.5 h-3.5 text-emerald-600" />
													<span className="text-emerald-700">Copied!</span>
												</>
											) : (
												<>
													<Copy className="w-3.5 h-3.5 text-slate-500" />
													<span>Copy CSV</span>
												</>
											)}
										</button>

										<button
											type="button"
											onClick={handleDownload}
											className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95"
										>
											<Download className="w-3.5 h-3.5" />
											<span>Download CSV</span>
										</button>
									</div>
								</div>

								{/* Main Content Area */}
								<div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-5 sm:p-6 flex-1 flex flex-col min-h-[520px]">
									{activeTab === "table" ? (
										<div className="flex flex-col flex-1 space-y-4">
											<div className="flex flex-col gap-2 pb-2 border-b border-slate-100">
												<div className="flex items-center justify-between text-xs font-semibold text-slate-500 flex-wrap gap-2">
													<div className="flex items-center gap-2 flex-wrap">
														<span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[11px]">
															Preview Sample
														</span>
														<span>
															Showing max {previewRows.length} of{" "}
															{conversionResult.totalRows}{" "}
															{conversionResult.totalRows === 1
																? "row"
																: "rows"}
														</span>
														{excludedIndices.length > 0 && (
															<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 text-[11px] font-bold">
																<span>
																	{excludedIndices.length} rows excluded
																</span>
																<button
																	type="button"
																	onClick={handleRestoreAll}
																	className="underline hover:text-rose-900 cursor-pointer ml-1"
																>
																	Restore
																</button>
															</div>
														)}
														{excludedColumns.length > 0 && (
															<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-bold">
																<span>
																	{excludedColumns.length} cols excluded
																</span>
																<button
																	type="button"
																	onClick={handleRestoreAllColumns}
																	className="underline hover:text-amber-950 cursor-pointer ml-1"
																>
																	Restore all
																</button>
															</div>
														)}
													</div>
													<div className="flex items-center gap-2 text-[11px] text-slate-400">
														<Layers className="w-3.5 h-3.5 text-emerald-600" />
														<span>
															Array source:{" "}
															<span className="font-mono text-slate-700 font-bold">
																{conversionResult.detectedPath}
															</span>
														</span>
													</div>
												</div>

												{/* Excluded columns restore pills */}
												{excludedColumns.length > 0 && (
													<div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
														<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
															Excluded columns:
														</span>
														{excludedColumns.map((col) => (
															<button
																key={col}
																type="button"
																onClick={() => handleRestoreColumn(col)}
																title={`Click to restore ${col}`}
																className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-mono font-medium border border-slate-200/60 transition-colors cursor-pointer"
															>
																<span className="line-through">{col}</span>
																<span className="text-[11px] font-bold text-emerald-600">
																	+
																</span>
															</button>
														))}
													</div>
												)}
											</div>

											{/* Interactive Tabular Grid with defensive overflow containment */}
											<div className="flex-1 overflow-auto rounded-2xl border border-slate-200/80 max-h-[520px]">
												<table className="w-full text-left text-xs border-collapse">
													<thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-2xs">
														<tr>
															<th className="py-2.5 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-r border-slate-200/60 w-12 text-center">
																#
															</th>
															{conversionResult.headers.map((header) => (
																<th
																	key={header}
																	className="group py-2.5 px-3 text-[11px] font-black text-slate-700 tracking-tight whitespace-nowrap border-r border-slate-200/60"
																>
																	<div className="flex items-center justify-between gap-1.5">
																		<span className="truncate max-w-[180px]">
																			{header}
																		</span>
																		<button
																			type="button"
																			onClick={() =>
																				handleExcludeColumn(header)
																			}
																			title={`Exclude column "${header}"`}
																			aria-label={`Exclude column ${header}`}
																			className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shrink-0"
																		>
																			<X className="w-3 h-3" />
																		</button>
																	</div>
																</th>
															))}
															<th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 w-14 text-center">
																Action
															</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-slate-100 font-mono text-[11px]">
														{previewRows.map((row, rowIndex) => (
															<tr
																key={`row-${rowIndex}`}
																className="hover:bg-slate-50/80 transition-colors"
															>
																<td className="py-2.5 px-3 text-center text-slate-400 border-r border-slate-100 font-bold select-none">
																	{rowIndex + 1}
																</td>
																{conversionResult.headers.map((header) => {
																	const val = row[header];
																	const displayVal =
																		val === "" || val === undefined
																			? "-"
																			: String(val);
																	return (
																		<td
																			key={`cell-${rowIndex}-${header}`}
																			className="py-2.5 px-3.5 text-slate-700 whitespace-nowrap max-w-[240px] truncate border-r border-slate-100"
																			title={String(val ?? "")}
																		>
																			{displayVal}
																		</td>
																	);
																})}
																<td className="py-2 px-2 text-center">
																	<button
																		type="button"
																		onClick={() =>
																			handleExcludeRow(
																				conversionResult.rowIndices[rowIndex],
																			)
																		}
																		title="Exclude this row from CSV"
																		aria-label={`Exclude row ${rowIndex + 1}`}
																		className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
																	>
																		<Trash2 className="w-3.5 h-3.5 mx-auto" />
																	</button>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									) : (
										/* Raw CSV View */
										<div className="flex flex-col flex-1 space-y-3">
											<div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
												<span className="font-semibold">
													Generated CSV Output
												</span>
												<span className="font-mono text-[11px] text-slate-400">
													{conversionResult.csv.split("\n").length} lines
												</span>
											</div>
											<div className="flex-1 overflow-auto bg-slate-900 rounded-2xl p-4 text-emerald-400 font-mono text-xs leading-relaxed max-h-[520px]">
												<pre className="whitespace-pre">
													{conversionResult.csv}
												</pre>
											</div>
										</div>
									)}
								</div>
							</div>
						) : (
							/* Empty Placeholder State */
							<div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-8 sm:p-12 flex-1 flex flex-col items-center justify-center text-center space-y-4 min-h-[520px]">
								<div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400">
									<FileSpreadsheet className="w-7 h-7" />
								</div>
								<div className="space-y-1.5 max-w-sm">
									<h2 className="text-base font-extrabold text-slate-900">
										No CSV generated yet
									</h2>
									<p className="text-xs text-slate-500 leading-relaxed">
										Paste your JSON or upload a file. Outermost nested arrays
										are automatically discovered and flattened with dot
										notation.
									</p>
								</div>
								<button
									type="button"
									onClick={handleLoadSample}
									className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
								>
									<Code2 className="w-3.5 h-3.5" />
									<span>Try with Nested JSON Sample</span>
								</button>
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</main>
	);
}
