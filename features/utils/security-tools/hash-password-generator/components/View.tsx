"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	ShieldCheck,
	KeyRound,
	Hash,
	Binary,
	Copy,
	Check,
	RefreshCw,
	Sliders,
	Lock,
	Zap,
	FileText,
	Upload,
	CheckCircle2,
	XCircle,
	ArrowRightLeft,
	Layers,
	Eye,
	EyeOff,
} from "lucide-react";
import type {
	EncodingAction,
	EncodingFormat,
	HashAlgorithm,
	HashOutputFormat,
	PasswordMode,
	PasswordOptions,
} from "../types";
import {
	calculatePasswordStrength,
	generateSecurePassword,
} from "../utils/password";
import { computeHash } from "../utils/hashing";
import { transformSecurityText } from "../utils/formatter";

type ActiveTab = "password" | "hasher" | "formatter";

const ALL_HASH_ALGORITHMS: HashAlgorithm[] = [
	"SHA-256",
	"SHA-512",
	"SHA-384",
	"SHA-1",
	"MD5",
];

const ENCODING_FORMATS: Array<{
	id: EncodingFormat;
	label: string;
	desc: string;
}> = [
	{ id: "base64", label: "Base64", desc: "Standard RFC 4648 binary-to-text" },
	{
		id: "base64url",
		label: "Base64URL",
		desc: "URL & JWT safe Base64 encoding",
	},
	{
		id: "hex",
		label: "Hex Byte Stream",
		desc: "Hexadecimal byte representation",
	},
	{
		id: "url",
		label: "URL Component",
		desc: "URI percent-encoding for queries",
	},
	{
		id: "html",
		label: "HTML Entities",
		desc: "Safe character escaping for HTML",
	},
	{
		id: "rot13",
		label: "ROT13 Cipher",
		desc: "Classical 13-letter shift cipher",
	},
];

