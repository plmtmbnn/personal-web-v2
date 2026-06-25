"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
	ArrowLeft,
	Zap,
	AlertCircle,
	Code2,
} from "lucide-react";
import Link from "next/link";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";

SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("javascript", javascript);

// ─── Utility Logic ─────────────────────────────────────────────────────────

const toPascalCase = (str: string) =>
	str
		.replace(/(_\w)/g, (m) => m[1].toUpperCase())
		.replace(/^./, (m) => m.toUpperCase())
		.replace(/[^a-zA-Z0-9]/g, "");

const toCamelCase = (str: string) =>
	str
		.replace(/(_\w)/g, (m) => m[1].toUpperCase())
		.replace(/^./, (m) => m.toLowerCase())
		.replace(/[^a-zA-Z0-9]/g, "");

const getType = (val: any) => {
	if (val === null) return "null";
	if (Array.isArray(val)) return "array";
	return typeof val;
};

// ─── Generators ────────────────────────────────────────────────────────────

const generateTS = (obj: any, name: string): string => {
	const interfaces: string[] = [];

	const walk = (data: any, rootName: string): string => {
		const type = getType(data);
		if (type === "object") {
			const keys = Object.keys(data);
			const fields = keys
				.map((key) => {
					const valType = walk(data[key], toPascalCase(key));
					return `  ${key}: ${valType};`;
				})
				.join("\n");
			const interfaceName = toPascalCase(rootName);
			interfaces.push(`export interface ${interfaceName} {\n${fields}\n}`);
			return interfaceName;
		}
		if (type === "array") {
			if (data.length === 0) return "any[]";
			const itemType = walk(data[0], rootName);
			return `${itemType}[]`;
		}
		return type;
	};

	walk(obj, name);
	return interfaces.reverse().join("\n\n");
};

const generateGo = (obj: any, name: string): string => {
	const structs: string[] = [];

	const walk = (data: any, rootName: string): string => {
		const type = getType(data);
		if (type === "object") {
			const keys = Object.keys(data);
			const fields = keys
				.map((key) => {
					const valType = walk(data[key], toPascalCase(key));
					const goName = toPascalCase(key);
					return `\t${goName} ${valType} \`json:"${key}"\``;
				})
				.join("\n");
			const structName = toPascalCase(rootName);
			structs.push(`type ${structName} struct {\n${fields}\n}`);
			return structName;
		}
		if (type === "array") {
			if (data.length === 0) return "[]interface{}";
			const itemType = walk(data[0], rootName);
			return `[]${itemType}`;
		}
		if (type === "string") return "string";
		if (type === "number") return "float64";
		if (type === "boolean") return "bool";
		return "interface{}";
	};

	walk(obj, name);
	return structs.reverse().join("\n\n");
};

const generateMongoose = (obj: any, name: string): string => {
	const walk = (data: any): string => {
		const type = getType(data);
		if (type === "object") {
			const fields = Object.keys(data)
				.map((key) => `  ${key}: ${walk(data[key])}`)
				.join(",\n");
			return `{\n${fields}\n}`;
		}
		if (type === "array") {
			if (data.length === 0) return "[Schema.Types.Mixed]";
			return `[${walk(data[0])}]`;
		}
		if (type === "string") return "String";
		if (type === "number") return "Number";
		if (type === "boolean") return "Boolean";
		return "Schema.Types.Mixed";
	};

	return `const ${toPascalCase(name)}Schema = new Schema(${walk(obj)});`;
};

const generateZod = (obj: any, name: string): string => {
	const walk = (data: any): string => {
		const type = getType(data);
		if (type === "object") {
			const fields = Object.keys(data)
				.map((key) => `  ${key}: ${walk(data[key])}`)
				.join(",\n");
			return `z.object({\n${fields}\n})`;
		}
		if (type === "array") {
			if (data.length === 0) return "z.array(z.any())";
			return `z.array(${walk(data[0])})`;
		}
		if (type === "string") return "z.string()";
		if (type === "number") return "z.number()";
		if (type === "boolean") return "z.boolean()";
		return "z.any()";
	};

	return `const ${toCamelCase(name)}Schema = ${walk(obj)};`;
};

const generateJoi = (obj: any, name: string): string => {
	const walk = (data: any): string => {
		const type = getType(data);
		if (type === "object") {
			const fields = Object.keys(data)
				.map((key) => `  ${key}: ${walk(data[key])}`)
				.join(",\n");
			return `Joi.object({\n${fields}\n})`;
		}
		if (type === "array") {
			if (data.length === 0) return "Joi.array()";
			return `Joi.array().items(${walk(data[0])})`;
		}
		if (type === "string") return "Joi.string()";
		if (type === "number") return "Joi.number()";
		if (type === "boolean") return "Joi.boolean()";
		return "Joi.any()";
	};

	return `const ${toCamelCase(name)}Schema = ${walk(obj)};`;
};

// ─── Main View ──────────────────────────────────────────────────────────────

type OutputFormat = "typescript" | "go" | "mongoose" | "zod" | "joi";

export default function JsonToSchemaView() {
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
		<main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 pb-20">
			<div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-10 sm:pt-16 relative z-10">
				{/* Header */}
				<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10 sm:mb-14">
					<div className="space-y-6">
						<Link
							href="/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Operational Utilities
						</Link>
						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-90 transition-transform">
								<Braces className="w-7 h-7 sm:w-8 sm:h-8" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-none">
									Schema <span className="text-blue-600">Forge</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Advanced JSON to Multi-Target Converter
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex flex-col gap-1.5">
							<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
								Root Identifier
							</span>
							<input
								type="text"
								value={rootName}
								onChange={(e) => setRootName(e.target.value)}
								className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-48"
								placeholder="Root Name"
							/>
						</div>
						<button
							onClick={handleBeautify}
							className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm mt-5"
						>
							<Code2 className="w-4 h-4" /> Beautify
						</button>
						<button
							onClick={() => setInput("")}
							className="flex items-center justify-center w-14 h-14 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 shadow-sm mt-5"
						>
							<Trash2 className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Workspace */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1 min-h-[700px]">
					{/* Input Module */}
					<div className="flex flex-col space-y-4">
						<div className="flex items-center gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
							<Type className="w-3.5 h-3.5" /> JSON Payload
						</div>
						<div className="flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Paste your JSON here..."
								className="w-full h-full min-h-[600px] p-8 bg-transparent text-slate-900 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-200 scrollbar-hide"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* Output Module */}
					<div className="flex flex-col space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${
										activeTab === tab.id
											? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
											: "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
									}`}
								>
									<tab.icon className="w-4 h-4" />
									{tab.label}
								</button>
							))}
						</div>

						<div className="flex-1 relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
							<div className="absolute top-6 right-6 z-30">
								{output && (
									<button
										onClick={handleCopy}
										className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
											isCopied
												? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
												: "bg-slate-900 text-white hover:bg-slate-800"
										}`}
									>
										{isCopied ? (
											<Check className="w-3.5 h-3.5" />
										) : (
											<Copy className="w-3.5 h-3.5" />
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
											initial={{ opacity: 0, y: 10 }}
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
											initial={{ opacity: 0 }}
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
