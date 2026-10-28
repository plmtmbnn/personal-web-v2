"use client";

import { useEffect, useState } from "react";
import {
	AlertTriangle,
	CheckCircle2,
	Eye,
	EyeOff,
	Loader2,
	RotateCcw,
	Save,
	Server,
	X,
} from "lucide-react";
import { clearMarketCredentialsAction } from "../actions";
import { useMarketCredentials } from "../hooks/useMarketCredentials";

interface MarketCredentialsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function MarketCredentialsModal({
	isOpen,
	onClose,
}: MarketCredentialsModalProps) {
	const { credentials, loading, saveCredentials } = useMarketCredentials();

	const [baseUrl, setBaseUrl] = useState("");
	const [token, setToken] = useState("");
	const [showToken, setShowToken] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isClearing, setIsClearing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [savedNote, setSavedNote] = useState(false);

	useEffect(() => {
		if (credentials) {
			setBaseUrl(credentials.baseUrl || "");
			setToken(credentials.token || "");
		}
	}, [credentials]);

	useEffect(() => {
		if (!isOpen) {
			setError(null);
			setSavedNote(false);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSavedNote(false);
		setIsSaving(true);

		try {
			const res = await saveCredentials({ baseUrl, token });
			if (!res.success) {
				setError(res.error || "Failed to save credentials");
			} else {
				setSavedNote(true);
				setTimeout(() => {
					setSavedNote(false);
					onClose();
				}, 1200);
			}
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "Failed to save credentials",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleClear = async () => {
		if (
			!confirm(
				"Are you sure you want to remove the API credentials from Redis?",
			)
		) {
			return;
		}

		setIsClearing(true);
		setError(null);
		try {
			await clearMarketCredentialsAction();
			setBaseUrl("");
			setToken("");
			window.dispatchEvent(new CustomEvent("market:credentials:updated"));
			onClose();
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "Failed to clear credentials",
			);
		} finally {
			setIsClearing(false);
		}
	};

	const isConfigured = Boolean(credentials?.baseUrl && credentials?.token);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
			role="dialog"
			aria-modal="true"
			aria-labelledby="credentials-modal-title"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				tabIndex={-1}
			/>

			{/* Modal Container */}
			<div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xl space-y-5 z-10">
				{/* Header */}
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
							<Server className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3
								id="credentials-modal-title"
								className="text-lg font-bold text-slate-900 tracking-tight"
							>
								Market API Credentials
							</h3>
							<p className="text-xs text-slate-500 font-medium">
								Persistent Upstream credentials synced across all market tools
								via Redis
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
						aria-label="Close dialog"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Telemetry Status Strip */}
				<div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-slate-600">Redis Status:</span>
						{loading ? (
							<span className="flex items-center gap-1 text-slate-400 font-medium">
								<Loader2 className="w-3 h-3 animate-spin" /> Checking...
							</span>
						) : isConfigured ? (
							<span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
								<CheckCircle2 className="w-3.5 h-3.5" /> Provider Active
							</span>
						) : (
							<span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
								<AlertTriangle className="w-3.5 h-3.5" /> Not Configured
							</span>
						)}
					</div>

					{credentials?.updatedAt && (
						<span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
							Updated {new Date(credentials.updatedAt).toLocaleDateString()}
						</span>
					)}
				</div>

				{/* Error Notice */}
				{error && (
					<div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
						<AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
						<span>{error}</span>
					</div>
				)}

				{/* Saved Success Notice */}
				{savedNote && (
					<div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
						<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
						<span>
							Credentials saved and synchronized across all market tools!
						</span>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSave} className="space-y-4">
					<div>
						<label
							htmlFor="modal-base-url"
							className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
						>
							Source Base URL
						</label>
						<input
							id="modal-base-url"
							type="text"
							value={baseUrl}
							onChange={(e) => setBaseUrl(e.target.value)}
							placeholder="https://api.source.com"
							required
							disabled={isSaving || isClearing}
							className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all font-mono"
						/>
					</div>

					<div>
						<label
							htmlFor="modal-token"
							className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
						>
							Bearer Token
						</label>
						<div className="relative">
							<input
								id="modal-token"
								type={showToken ? "text" : "password"}
								value={token}
								onChange={(e) => setToken(e.target.value)}
								placeholder="eyJhbGciOi..."
								required
								disabled={isSaving || isClearing}
								className="w-full h-11 pl-3.5 pr-12 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all font-mono"
							/>
							<button
								type="button"
								onClick={() => setShowToken(!showToken)}
								className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
								aria-label={showToken ? "Hide token" : "Show token"}
							>
								{showToken ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>

					{/* Action Triggers */}
					<div className="flex items-center justify-between pt-2">
						{isConfigured ? (
							<button
								type="button"
								onClick={handleClear}
								disabled={isSaving || isClearing}
								className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer min-h-11 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20"
							>
								{isClearing ? (
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
								) : (
									<RotateCcw className="w-3.5 h-3.5" />
								)}
								<span>Clear Redis</span>
							</button>
						) : (
							<div />
						)}

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer min-h-11"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSaving || isClearing}
								className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer min-h-11 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
							>
								{isSaving ? (
									<>
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
										<span>Saving...</span>
									</>
								) : (
									<>
										<Save className="w-3.5 h-3.5" />
										<span>Save to Redis</span>
									</>
								)}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
