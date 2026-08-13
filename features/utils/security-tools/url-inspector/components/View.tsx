"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
	ShieldCheck,
	ShieldAlert,
	ShieldX,
	AlertTriangle,
	Search,
	ArrowLeft,
	Copy,
	Check,
	RefreshCw,
	Lock,
	Unlock,
	Globe,
	Link2,
	Eye,
	Layers,
} from "lucide-react";
import Link from "next/link";
import type { URLAnalysisResult, RiskLevel } from "../types";
import { analyzeURL } from "../utils/analyzer";
import { PRESET_URLS } from "../data/presets";

export default function URLInspectorView() {
	const [inputUrl, setInputUrl] = useState(
		"http://paypal-verify-account.security-login.xyz/auth?user=admin",
	);
	const [unmasking, setUnmasking] = useState(false);
	const [unmaskResult, setUnmaskResult] = useState<{
		unmaskedUrl: string;
		redirectChain: string[];
	} | null>(null);
	const [copied, setCopied] = useState(false);

	// Analyze URL in real time
	const analysis = useMemo<URLAnalysisResult>(() => {
		return analyzeURL(inputUrl);
	}, [inputUrl]);

	// Call unmask API route
	const handleUnmask = useCallback(async () => {
		if (!inputUrl.trim()) return;
		setUnmasking(true);
		setUnmaskResult(null);

		try {
			const res = await fetch("/api/utils/unmask-url", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: inputUrl }),
			});
			const data = await res.json();

			if (res.ok && data.unmaskedUrl) {
				setUnmaskResult({
					unmaskedUrl: data.unmaskedUrl,
					redirectChain: data.redirectChain || [data.unmaskedUrl],
				});
			}
		} catch (_e) {
			console.warn("Unmask request failed");
		} finally {
			setUnmasking(false);
		}
	}, [inputUrl]);

	const copyReport = () => {
		if (!analysis.isValid) return;

		const summary = `🛡️ URL Safety Scan Report:
URL: ${analysis.originalUrl}
Risk Score: ${analysis.riskScore}/100 (${analysis.riskLevel})
${
	unmaskResult?.unmaskedUrl
		? `Unmasked Target: ${unmaskResult.unmaskedUrl}`
		: ""
}
Threat Flags (${analysis.flags.length}):
${analysis.flags.map((f) => `- [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join("\n")}`;

		navigator.clipboard.writeText(summary);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Risk level styling helper
	const getRiskTheme = (level: RiskLevel) => {
		switch (level) {
			case "SAFE":
				return {
					badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
					cardBg: "bg-emerald-500/5 border-emerald-500/20",
					scoreBg: "bg-emerald-500 text-white",
					icon: ShieldCheck,
					iconColor: "text-emerald-500",
				};
			case "LOW":
				return {
					badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
					cardBg: "bg-cyan-500/5 border-cyan-500/20",
					scoreBg: "bg-cyan-600 text-white",
					icon: ShieldCheck,
					iconColor: "text-cyan-500",
				};
			case "SUSPICIOUS":
				return {
					badge: "bg-amber-50 text-amber-700 border-amber-200",
					cardBg: "bg-amber-500/5 border-amber-500/20",
					scoreBg: "bg-amber-500 text-white",
					icon: AlertTriangle,
					iconColor: "text-amber-500",
				};
			case "HIGH":
				return {
					badge: "bg-orange-50 text-orange-700 border-orange-200",
					cardBg: "bg-orange-500/5 border-orange-500/20",
					scoreBg: "bg-orange-600 text-white",
					icon: ShieldAlert,
					iconColor: "text-orange-500",
				};
			default:
				return {
					badge: "bg-rose-50 text-rose-700 border-rose-200",
					cardBg: "bg-rose-500/5 border-rose-500/20",
					scoreBg: "bg-rose-600 text-white",
					icon: ShieldX,
					iconColor: "text-rose-600",
				};
		}
	};

	const theme = getRiskTheme(analysis.riskLevel);
	const RiskIcon = theme.icon;

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-28 font-sans">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="space-y-2">
						<Link
							href="/utils"
							className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Back to Utilities
						</Link>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
								<ShieldCheck className="w-5 h-5 text-indigo-400" />
							</div>
							<div>
								<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
									URL Safety <span className="text-indigo-600">Inspector</span>
								</h1>
								<p className="text-xs font-bold text-slate-500 mt-0.5">
									Detect shorteners, IDN homograph phishing, malware indicators,
									& invalid URL characters.
								</p>
							</div>
						</div>
					</div>

					{analysis.isValid && (
						<button
							type="button"
							onClick={copyReport}
							className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
						>
							{copied ? (
								<Check className="w-4 h-4 text-emerald-600" />
							) : (
								<Copy className="w-4 h-4 text-slate-500" />
							)}
							<span>{copied ? "Report Copied!" : "Copy Report"}</span>
						</button>
					)}
				</div>

				{/* Presets & URL Scanner Input */}
				<div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6">
					<div className="space-y-2">
						<label
							htmlFor="url-input"
							className="text-xs font-black uppercase tracking-wider text-slate-700 block"
						>
							Enter URL or Domain to Inspect
						</label>

						<div className="flex flex-col sm:flex-row items-stretch gap-2">
							<div className="relative flex-1">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
									<Search className="w-4 h-4" />
								</div>
								<input
									id="url-input"
									type="text"
									value={inputUrl}
									onChange={(e) => setInputUrl(e.target.value)}
									placeholder="https://example.com/login"
									className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
								/>
							</div>

							<button
								type="button"
								onClick={handleUnmask}
								disabled={unmasking || !inputUrl.trim()}
								className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
							>
								{unmasking ? (
									<RefreshCw className="w-4 h-4 animate-spin" />
								) : (
									<Eye className="w-4 h-4" />
								)}
								<span>Unmask Redirects</span>
							</button>
						</div>
					</div>

					{/* Test Preset Pills */}
					<div className="space-y-2">
						<span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
							Quick Sample Presets:
						</span>
						<div className="flex flex-wrap gap-2">
							{PRESET_URLS.map((preset) => (
								<button
									key={preset.label}
									type="button"
									onClick={() => {
										setInputUrl(preset.url);
										setUnmaskResult(null);
									}}
									className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/80 text-xs font-bold text-slate-700 transition-all cursor-pointer active:scale-95"
									title={preset.description}
								>
									{preset.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Validation Failure Card */}
				{!analysis.isValid && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-rose-50 border border-rose-200/80 rounded-3xl p-6 flex items-start gap-4"
					>
						<ShieldX className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
						<div>
							<h3 className="text-sm font-black text-rose-900 uppercase tracking-wider">
								Invalid or Malformed URL
							</h3>
							<p className="text-xs font-bold text-rose-700 mt-1">
								{analysis.validationError}
							</p>
						</div>
					</motion.div>
				)}

				{/* Threat Analysis Grid */}
				{analysis.isValid && (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
						{/* Left Column: Risk Gauge & Security Flags */}
						<div className="lg:col-span-7 space-y-6">
							{/* Risk Score Hero Card */}
							<div
								className={`border rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-xl ${theme.cardBg}`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<RiskIcon className={`w-8 h-8 ${theme.iconColor}`} />
										<div>
											<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
												Threat Assessment
											</span>
											<h2 className="text-lg font-black text-slate-900 leading-tight">
												{analysis.riskLevel === "SAFE"
													? "No Major Threats Detected"
													: `${analysis.riskLevel} Phishing / Malware Risk`}
											</h2>
										</div>
									</div>

									<div
										className={`px-4 py-2 rounded-2xl ${theme.scoreBg} font-mono font-black text-xl shadow-md`}
									>
										{analysis.riskScore}
										<span className="text-xs font-normal opacity-80">/100</span>
									</div>
								</div>

								{/* Risk Score Progress Track */}
								<div className="space-y-1.5">
									<div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-500">
										<span>0 (Safe)</span>
										<span>Risk Score Gauge</span>
										<span>100 (Critical)</span>
									</div>
									<div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${analysis.riskScore}%` }}
											transition={{ duration: 0.8, ease: "easeOut" }}
											className={`h-full rounded-full ${
												analysis.riskScore >= 75
													? "bg-rose-600"
													: analysis.riskScore >= 50
														? "bg-orange-500"
														: analysis.riskScore >= 25
															? "bg-amber-500"
															: "bg-emerald-500"
											}`}
										/>
									</div>
								</div>

								{/* Unmasked Redirect Result Box */}
								{unmaskResult && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-2"
									>
										<div className="flex items-center gap-2 text-xs font-black text-indigo-700 uppercase">
											<Eye className="w-4 h-4" />
											<span>Unmasked Destination URL</span>
										</div>
										<p className="text-xs font-mono font-bold text-slate-900 break-all bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/80">
											{unmaskResult.unmaskedUrl}
										</p>
										{unmaskResult.redirectChain.length > 1 && (
											<div className="pt-2 space-y-1">
												<span className="text-[10px] font-extrabold uppercase text-slate-400">
													Redirect Hops ({unmaskResult.redirectChain.length - 1}
													):
												</span>
												<div className="space-y-1 text-[11px] font-mono text-slate-600">
													{unmaskResult.redirectChain.map((url, i) => (
														<div
															key={`hop-${url}-${i}`}
															className="flex items-center gap-2"
														>
															<span className="text-[9px] font-bold text-slate-400">
																#{i + 1}
															</span>
															<span className="truncate">{url}</span>
														</div>
													))}
												</div>
											</div>
										)}
									</motion.div>
								)}
							</div>

							{/* Detected Security Flags Breakdown */}
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
								<h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
									<span>Security Indicators & Flags</span>
									<span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-mono">
										{analysis.flags.length} Flagged
									</span>
								</h3>

								{analysis.flags.length === 0 ? (
									<div className="p-6 text-center border-2 border-dashed border-emerald-100 rounded-2xl bg-emerald-50/30 space-y-2">
										<ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
										<p className="text-xs font-bold text-emerald-700">
											Clean URL Structure! No suspicious indicators found.
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{analysis.flags.map((flag) => (
											<div
												key={flag.id}
												className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80 space-y-1"
											>
												<div className="flex items-center justify-between gap-2">
													<div className="flex items-center gap-2">
														<AlertTriangle
															className={`w-4 h-4 ${
																flag.severity === "critical"
																	? "text-rose-600"
																	: flag.severity === "high"
																		? "text-orange-500"
																		: "text-amber-500"
															}`}
														/>
														<h4 className="text-xs font-black text-slate-900">
															{flag.title}
														</h4>
													</div>
													<span
														className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
															flag.severity === "critical"
																? "bg-rose-100 text-rose-800"
																: flag.severity === "high"
																	? "bg-orange-100 text-orange-800"
																	: "bg-amber-100 text-amber-800"
														}`}
													>
														{flag.severity}
													</span>
												</div>
												<p className="text-xs font-medium text-slate-600 leading-relaxed pl-6">
													{flag.description}
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Right Column: Structure & Component Matrix */}
						<div className="lg:col-span-5 space-y-6">
							{/* URL Structure Inspection Box */}
							{analysis.structure && (
								<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
									<h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
										<Layers className="w-4 h-4 text-indigo-600" />
										<span>URL Structural Matrix</span>
									</h3>

									<div className="divide-y divide-slate-100">
										<MatrixRow
											label="Protocol"
											value={analysis.structure.protocol.toUpperCase()}
											badge={
												analysis.structure.protocol === "https"
													? "Encrypted"
													: "Unencrypted"
											}
											icon={
												analysis.structure.protocol === "https" ? Lock : Unlock
											}
										/>
										<MatrixRow
											label="Hostname"
											value={analysis.structure.hostname}
											badge={
												analysis.structure.isIpAddress ? "IP Host" : "Domain"
											}
											icon={Globe}
										/>
										<MatrixRow
											label="Top-Level Domain"
											value={`.${analysis.structure.tld}`}
										/>
										<MatrixRow
											label="Subdomains"
											value={`${analysis.structure.subdomainCount} levels`}
										/>
										<MatrixRow label="Port" value={analysis.structure.port} />
										<MatrixRow
											label="Pathname"
											value={analysis.structure.pathname || "/"}
										/>
									</div>
								</div>
							)}

							{/* Shortener Information Card */}
							{analysis.isShortened && (
								<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
									<h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
										<Link2 className="w-4 h-4 text-indigo-600" />
										<span>Obfuscation Detection</span>
									</h3>
									<p className="text-xs font-bold text-slate-600 leading-relaxed">
										This URL relies on shortener service{" "}
										<span className="text-indigo-600 font-mono">
											'{analysis.shortenerDomain}'
										</span>
										. Shortened links are frequently used in phishing campaigns
										to mask malicious target destinations.
									</p>
									<button
										type="button"
										onClick={handleUnmask}
										disabled={unmasking}
										className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
									>
										{unmasking
											? "Unmasking Target..."
											: "Unmask Final Target URL"}
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</main>
	);
}

interface MatrixRowProps {
	label: string;
	value: string;
	badge?: string;
	icon?: React.ComponentType<{ className?: string }>;
}

function MatrixRow({ label, value, badge, icon: Icon }: MatrixRowProps) {
	return (
		<div className="py-3 flex items-center justify-between gap-3 text-xs">
			<span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
				{label}
			</span>
			<div className="flex items-center gap-2">
				{Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
				<span className="font-mono font-extrabold text-slate-900 truncate max-w-[180px]">
					{value}
				</span>
				{badge && (
					<span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase text-slate-600">
						{badge}
					</span>
				)}
			</div>
		</div>
	);
}
