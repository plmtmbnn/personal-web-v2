"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
	ShieldCheck,
	KeyRound,
	Lock,
	CheckCircle2,
	AlertTriangle,
	XCircle,
	Copy,
	Check,
	RotateCcw,
	Clock,
	Code2,
	Layers,
	FileText,
	Sparkles,
	Building2,
	Eye,
	EyeOff,
	ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { decodeJWT, verifyHmacSignature } from "../utils/jwt";
import { JWT_PRESETS } from "../utils/presets";
import type { DecodedJWT, SignatureVerificationResult } from "../types";

export default function JWTInspectorView() {
	const reduceMotion = useReducedMotion();
	const [tokenInput, setTokenInput] = useState<string>(JWT_PRESETS[0].token);
	const [activeTab, setActiveTab] = useState<
		"payload" | "header" | "signature" | "claims"
	>("payload");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [currentTimeSec, setCurrentTimeSec] = useState<number>(() =>
		Math.floor(Date.now() / 1000),
	);

	// Signature verification state
	const [hmacSecret, setHmacSecret] = useState<string>(
		JWT_PRESETS[0].secret || "",
	);
	const [showSecret, setShowSecret] = useState<boolean>(false);
	const [verificationResult, setVerificationResult] =
		useState<SignatureVerificationResult>({
			status: "idle",
			message: "Enter HMAC secret key to verify signature.",
			algorithm: "HS256",
		});

	// Live second ticker for accurate countdowns
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTimeSec(Math.floor(Date.now() / 1000));
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// Decode token reactively with current time ticker
	const decoded: DecodedJWT = useMemo(() => {
		return decodeJWT(tokenInput, currentTimeSec);
	}, [tokenInput, currentTimeSec]);

	// Auto-verify signature if secret is present
	const handleVerifySignature = useCallback(async () => {
		if (!decoded.isValidStructure) {
			setVerificationResult({
				status: "invalid",
				message: "Invalid token structure to verify.",
				algorithm: "HS256",
			});
			return;
		}

		const alg = decoded.header?.alg || "HS256";
		if (alg === "HS256" || alg === "HS384" || alg === "HS512") {
			const result = await verifyHmacSignature(tokenInput, hmacSecret, alg);
			setVerificationResult(result);
		} else {
			setVerificationResult({
				status: "unsupported",
				message: `Client-side verification currently supports HMAC (HS256/384/512). Token uses ${alg}.`,
				algorithm: alg,
			});
		}
	}, [decoded, tokenInput, hmacSecret]);

	// Trigger verification when secret or token changes
	useEffect(() => {
		if (hmacSecret && decoded.isValidStructure) {
			handleVerifySignature();
		} else {
			setVerificationResult({
				status: "idle",
				message: "Enter HMAC secret key to verify signature.",
				algorithm: decoded.header?.alg || "HS256",
			});
		}
	}, [
		hmacSecret,
		decoded.isValidStructure,
		decoded.header?.alg,
		handleVerifySignature,
	]);

	const handleCopy = (text: string, key: string) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(key);
		setTimeout(() => setCopiedKey(null), 2000);
	};

	const handleLoadPreset = (preset: (typeof JWT_PRESETS)[0]) => {
		setTokenInput(preset.token);
		setHmacSecret(preset.secret || "");
	};

	const handleClear = () => {
		setTokenInput("");
		setHmacSecret("");
		setVerificationResult({
			status: "idle",
			message: "Enter a token to inspect.",
			algorithm: "HS256",
		});
	};

	// Parse scopes / roles array for quick badges
	const tokenScopes = useMemo(() => {
		if (!decoded.payload) return [];
		if (typeof decoded.payload.scope === "string") {
			return decoded.payload.scope.split(" ").filter(Boolean);
		}
		if (Array.isArray(decoded.payload.scopes)) {
			return decoded.payload.scopes.map(String);
		}
		return [];
	}, [decoded.payload]);

	const tokenRoles = useMemo(() => {
		if (!decoded.payload) return [];
		if (typeof decoded.payload.role === "string") {
			return [decoded.payload.role];
		}
		if (Array.isArray(decoded.payload.roles)) {
			return decoded.payload.roles.map(String);
		}
		return [];
	}, [decoded.payload]);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern py-20 pb-32 sm:py-24 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Hero Header */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="space-y-3"
				>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
							<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
							<span>Security & Token Studio</span>
						</div>

						{/* Zero Telemetry Trust Badge */}
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold shadow-xs">
							<Lock className="w-3 h-3 text-emerald-600" />
							<span>100% Client-Side Decoded • Zero Server Telemetry</span>
						</div>
					</div>

					<div className="space-y-1">
						<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
							JWT & API Token{" "}
							<span className="text-indigo-600">Inspector.</span>
						</h1>
						<p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
							Decode JSON Web Tokens, inspect RFC 7519 claims, monitor live
							expiration countdowns, and verify HMAC signatures locally in your
							browser memory.
						</p>
					</div>
				</motion.div>

				{/* Preset Quick Load Bar */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.05 }}
					className="flex flex-wrap items-center gap-2"
				>
					<span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
						<Sparkles className="w-3 h-3 text-indigo-600" />
						<span>Sample Presets:</span>
					</span>
					{JWT_PRESETS.map((preset) => {
						const isCurrent = tokenInput === preset.token;
						return (
							<button
								key={preset.id}
								type="button"
								onClick={() => handleLoadPreset(preset)}
								className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
									isCurrent
										? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs"
										: "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
								}`}
								title={preset.description}
							>
								{preset.id === "supabase" && (
									<KeyRound className="w-3 h-3 text-indigo-600" />
								)}
								{preset.id === "oauth2" && (
									<Layers className="w-3 h-3 text-blue-600" />
								)}
								{preset.id === "aspi" && (
									<Building2 className="w-3 h-3 text-emerald-600" />
								)}
								{preset.id === "expired" && (
									<Clock className="w-3 h-3 text-rose-600" />
								)}
								<span>{preset.title}</span>
							</button>
						);
					})}
				</motion.div>

				{/* Main Studio Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Left Column: Token Input & Verification (5 cols) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: -15 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="lg:col-span-5 space-y-4"
					>
						{/* Token Input Panel */}
						<div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
							<div className="flex items-center justify-between">
								<label
									htmlFor="token-input"
									className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
								>
									<Code2 className="w-3.5 h-3.5 text-indigo-600" />
									<span>Raw Encoded Token</span>
								</label>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={handleClear}
										className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
									>
										<RotateCcw className="w-3 h-3" />
										<span>Clear</span>
									</button>
								</div>
							</div>

							<textarea
								id="token-input"
								value={tokenInput}
								onChange={(e) => setTokenInput(e.target.value)}
								placeholder="Paste your JWT token here (Header.Payload.Signature)..."
								rows={8}
								className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-y text-slate-800 leading-relaxed"
							/>

							{/* Structure Indicator Pills */}
							<div className="flex items-center justify-between text-[11px] pt-1">
								<div className="flex items-center gap-2 font-mono">
									<span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
										Header
									</span>
									<span className="text-slate-400">•</span>
									<span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold">
										Payload
									</span>
									<span className="text-slate-400">•</span>
									<span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
										Signature
									</span>
								</div>
								<span className="text-slate-400 text-[10px] font-mono">
									{tokenInput.length} chars
								</span>
							</div>

							{/* Error Alert */}
							{decoded.errorMessage && (
								<div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
									<AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
									<p className="font-medium leading-relaxed">
										{decoded.errorMessage}
									</p>
								</div>
							)}
						</div>

						{/* In-Browser HMAC Signature Verifier Sandbox */}
						<div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
							<div className="flex items-center justify-between">
								<h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
									<KeyRound className="w-3.5 h-3.5 text-indigo-600" />
									<span>HMAC Signature Verification</span>
								</h2>
								<span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
									{decoded.header?.alg || "HS256"}
								</span>
							</div>

							<p className="text-xs text-slate-500 leading-relaxed">
								Test your secret key against the token's cryptographic signature
								locally using browser Web Crypto.
							</p>

							<div className="space-y-2">
								<div className="relative">
									<input
										type={showSecret ? "text" : "password"}
										value={hmacSecret}
										onChange={(e) => setHmacSecret(e.target.value)}
										placeholder="Enter HMAC secret key (e.g. your-secret)..."
										className="w-full pr-10 pl-3 py-2 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-800"
									/>
									<button
										type="button"
										onClick={() => setShowSecret(!showSecret)}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
										title={showSecret ? "Hide Secret" : "Show Secret"}
									>
										{showSecret ? (
											<EyeOff className="w-3.5 h-3.5" />
										) : (
											<Eye className="w-3.5 h-3.5" />
										)}
									</button>
								</div>

								{/* Verification Status Banner */}
								<div
									className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
										verificationResult.status === "valid"
											? "bg-emerald-50 border-emerald-200 text-emerald-800"
											: verificationResult.status === "invalid"
												? "bg-rose-50 border-rose-200 text-rose-800"
												: verificationResult.status === "unsupported"
													? "bg-amber-50 border-amber-200 text-amber-800"
													: "bg-slate-50 border-slate-200 text-slate-600"
									}`}
								>
									{verificationResult.status === "valid" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{verificationResult.status === "invalid" && (
										<XCircle className="w-4 h-4 text-rose-600 shrink-0" />
									)}
									{verificationResult.status === "unsupported" && (
										<ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
									)}
									{verificationResult.status === "idle" && (
										<Lock className="w-4 h-4 text-slate-400 shrink-0" />
									)}
									<span className="leading-tight">
										{verificationResult.message}
									</span>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Right Column: Decoded Claims & Telemetry (7 cols) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: 15 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.15 }}
						className="lg:col-span-7 space-y-4"
					>
						{/* Live Expiration & Time Telemetry Card */}
						{decoded.timeTelemetry && (
							<div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-indigo-600" />
										<span className="text-xs font-bold uppercase tracking-wider text-slate-700">
											Token Expiration Telemetry
										</span>
									</div>
									<span
										className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${decoded.timeTelemetry.statusBadgeClass}`}
									>
										{decoded.timeTelemetry.statusLabel}
									</span>
								</div>

								{/* Expiration Countdown & Lifespan Progress */}
								{decoded.timeTelemetry.expiresInFormatted && (
									<div className="space-y-1.5 pt-1">
										<div className="flex justify-between text-xs">
											<span className="text-slate-500 font-medium">
												Live Status:
											</span>
											<span className="font-bold text-slate-900 font-mono">
												{decoded.timeTelemetry.expiresInFormatted}
											</span>
										</div>

										{decoded.timeTelemetry.remainingPercent !== null && (
											<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
												<div
													className={`h-full transition-all duration-1000 ${
														decoded.timeTelemetry.status === "expired"
															? "bg-rose-500"
															: decoded.timeTelemetry.status === "expiring_soon"
																? "bg-amber-500"
																: "bg-emerald-500"
													}`}
													style={{
														width: `${decoded.timeTelemetry.remainingPercent}%`,
													}}
												/>
											</div>
										)}
									</div>
								)}

								{/* Time Metrics Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
									<div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
											Issued At (iat)
										</p>
										<p className="text-xs font-bold text-slate-900 truncate">
											{decoded.timeTelemetry.issuedAtDate || "Not Specified"}
										</p>
										{decoded.timeTelemetry.issuedDurationAgo && (
											<p className="text-[10px] text-slate-500">
												{decoded.timeTelemetry.issuedDurationAgo}
											</p>
										)}
									</div>

									<div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
											Expires At (exp)
										</p>
										<p className="text-xs font-bold text-slate-900 truncate">
											{decoded.timeTelemetry.expiresAtDate || "No Expiry"}
										</p>
										{decoded.timeTelemetry.expiresInSeconds !== null && (
											<p className="text-[10px] text-slate-500">
												{decoded.timeTelemetry.expiresInSeconds > 0
													? `${decoded.timeTelemetry.expiresInSeconds}s left`
													: "Expired"}
											</p>
										)}
									</div>

									<div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
											Valid From (nbf)
										</p>
										<p className="text-xs font-bold text-slate-900 truncate">
											{decoded.timeTelemetry.notBeforeDate || "Immediate"}
										</p>
										<p className="text-[10px] text-slate-500">
											{decoded.timeTelemetry.isNotBeforeValid
												? "Valid now"
												: "Pending activation"}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Quick Roles & Scopes Badges */}
						{(tokenRoles.length > 0 || tokenScopes.length > 0) && (
							<div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
								<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
									<Layers className="w-3.5 h-3.5 text-indigo-600" />
									<span>Permissions, Roles & Scopes</span>
								</div>

								<div className="flex flex-wrap gap-1.5">
									{tokenRoles.map((role) => (
										<span
											key={role}
											className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold"
										>
											role: {role}
										</span>
									))}
									{tokenScopes.map((scope) => (
										<span
											key={scope}
											className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold"
										>
											{scope}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Inspector Tabs Header & Actions */}
						<div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
							<div className="p-2 sm:p-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
								{/* Tab Switches */}
								<div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
									<button
										type="button"
										onClick={() => setActiveTab("payload")}
										className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
											activeTab === "payload"
												? "bg-white text-slate-900 shadow-xs"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										<FileText className="w-3.5 h-3.5 text-blue-600" />
										<span>Payload JSON</span>
									</button>

									<button
										type="button"
										onClick={() => setActiveTab("claims")}
										className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
											activeTab === "claims"
												? "bg-white text-slate-900 shadow-xs"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										<Layers className="w-3.5 h-3.5 text-indigo-600" />
										<span>Claims Dictionary</span>
									</button>

									<button
										type="button"
										onClick={() => setActiveTab("header")}
										className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
											activeTab === "header"
												? "bg-white text-slate-900 shadow-xs"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										<Code2 className="w-3.5 h-3.5 text-indigo-600" />
										<span>Header (JOSE)</span>
									</button>
								</div>

								{/* Copy Button */}
								<button
									type="button"
									onClick={() => {
										const contentToCopy =
											activeTab === "header"
												? decoded.headerFormatted
												: decoded.payloadFormatted;
										handleCopy(contentToCopy, activeTab);
									}}
									className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									{copiedKey === activeTab ? (
										<Check className="w-3.5 h-3.5 text-emerald-600" />
									) : (
										<Copy className="w-3.5 h-3.5" />
									)}
									<span>
										Copy {activeTab === "header" ? "Header" : "Payload"}
									</span>
								</button>
							</div>

							{/* Tab Content Panes */}
							<div className="p-4 sm:p-5">
								{activeTab === "payload" && (
									<div className="space-y-3">
										<pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
											{decoded.payloadFormatted ||
												"{\n  // Empty or invalid payload\n}"}
										</pre>
									</div>
								)}

								{activeTab === "header" && (
									<div className="space-y-3">
										<pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
											{decoded.headerFormatted ||
												"{\n  // Empty or invalid header\n}"}
										</pre>
									</div>
								)}

								{activeTab === "claims" && (
									<div className="space-y-3">
										<div className="overflow-x-auto">
											<table className="w-full text-left text-xs border-collapse">
												<thead>
													<tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
														<th className="pb-2">Claim</th>
														<th className="pb-2">Name</th>
														<th className="pb-2">Parsed Value</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-slate-100">
													{decoded.claimsList.map((item) => (
														<tr
															key={item.claim}
															className="hover:bg-slate-50/60"
														>
															<td className="py-2.5 pr-2 font-mono font-bold text-indigo-600">
																{item.claim}
															</td>
															<td className="py-2.5 pr-2 font-medium text-slate-800">
																<div>{item.name}</div>
																<div className="text-[10px] text-slate-400 font-normal">
																	{item.description}
																</div>
															</td>
															<td className="py-2.5 font-mono text-slate-700 max-w-[200px] truncate">
																{item.value}
															</td>
														</tr>
													))}
													{decoded.claimsList.length === 0 && (
														<tr>
															<td
																colSpan={3}
																className="py-6 text-center text-slate-400 font-medium"
															>
																No claims detected.
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Copy Toast Alert */}
			<AnimatePresence>
				{copiedKey && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-auto px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg z-[100] flex items-center gap-2"
					>
						<Check className="w-3.5 h-3.5 text-emerald-400" />
						<span className="text-xs text-white font-medium">
							Copied to clipboard!
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
