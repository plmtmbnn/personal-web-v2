"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileSpreadsheet,
	Upload,
	Copy,
	Check,
	Trash2,
	Table as TableIcon,
	FileCode,
	AlertCircle,
	ArrowLeft,
	Settings2,
	Download,
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";

// ─── Logic ────────────────────────────────────────────────────────────────

/**
 * Sets a value in a nested object using dot notation
 * e.g. setDeep(obj, 'user.name', 'Polma')
 */
const setDeep = (obj: any, path: string, value: any) => {
	const keys = path.split(".");
	let current = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!current[key]) current[key] = {};
		current = current[key];
	}
	current[keys[keys.length - 1]] = value;
};

/**
 * Transforms flat objects into nested objects based on dot notation keys
 */
const transformToNested = (data: any[]) => {
	return data.map((row) => {
		const newRow: any = {};
		for (const [key, value] of Object.entries(row)) {
			if (key.includes(".")) {
				setDeep(newRow, key, value);
			} else {
				newRow[key] = value;
			}
		}
		return newRow;
	});
};

// ─── Components ─────────────────────────────────────────────────────────────

export default function CsvToJsonView() {
	const [input, setInput] = useState("");
	const [parsedData, setParsedData] = useState<any[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [delimiter, setDelimiter] = useState<string>(""); // empty string = auto-detect
	const [hasHeaders, setHeaderRow] = useState(true);
	const [isNested, setIsNested] = useState(true);
	const [isCopied, setIsCopied] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ─── Handlers ─────────────────────────────────────────────────────────────

	const processCsv = useCallback(
		(csvString: string) => {
			if (!csvString.trim()) {
				setParsedData(null);
				setError(null);
				return;
			}

			Papa.parse(csvString, {
				header: hasHeaders,
				delimiter: delimiter,
				skipEmptyLines: true,
				transformHeader: (header) => header.trim(),
				complete: (results) => {
					if (results.errors.length > 0) {
						setError(results.errors[0].message);
						setParsedData(null);
					} else {
						let data = results.data as any[];
						if (isNested && hasHeaders) {
							data = transformToNested(data);
						}
						setParsedData(data);
						setError(null);
					}
				},
				error: (err: any) => {
					setError(err.message);
					setParsedData(null);
				},
			});
		},
		[hasHeaders, delimiter, isNested],
	);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const text = event.target?.result as string;
			setInput(text);
			processCsv(text);
		};
		reader.readAsText(file);
	};

	const _handleBeautify = () => processCsv(input);

	const handleReset = () => {
		setInput("");
		setParsedData(null);
		setError(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleCopy = () => {
		if (!parsedData) return;
		const json = JSON.stringify(parsedData, null, 2);
		navigator.clipboard.writeText(json);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleDownload = () => {
		if (!parsedData) return;
		const json = JSON.stringify(parsedData, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "converted-data.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 pb-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
					<div className="space-y-6">
						<Link
							href="/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Back to Utilities
						</Link>
						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-90 transition-transform">
								<FileSpreadsheet className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									CSV to <span className="text-emerald-600">JSON</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Advanced Parsing & Object Nesting
								</p>
							</div>
						</div>
					</div>

					<button
						onClick={handleReset}
						className="self-start flex items-center gap-2.5 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
					>
						<Trash2 className="w-4 h-4" /> Clear All
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
					{/* ─── Column 1: Configuration & Input ─── */}
					<div className="lg:col-span-5 space-y-6 sm:space-y-8">
						<section className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-8">
							{/* Config Module */}
							<div className="space-y-6">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
										<Settings2 className="w-4 h-4" />
									</div>
									<h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
										Parser Config
									</h2>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="block cursor-pointer">
											<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-2">
												Separator
											</span>
											<select
												value={delimiter}
												onChange={(e) => setDelimiter(e.target.value)}
												className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
											>
												<option value="">Auto-Detect</option>
												<option value=",">Comma (,)</option>
												<option value=";">Semicolon (;)</option>
												<option value="	">Tab ( \t )</option>
											</select>
										</label>
									</div>

									<div className="flex flex-col justify-center gap-3">
										<label className="flex items-center gap-3 cursor-pointer group">
											<input
												type="checkbox"
												checked={hasHeaders}
												onChange={(e) => setHeaderRow(e.target.checked)}
												className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
											/>
											<span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-600 transition-colors">
												Header Row
											</span>
										</label>
										<label className="flex items-center gap-3 cursor-pointer group">
											<input
												type="checkbox"
												checked={isNested}
												onChange={(e) => setIsNested(e.target.checked)}
												className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
											/>
											<span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-600 transition-colors">
												Key Splitter (.)
											</span>
										</label>
									</div>
								</div>
							</div>

							<div className="h-px bg-slate-100" />

							{/* Input Area */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
										<Upload className="w-3.5 h-3.5" /> Source CSV
									</div>
									<button
										onClick={() => fileInputRef.current?.click()}
										className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
									>
										Upload File
									</button>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleFileUpload}
										accept=".csv,.txt"
										className="hidden"
									/>
								</div>
								<div className="relative group">
									<textarea
										value={input}
										onChange={(e) => {
											setInput(e.target.value);
											processCsv(e.target.value);
										}}
										placeholder="Paste CSV data here...&#10;name,email,address.city&#10;Polma,plmt@me.com,Jakarta"
										className="w-full h-full min-h-[300px] p-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 font-mono text-xs leading-relaxed focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all resize-none"
										spellCheck={false}
									/>
								</div>
							</div>
						</section>

						{/* Preview Table */}
						<AnimatePresence>
							{parsedData && parsedData.length > 0 && (
								<motion.section
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									className="p-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-4 overflow-hidden"
								>
									<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
										<TableIcon className="w-3.5 h-3.5" /> Data Preview (First 3)
									</div>
									<div className="overflow-x-auto">
										<table className="w-full text-left text-[10px] font-bold">
											<thead>
												<tr className="border-b border-slate-100">
													{Object.keys(
														Papa.parse(input, {
															header: true,
															delimiter: delimiter,
															transformHeader: (h) => h.trim(),
														}).data[0] || {},
													).map((k) => (
														<th
															key={k}
															className="py-2 px-3 text-slate-400 uppercase tracking-tighter"
														>
															{k}
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{Papa.parse(input, {
													header: true,
													delimiter: delimiter,
													skipEmptyLines: true,
													transformHeader: (h) => h.trim(),
												})
													.data.slice(0, 3)
													.map((row: any, i) => (
														<tr
															/* biome-ignore lint/suspicious/noArrayIndexKey: Static preview */
															key={`row-${i}`}
															className="border-b border-slate-50 last:border-0"
														>
															{Object.values(row).map((val: any, j) => (
																<td
																	/* biome-ignore lint/suspicious/noArrayIndexKey: Static preview */
																	key={`cell-${j}`}
																	className="py-3 px-3 text-slate-600 truncate max-w-[120px]"
																>
																	{String(val)}
																</td>
															))}
														</tr>
													))}
											</tbody>
										</table>
									</div>
								</motion.section>
							)}
						</AnimatePresence>
					</div>

					{/* ─── Column 2: Result ─── */}
					<div className="lg:col-span-7 flex flex-col space-y-4">
						<div className="flex items-center justify-between px-3">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
								<FileCode className="w-3.5 h-3.5" /> Resulting JSON
							</div>
							<div className="flex items-center gap-3">
								{parsedData && (
									<>
										<button
											onClick={handleDownload}
											className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-blue-600 transition-colors"
										>
											<Download className="w-3 h-3" /> Download
										</button>
										<button
											onClick={handleCopy}
											className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
												isCopied
													? "bg-emerald-600 text-white"
													: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
											}`}
										>
											{isCopied ? (
												<>
													<Check className="w-3 h-3" /> Copied!
												</>
											) : (
												<>
													<Copy className="w-3 h-3" /> Copy Output
												</>
											)}
										</button>
									</>
								)}
							</div>
						</div>

						<div className="flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
							<AnimatePresence mode="wait">
								{error ? (
									<motion.div
										key="error"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="absolute inset-0 z-20 flex items-center justify-center p-12 text-center"
									>
										<div className="space-y-4">
											<div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
												<AlertCircle className="w-8 h-8" />
											</div>
											<div className="space-y-1">
												<p className="text-slate-900 font-black uppercase tracking-widest text-xs">
													Parsing Error
												</p>
												<p className="text-rose-600 text-[10px] font-mono leading-relaxed bg-rose-50/50 p-4 rounded-xl border border-rose-100">
													{error}
												</p>
											</div>
										</div>
									</motion.div>
								) : parsedData ? (
									<motion.div
										key="output"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="h-full"
									>
										<pre className="w-full h-full p-8 font-mono text-xs sm:text-sm leading-relaxed text-blue-600 overflow-auto scrollbar-hide select-all">
											{JSON.stringify(parsedData, null, 2)}
										</pre>
									</motion.div>
								) : (
									<div className="h-full flex items-center justify-center pointer-events-none">
										<div className="text-center space-y-4 opacity-[0.03]">
											<FileSpreadsheet className="w-32 h-32 mx-auto" />
											<p className="font-black uppercase tracking-[1em] text-sm">
												Awaiting Input
											</p>
										</div>
									</div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
