"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Copy,
	Check,
	Braces,
	FileCode,
	Terminal,
	Database,
	ShieldCheck,
	Type,
	Trash2,
	Zap,
	AlertCircle,
	Code2,
} from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";

SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("javascript", javascript);

import {
	generateTS,
	generateGo,
	generateMongoose,
	generateZod,
	generateJoi,
} from "../utils/generators";

// ─── Main View ──────────────────────────────────────────────────────────────

type OutputFormat = "typescript" | "go" | "mongoose" | "zod" | "joi";

export default function JsonToSchemaView() {
	const reduceMotion = useReducedMotion();
	const [input, setInput] = useState("");
	const [rootName, setRootName] = useState("Generated");
	const [activeTab, setActiveTab] = useState<OutputFormat>("typescript");
	const [output, setOutput] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isCopied, setIsCopied] = useState(false);

	const transform = useCallback(() => {
		if (!input.trim()) {
			setOutput("");
			setError(null);
			return;
		}

		try {
			const parsed = JSON.parse(input);
			let result = "";

			switch (activeTab) {
				case "typescript":
					result = generateTS(parsed, rootName);
					break;
				case "go":
					result = generateGo(parsed, rootName);
					break;
				case "mongoose":
					result = generateMongoose(parsed, rootName);
					break;
				case "zod":
					result = generateZod(parsed, rootName);
					break;
				case "joi":
					result = generateJoi(parsed, rootName);
					break;
			}

			setOutput(result);
			setError(null);
		} catch (e) {
			setError((e as Error).message);
			setOutput("");
		}
	}, [input, activeTab, rootName]);

	useEffect(() => {
		transform();
	}, [transform]);

	const handleCopy = () => {
		if (!output) return;
		navigator.clipboard.writeText(output);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const handleBeautify = () => {
		try {
			const parsed = JSON.parse(input);
			setInput(JSON.stringify(parsed, null, 2));
		} catch (e) {
			setError((e as Error).message);
		}
	};

	const tabs: { id: OutputFormat; label: string; icon: any; lang: string }[] = [
		{
			id: "typescript",
			label: "TypeScript",
			icon: FileCode,
			lang: "typescript",
		},
		{ id: "go", label: "Go Struct", icon: Terminal, lang: "go" },
		{ id: "mongoose", label: "Mongoose", icon: Database, lang: "javascript" },
		{ id: "zod", label: "Zod", icon: ShieldCheck, lang: "typescript" },
		{ id: "joi", label: "Joi", icon: Zap, lang: "javascript" },
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
				<UtilHeader
					title="Schema Forge"
					description="Advanced JSON to Multi-Target converter (TypeScript, Go, Zod, Mongoose, Joi) with recursive parsing."
					category={{
						label: "Development & Code",
						sublabel: "json to schema converter",
						icon: Braces,
						color: "indigo",
					}}
					icon={Braces}
					actions={
						<div className="flex items-center gap-2.5">
							<div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
									Root:
								</span>
								<input
									type="text"
									value={rootName}
									onChange={(e) => setRootName(e.target.value)}
									className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none w-28"
									placeholder="Root Name"
								/>
							</div>
							<button
								type="button"
								onClick={handleBeautify}
								className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer active:scale-95"
							>
								<Code2 className="w-3.5 h-3.5 text-indigo-600" />
								<span>Beautify</span>
							</button>
							<button
								type="button"
								onClick={() => setInput("")}
								className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200/80 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-2xs transition-all cursor-pointer active:scale-95"
								title="Clear Input"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						</div>
					}
				/>

				{/* Workspace */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1 min-h-[650px]">
					{/* Input Module */}
					<div className="flex flex-col space-y-3">
						<div className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
							<Type className="w-4 h-4 text-indigo-600" /> JSON Payload
						</div>
						<div className="flex-1 relative bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Paste your JSON here..."
								className="w-full h-full min-h-[550px] p-6 sm:p-8 bg-transparent text-slate-900 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-400"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* Output Module */}
					<div className="flex flex-col space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
										activeTab === tab.id
											? "bg-slate-900 border-slate-900 text-white shadow-md"
											: "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 shadow-xs"
									}`}
								>
									<tab.icon className="w-4 h-4" />
									{tab.label}
								</button>
							))}
						</div>

						<div className="flex-1 relative bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
							<div className="absolute top-5 right-5 z-30">
								{output && (
									<button
										onClick={handleCopy}
										className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
											isCopied
												? "bg-emerald-600 text-white shadow-md"
												: "bg-slate-900 text-white hover:bg-slate-800 shadow-md"
										}`}
									>
										{isCopied ? (
											<Check className="w-4 h-4" />
										) : (
											<Copy className="w-4 h-4" />
										)}
										{isCopied ? "Copied" : "Copy Code"}
									</button>
								)}
							</div>

							<div className="flex-1 overflow-auto scrollbar-hide p-4">
								<AnimatePresence mode="wait">
									{error ? (
										<motion.div
											key="error"
											initial={reduceMotion ? false : { opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="h-full flex items-center justify-center p-12 text-center"
										>
											<div className="space-y-4">
												<AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
												<div className="space-y-2">
													<p className="text-slate-900 font-black uppercase tracking-widest text-xs">
														Parsing Error
													</p>
													<p className="text-slate-500 font-mono text-xs max-w-md">
														{error}
													</p>
												</div>
											</div>
										</motion.div>
									) : output ? (
										<motion.div
											key={activeTab}
											initial={reduceMotion ? false : { opacity: 0 }}
											animate={{ opacity: 1 }}
											className="h-full"
										>
											<SyntaxHighlighter
												language={tabs.find((t) => t.id === activeTab)?.lang}
												style={oneLight}
												customStyle={{
													background: "transparent",
													padding: "2rem",
													fontSize: "0.875rem",
													lineHeight: "1.7",
													margin: 0,
												}}
											>
												{output}
											</SyntaxHighlighter>
										</motion.div>
									) : (
										<div className="h-full flex items-center justify-center">
											<div className="text-center space-y-4 opacity-10">
												<Zap className="w-20 h-20 text-slate-900 mx-auto" />
												<p className="text-slate-900 font-black uppercase tracking-[0.5em] text-[10px]">
													Ready to Transform
												</p>
											</div>
										</div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