export default function HashPasswordGeneratorView() {
	const reduceMotion = useReducedMotion();
	const [activeTab, setActiveTab] = useState<ActiveTab>("password");
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ─── TAB 1: Password Studio State ─────────────────────────────────────────
	const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
		mode: "custom",
		length: 18,
		includeUppercase: true,
		includeLowercase: true,
		includeNumbers: true,
		includeSymbols: true,
		avoidAmbiguous: true,
		wordCount: 4,
		separator: "-",
		capitalizeWords: true,
		includeNumberInPassphrase: true,
	});

	const [generatedPassword, setGeneratedPassword] = useState("");
	const [isPasswordCopied, setIsPasswordCopied] = useState(false);
	const [showPassword, setShowPassword] = useState(true);
	const [batchCount, setBatchCount] = useState<number>(5);
	const [batchPasswords, setBatchPasswords] = useState<string[]>([]);
	const [isBatchCopied, setIsBatchCopied] = useState(false);

	const handleRegeneratePassword = useCallback(() => {
		const newPass = generateSecurePassword(passwordOptions);
		setGeneratedPassword(newPass);
	}, [passwordOptions]);

	useEffect(() => {
		handleRegeneratePassword();
	}, [handleRegeneratePassword]);

	const strength = calculatePasswordStrength(generatedPassword);

	const handleCopyPassword = () => {
		if (!generatedPassword) return;
		navigator.clipboard.writeText(generatedPassword);
		setIsPasswordCopied(true);
		setTimeout(() => setIsPasswordCopied(false), 2000);
	};

	const handleGenerateBatch = () => {
		const list: string[] = [];
		for (let i = 0; i < batchCount; i++) {
			list.push(generateSecurePassword(passwordOptions));
		}
		setBatchPasswords(list);
	};

	const handleCopyBatch = () => {
		if (batchPasswords.length === 0) return;
		navigator.clipboard.writeText(batchPasswords.join("\n"));
		setIsBatchCopied(true);
		setTimeout(() => setIsBatchCopied(false), 2000);
	};

	// ─── TAB 2: Hasher State ──────────────────────────────────────────────────
	const [hashInputMode, setHashInputMode] = useState<"text" | "file">("text");
	const [hashTextInput, setHashTextInput] = useState("Hello, World!");
	const [hashFileName, setHashFileName] = useState("");
	const [hashFileBuffer, setHashFileBuffer] = useState<ArrayBuffer | null>(
		null,
	);
	const [selectedAlgorithm, setSelectedAlgorithm] =
		useState<HashAlgorithm>("SHA-256");
	const [hashOutputFormat, setHashOutputFormat] =
		useState<HashOutputFormat>("hex-lower");
	const [enableHmac, setEnableHmac] = useState(false);
	const [hmacSecret, setHmacSecret] = useState("");
	const [expectedChecksum, setExpectedChecksum] = useState("");
	const [computedHash, setComputedHash] = useState("");
	const [hashExecutionTime, setHashExecutionTime] = useState<number>(0);
	const [isHashCopied, setIsHashCopied] = useState(false);
	const [multiHashes, setMultiHashes] = useState<Record<string, string>>({});
	const [isDraggingFile, setIsDraggingFile] = useState(false);

	// Compute Hashes
	useEffect(() => {
		let isCancelled = false;

		async function runHash() {
			const source =
				hashInputMode === "file" && hashFileBuffer
					? hashFileBuffer
					: hashTextInput;

			try {
				const result = await computeHash(
					source,
					selectedAlgorithm,
					enableHmac ? hmacSecret : "",
					hashOutputFormat,
					expectedChecksum,
				);

				if (!isCancelled) {
					setComputedHash(result.hash);
					setHashExecutionTime(result.executionTimeMs);
				}

				// Compute quick overview for multi-algorithms
				if (!enableHmac) {
					const allResults: Record<string, string> = {};
					for (const algo of ALL_HASH_ALGORITHMS) {
						const res = await computeHash(source, algo, "", hashOutputFormat);
						allResults[algo] = res.hash;
					}
					if (!isCancelled) {
						setMultiHashes(allResults);
					}
				}
			} catch {
				if (!isCancelled) {
					setComputedHash("");
				}
			}
		}

		runHash();

		return () => {
			isCancelled = true;
		};
	}, [
		hashInputMode,
		hashTextInput,
		hashFileBuffer,
		selectedAlgorithm,
		hashOutputFormat,
		enableHmac,
		hmacSecret,
		expectedChecksum,
	]);

	const handleFileUpload = (files: FileList | null) => {
		if (!files || files.length === 0) return;
		const file = files[0];
		if (!file) return;
		setHashFileName(file.name);
		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result instanceof ArrayBuffer) {
				setHashFileBuffer(e.target.result);
			}
		};
		reader.readAsArrayBuffer(file);
	};

	const handleCopyHash = (text: string) => {
		navigator.clipboard.writeText(text);
		setIsHashCopied(true);
		setTimeout(() => setIsHashCopied(false), 2000);
	};

	// ─── TAB 3: Formatter State ───────────────────────────────────────────────
	const [formatterAction, setFormatterAction] =
		useState<EncodingAction>("encode");
	const [formatterFormat, setFormatterFormat] =
		useState<EncodingFormat>("base64");
	const [formatterInput, setFormatterInput] = useState(
		"Security is not a product, but a process.",
	);
	const [formatterOutput, setFormatterOutput] = useState("");
	const [formatterError, setFormatterError] = useState<string | null>(null);
	const [isFormatterCopied, setIsFormatterCopied] = useState(false);

	useEffect(() => {
		try {
			const res = transformSecurityText(
				formatterInput,
				formatterFormat,
				formatterAction,
			);
			setFormatterOutput(res);
			setFormatterError(null);
		} catch (err) {
			setFormatterOutput("");
			setFormatterError(
				err instanceof Error ? err.message : "Encoding failed.",
			);
		}
	}, [formatterInput, formatterFormat, formatterAction]);

	const handleSwapFormatter = () => {
		if (!formatterOutput) return;
		setFormatterInput(formatterOutput);
		setFormatterAction((prev) => (prev === "encode" ? "decode" : "encode"));
	};

	const handleCopyFormatter = () => {
		if (!formatterOutput) return;
		navigator.clipboard.writeText(formatterOutput);
		setIsFormatterCopied(true);
		setTimeout(() => setIsFormatterCopied(false), 2000);
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1400px] mx-auto space-y-8">
				{/* Top Breadcrumb & Zero-Server Badge */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
				>
					<Link
						href="/utils"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Utilities
					</Link>
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-600 shadow-2xs">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						CSPRNG • Web Crypto API • 100% In-Browser
					</div>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
				>
					<div className="space-y-3">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
								<ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									Security, Hash &{" "}
									<span className="text-indigo-600">Password Studio</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Cryptographic password generator, multi-algorithm hasher with
									file checksum verification, and two-way security text
									formatting.
								</p>
							</div>
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="flex items-center p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs gap-1">
						<button
							type="button"
							onClick={() => setActiveTab("password")}
							className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
								activeTab === "password"
									? "bg-slate-900 text-white shadow-sm"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
							}`}
						>
							<KeyRound className="w-4 h-4" />
							<span>Password Studio</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("hasher")}
							className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
								activeTab === "hasher"
									? "bg-slate-900 text-white shadow-sm"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
							}`}
						>
							<Hash className="w-4 h-4" />
							<span>Crypto Hasher</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("formatter")}
							className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
								activeTab === "formatter"
									? "bg-slate-900 text-white shadow-sm"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
							}`}
						>
							<Binary className="w-4 h-4" />
							<span>Formatter & Encoder</span>
						</button>
					</div>
				</motion.div>

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* TAB 1: PASSWORD STUDIO                                             */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				{activeTab === "password" && (
					<motion.div
						key="password-tab"
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Main Generated Password Banner Card */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
									<Lock className="w-4 h-4 text-indigo-600" />
									<span>Generated Secure Credential</span>
								</div>
								<div className="flex items-center gap-2">
									<span
										className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
											strength.level === "very-strong"
												? "bg-indigo-50 text-indigo-700 border-indigo-200"
												: strength.level === "strong"
													? "bg-emerald-50 text-emerald-700 border-emerald-200"
													: strength.level === "fair"
														? "bg-amber-50 text-amber-700 border-amber-200"
														: "bg-rose-50 text-rose-700 border-rose-200"
										}`}
									>
										{strength.label} ({strength.entropyBits} bits)
									</span>
								</div>
							</div>

							{/* Output Password Area */}
							<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-slate-50 border border-slate-200/80 rounded-2xl">
								<span className="font-mono text-base sm:text-2xl font-extrabold text-slate-900 tracking-wide break-all select-all flex-1">
									{showPassword ? generatedPassword : "••••••••••••••••••••"}
								</span>
								<div className="flex items-center gap-2 shrink-0">
									<button
										type="button"
										onClick={() => setShowPassword((prev) => !prev)}
										className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition-all cursor-pointer shadow-2xs"
										title={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
									<button
										type="button"
										onClick={handleRegeneratePassword}
										className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer shadow-2xs group"
										title="Regenerate password"
									>
										<RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
									</button>
									<button
										type="button"
										onClick={handleCopyPassword}
										className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
											isPasswordCopied
												? "bg-emerald-600 text-white"
												: "bg-indigo-600 hover:bg-indigo-700 text-white"
										}`}
									>
										{isPasswordCopied ? (
											<Check className="w-4 h-4" />
										) : (
											<Copy className="w-4 h-4" />
										)}
										{isPasswordCopied ? "Copied!" : "Copy"}
									</button>
								</div>
							</div>

							{/* Strength Meter Bar */}
							<div className="space-y-2">
								<div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
									<div
										className={`h-full transition-all duration-500 ${strength.bgColor}`}
										style={{ width: `${strength.score}%` }}
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1 font-medium">
									<span>{strength.feedback}</span>
									<span className="font-mono">
										Crack Time (Fast GPU):{" "}
										<strong className="text-slate-800">
											{strength.crackTimeOffline}
										</strong>
									</span>
								</div>
							</div>
						</div>

						{/* Configuration Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Controls Column */}
							<div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
								{/* Mode Selector */}
								<div className="space-y-2">
									<span className="text-xs font-bold uppercase tracking-wider text-slate-700">
										Generation Mode
									</span>
									<div className="grid grid-cols-3 gap-2">
										{[
											{
												id: "custom",
												label: "Random Password",
												icon: KeyRound,
											},
											{
												id: "passphrase",
												label: "Memorable Passphrase",
												icon: Layers,
											},
											{ id: "pin", label: "Numeric PIN", icon: Hash },
										].map((m) => (
											<button
												key={m.id}
												type="button"
												onClick={() =>
													setPasswordOptions((prev) => ({
														...prev,
														mode: m.id as PasswordMode,
													}))
												}
												className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
													passwordOptions.mode === m.id
														? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20"
														: "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700"
												}`}
											>
												<m.icon className="w-4 h-4 text-indigo-600" />
												<span>{m.label}</span>
											</button>
										))}
									</div>
								</div>

								{/* Custom Password Options */}
								{passwordOptions.mode === "custom" && (
									<div className="space-y-6">
										{/* Length Slider */}
										<div className="space-y-2">
											<div className="flex items-center justify-between text-xs font-bold text-slate-700">
												<span className="flex items-center gap-1.5">
													<Sliders className="w-4 h-4 text-indigo-600" />
													Password Length
												</span>
												<span className="font-mono text-base font-extrabold text-indigo-600">
													{passwordOptions.length} characters
												</span>
											</div>
											<input
												type="range"
												min="6"
												max="64"
												value={passwordOptions.length}
												onChange={(e) =>
													setPasswordOptions((prev) => ({
														...prev,
														length: Number(e.target.value),
													}))
												}
												className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
											/>
										</div>

										{/* Charset Switches */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
											{[
												{
													key: "includeUppercase",
													label: "Uppercase Letters (A-Z)",
												},
												{
													key: "includeLowercase",
													label: "Lowercase Letters (a-z)",
												},
												{ key: "includeNumbers", label: "Numbers (0-9)" },
												{
													key: "includeSymbols",
													label: "Special Symbols (!@#$%)",
												},
												{
													key: "avoidAmbiguous",
													label: "Exclude Ambiguous (l, 1, I, O, 0)",
												},
											].map((opt) => (
												<label
													key={opt.key}
													className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100/70 transition-colors"
												>
													<input
														type="checkbox"
														checked={
															passwordOptions[
																opt.key as keyof PasswordOptions
															] as boolean
														}
														onChange={(e) =>
															setPasswordOptions((prev) => ({
																...prev,
																[opt.key]: e.target.checked,
															}))
														}
														className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 focus:ring-0 cursor-pointer"
													/>
													<span className="text-xs font-bold text-slate-700">
														{opt.label}
													</span>
												</label>
											))}
										</div>
									</div>
								)}

								{/* Passphrase Options */}
								{passwordOptions.mode === "passphrase" && (
									<div className="space-y-6">
										<div className="space-y-2">
											<div className="flex items-center justify-between text-xs font-bold text-slate-700">
												<span>Word Count</span>
												<span className="font-mono text-base font-extrabold text-indigo-600">
													{passwordOptions.wordCount} words
												</span>
											</div>
											<input
												type="range"
												min="3"
												max="8"
												value={passwordOptions.wordCount}
												onChange={(e) =>
													setPasswordOptions((prev) => ({
														...prev,
														wordCount: Number(e.target.value),
													}))
												}
												className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
											/>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-2">
												<span className="text-xs font-bold text-slate-700">
													Word Separator
												</span>
												<select
													value={passwordOptions.separator}
													onChange={(e) =>
														setPasswordOptions((prev) => ({
															...prev,
															separator: e.target.value,
														}))
													}
													className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
												>
													<option value="-">Hyphen (-)</option>
													<option value="_">Underscore (_)</option>
													<option value=".">Dot (.)</option>
													<option value=" ">Space ( )</option>
													<option value="/">Slash (/)</option>
												</select>
											</div>

											<div className="space-y-2 pt-6">
												<label className="flex items-center gap-3 cursor-pointer">
													<input
														type="checkbox"
														checked={passwordOptions.capitalizeWords}
														onChange={(e) =>
															setPasswordOptions((prev) => ({
																...prev,
																capitalizeWords: e.target.checked,
															}))
														}
														className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
													/>
													<span className="text-xs font-bold text-slate-700">
														Capitalize Words
													</span>
												</label>
												<label className="flex items-center gap-3 cursor-pointer">
													<input
														type="checkbox"
														checked={passwordOptions.includeNumberInPassphrase}
														onChange={(e) =>
															setPasswordOptions((prev) => ({
																...prev,
																includeNumberInPassphrase: e.target.checked,
															}))
														}
														className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
													/>
													<span className="text-xs font-bold text-slate-700">
														Append Number
													</span>
												</label>
											</div>
										</div>
									</div>
								)}

								{/* PIN Options */}
								{passwordOptions.mode === "pin" && (
									<div className="space-y-4">
										<div className="space-y-2">
											<div className="flex items-center justify-between text-xs font-bold text-slate-700">
												<span>PIN Code Length</span>
												<span className="font-mono text-base font-extrabold text-indigo-600">
													{passwordOptions.length} digits
												</span>
											</div>
											<input
												type="range"
												min="4"
												max="16"
												value={passwordOptions.length}
												onChange={(e) =>
													setPasswordOptions((prev) => ({
														...prev,
														length: Number(e.target.value),
													}))
												}
												className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
											/>
										</div>
									</div>
								)}
							</div>

							{/* Batch Generation Drawer */}
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
											<Zap className="w-4 h-4 text-indigo-600" />
											Batch Generator
										</span>
										<select
											value={batchCount}
											onChange={(e) => setBatchCount(Number(e.target.value))}
											className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
										>
											<option value={5}>5 items</option>
											<option value={10}>10 items</option>
											<option value={20}>20 items</option>
										</select>
									</div>

									<button
										type="button"
										onClick={handleGenerateBatch}
										className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer shadow-xs"
									>
										Generate Batch ({batchCount})
									</button>

									{batchPasswords.length > 0 && (
										<div className="space-y-2 max-h-[220px] overflow-y-auto p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
											{batchPasswords.map((pass, idx) => (
												<div
													key={`${pass}-${idx}`}
													className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 py-1 border-b border-slate-200/50 last:border-0"
												>
													<span className="truncate pr-2">{pass}</span>
													<button
														type="button"
														onClick={() => navigator.clipboard.writeText(pass)}
														className="text-slate-400 hover:text-indigo-600"
														title="Copy"
													>
														<Copy className="w-3.5 h-3.5" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								{batchPasswords.length > 0 && (
									<button
										type="button"
										onClick={handleCopyBatch}
										className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
									>
										{isBatchCopied ? (
											<Check className="w-4 h-4" />
										) : (
											<Copy className="w-4 h-4" />
										)}
										{isBatchCopied ? "Copied All!" : "Copy All Passwords"}
									</button>
								)}
							</div>
						</div>
					</motion.div>
				)}

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* TAB 2: CRYPTO HASHER & CHECKSUM                                    */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				{activeTab === "hasher" && (
					<motion.div
						key="hasher-tab"
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Top Hasher Control Bar */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								{/* Mode Pill */}
								<div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
									<button
										type="button"
										onClick={() => setHashInputMode("text")}
										className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
											hashInputMode === "text"
												? "bg-white text-slate-900 shadow-2xs"
												: "text-slate-500 hover:text-slate-900"
										}`}
									>
										Text Input
									</button>
									<button
										type="button"
										onClick={() => setHashInputMode("file")}
										className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
											hashInputMode === "file"
												? "bg-white text-slate-900 shadow-2xs"
												: "text-slate-500 hover:text-slate-900"
										}`}
									>
										File Checksum
									</button>
								</div>

								{/* Output Format Select */}
								<div className="flex items-center gap-2">
									<span className="text-xs font-bold text-slate-500 uppercase">
										Format:
									</span>
									<select
										value={hashOutputFormat}
										onChange={(e) =>
											setHashOutputFormat(e.target.value as HashOutputFormat)
										}
										className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
									>
										<option value="hex-lower">Hex (lowercase)</option>
										<option value="hex-upper">Hex (UPPERCASE)</option>
										<option value="base64">Base64</option>
									</select>
								</div>
							</div>

							{/* Algorithm Selection Buttons */}
							<div className="space-y-2">
								<span className="text-xs font-bold uppercase tracking-wider text-slate-700">
									Cryptographic Algorithm
								</span>
								<div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
									{ALL_HASH_ALGORITHMS.map((algo) => (
										<button
											key={algo}
											type="button"
											onClick={() => setSelectedAlgorithm(algo)}
											className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer text-center ${
												selectedAlgorithm === algo
													? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20"
													: "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700"
											}`}
										>
											{algo}
										</button>
									))}
								</div>
							</div>

							{/* Optional HMAC Key */}
							<div className="space-y-3 pt-2 border-t border-slate-100">
								<div className="flex items-center justify-between">
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="checkbox"
											checked={enableHmac}
											onChange={(e) => setEnableHmac(e.target.checked)}
											className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
										/>
										<span className="text-xs font-bold text-slate-700">
											Enable HMAC (Keyed-Hash Message Authentication)
										</span>
									</label>
								</div>
								{enableHmac && (
									<input
										type="text"
										value={hmacSecret}
										onChange={(e) => setHmacSecret(e.target.value)}
										placeholder="Enter HMAC Secret Key..."
										className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
									/>
								)}
							</div>
						</div>

						{/* Input & Output Workspace */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Input Pane */}
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
											<FileText className="w-4 h-4 text-indigo-600" />
											{hashInputMode === "text"
												? "Text Message Payload"
												: "Selected File"}
										</span>
										{hashInputMode === "text" && (
											<button
												type="button"
												onClick={() => setHashTextInput("")}
												className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
											>
												Clear
											</button>
										)}
									</div>

									{hashInputMode === "text" ? (
										<textarea
											value={hashTextInput}
											onChange={(e) => setHashTextInput(e.target.value)}
											placeholder="Type or paste payload to hash..."
											className="w-full h-48 p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
										/>
									) : (
										<div
											onDragOver={(e) => {
												e.preventDefault();
												setIsDraggingFile(true);
											}}
											onDragLeave={() => setIsDraggingFile(false)}
											onDrop={(e) => {
												e.preventDefault();
												setIsDraggingFile(false);
												handleFileUpload(e.dataTransfer.files);
											}}
											onClick={() => fileInputRef.current?.click()}
											className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
												isDraggingFile
													? "border-indigo-600 bg-indigo-50/50"
													: "border-slate-300 bg-slate-50 hover:border-indigo-400"
											}`}
										>
											<input
												ref={fileInputRef}
												type="file"
												onChange={(e) => handleFileUpload(e.target.files)}
												className="hidden"
											/>
											<Upload className="w-8 h-8 text-indigo-600 mb-2" />
											<p className="text-xs font-extrabold text-slate-800">
												{hashFileName
													? hashFileName
													: "Drop file to compute checksum, or browse"}
											</p>
											<p className="text-[11px] text-slate-500 mt-1">
												Computed locally via streaming ArrayBuffer
											</p>
										</div>
									)}
								</div>

								{/* Expected Checksum Verification Box */}
								<div className="space-y-2 pt-2 border-t border-slate-100">
									<span className="text-xs font-bold text-slate-700">
										Verify Against Official / Expected Checksum (Optional)
									</span>
									<input
										type="text"
										value={expectedChecksum}
										onChange={(e) => setExpectedChecksum(e.target.value)}
										placeholder="Paste expected SHA256 / MD5 hash..."
										className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
									/>
								</div>
							</div>

							{/* Output Pane */}
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
											<Hash className="w-4 h-4 text-indigo-600" />
											{selectedAlgorithm} Hash Result
										</span>
										<span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
											{hashExecutionTime} ms
										</span>
									</div>

									{/* Verification Status Badge */}
									{expectedChecksum.trim() !== "" && computedHash && (
										<div>
											{computedHash.toLowerCase() ===
											expectedChecksum.trim().toLowerCase() ? (
												<div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-800 text-xs font-extrabold">
													<CheckCircle2 className="w-4 h-4 text-emerald-600" />
													Checksum Matches Expected Value!
												</div>
											) : (
												<div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-800 text-xs font-extrabold">
													<XCircle className="w-4 h-4 text-rose-600" />
													Checksum Mismatch (Possible file tampering or
													corruption)
												</div>
											)}
										</div>
									)}

									{/* Computed Hash Box */}
									<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
										<p className="font-mono text-xs sm:text-sm font-bold text-slate-900 break-all select-all leading-relaxed">
											{computedHash || "Awaiting input..."}
										</p>
										{computedHash && (
											<button
												type="button"
												onClick={() => handleCopyHash(computedHash)}
												className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
											>
												{isHashCopied ? (
													<Check className="w-3.5 h-3.5 text-emerald-600" />
												) : (
													<Copy className="w-3.5 h-3.5" />
												)}
												{isHashCopied ? "Copied!" : "Copy Hash"}
											</button>
										)}
									</div>
								</div>

								{/* Multi-Algorithm Summary List */}
								{!enableHmac && Object.keys(multiHashes).length > 0 && (
									<div className="space-y-2 pt-3 border-t border-slate-100">
										<span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
											Simultaneous Multi-Algorithm Digestion
										</span>
										<div className="space-y-1.5 max-h-[140px] overflow-y-auto">
											{ALL_HASH_ALGORITHMS.filter(
												(a) => a !== selectedAlgorithm,
											).map((algo) => (
												<div
													key={algo}
													className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-xl border border-slate-100"
												>
													<span className="font-bold text-slate-600 w-16 shrink-0">
														{algo}
													</span>
													<span className="font-mono text-slate-800 text-[11px] truncate flex-1 px-2">
														{multiHashes[algo]}
													</span>
													<button
														type="button"
														onClick={() =>
															multiHashes[algo] &&
															handleCopyHash(multiHashes[algo])
														}
														className="text-slate-400 hover:text-indigo-600 shrink-0"
														title="Copy"
													>
														<Copy className="w-3.5 h-3.5" />
													</button>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* TAB 3: FORMATTER & ENCODER                                         */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				{activeTab === "formatter" && (
					<motion.div
						key="formatter-tab"
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Formatter Top Bar */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								{/* Encode / Decode Action Toggle */}
								<div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
									<button
										type="button"
										onClick={() => setFormatterAction("encode")}
										className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
											formatterAction === "encode"
												? "bg-indigo-600 text-white shadow-xs"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										Encode
									</button>
									<button
										type="button"
										onClick={() => setFormatterAction("decode")}
										className={`px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
											formatterAction === "decode"
												? "bg-indigo-600 text-white shadow-xs"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										Decode
									</button>
								</div>

								{/* Swap Input & Output */}
								<button
									type="button"
									onClick={handleSwapFormatter}
									disabled={!formatterOutput}
									className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
								>
									<ArrowRightLeft className="w-4 h-4" />
									<span>Swap & Invert Action</span>
								</button>
							</div>

							{/* Format Selection Cards */}
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
								{ENCODING_FORMATS.map((fmt) => (
									<button
										key={fmt.id}
										type="button"
										onClick={() => setFormatterFormat(fmt.id)}
										className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
											formatterFormat === fmt.id
												? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700"
										}`}
									>
										<span className="text-xs font-extrabold">{fmt.label}</span>
										<span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
											{fmt.desc}
										</span>
									</button>
								))}
							</div>
						</div>

						{/* Side-by-Side Editor Panes */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Input Pane */}
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
										<FileText className="w-4 h-4 text-indigo-600" />
										{formatterAction === "encode"
											? "Plain Input"
											: "Encoded Source"}
									</span>
									<span className="text-[10px] font-mono text-slate-400">
										{formatterInput.length} chars
									</span>
								</div>
								<textarea
									value={formatterInput}
									onChange={(e) => setFormatterInput(e.target.value)}
									placeholder="Enter text to transform..."
									className="w-full h-72 p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
								/>
							</div>

							{/* Output Pane */}
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
											<Binary className="w-4 h-4 text-indigo-600" />
											{formatterAction === "encode"
												? "Encoded Output"
												: "Decoded Result"}
										</span>
										{formatterOutput && (
											<button
												type="button"
												onClick={handleCopyFormatter}
												className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
											>
												{isFormatterCopied ? (
													<Check className="w-3.5 h-3.5" />
												) : (
													<Copy className="w-3.5 h-3.5" />
												)}
												{isFormatterCopied ? "Copied" : "Copy"}
											</button>
										)}
									</div>

									{formatterError ? (
										<div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
											{formatterError}
										</div>
									) : (
										<textarea
											readOnly
											value={formatterOutput}
											placeholder="Transformed output will appear here..."
											className="w-full h-72 p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed resize-none focus:outline-none select-all"
										/>
									)}
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{/* Security Guidelines Footer Cards */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
				>
					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
							<KeyRound className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							CSPRNG Entropy
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Generates unbiased pseudo-random bits utilizing hardware entropy
							sources with zero modulo bias.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
							<ShieldCheck className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Zero-Server Privacy
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							All hashes, keys, and passphrases are calculated locally in your
							browser sandbox. Zero telemetry or server storage.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
							<Hash className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							File Integrity Verification
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Compare downloaded installer, image, or package hashes against
							official vendor checksums to detect corruption or tampering.
						</p>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
