"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Plus,
	Trash2,
	Link as LinkIcon,
	Play,
	Copy,
	Check,
	Shield,
	AlertTriangle,
	Edit2,
	RotateCcw,
	Search,
	Code2,
	RefreshCw,
} from "lucide-react";
import CustomModal from "@/features/shared/components/CustomModal";
import UtilHeader from "@/features/utils/components/UtilHeader";

export const MAX_ENDPOINTS = 15;

const STATUS_PRESETS = [
	{ code: 200, label: "200 OK" },
	{ code: 201, label: "201 Created" },
	{ code: 400, label: "400 Bad Request" },
	{ code: 401, label: "401 Unauthorized" },
	{ code: 404, label: "404 Not Found" },
	{ code: 500, label: "500 Server Error" },
];

interface MockDefinition {
	key: string;
	method: string;
	path: string;
	status: number;
	body: any;
	enableRateLimit?: boolean;
}

export default function MockApiView() {
	const reduceMotion = useReducedMotion();
	const [method, setMethod] = useState("GET");
	const [path, setPath] = useState("");
	const [status, setStatus] = useState(200);
	const [body, setBody] = useState('{\n  "message": "Hello World"\n}');
	const [mocks, setMocks] = useState<MockDefinition[]>([]);
	const [enableRateLimit, setEnableRateLimit] = useState(false);
	const [loading, setLoading] = useState(false);
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [lastCreatedUrl, setLastCreatedUrl] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [touched, setTouched] = useState(false);

	// Modal State
	const [modalConfig, setModalConfig] = useState<{
		isOpen: boolean;
		title: string;
		description: string;
		variant: "danger" | "warning" | "info" | "success";
		onConfirm?: () => void;
		confirmText?: string;
		cancelText?: string;
	}>({
		isOpen: false,
		title: "",
		description: "",
		variant: "info",
	});

	const fetchMocks = useCallback(async () => {
		try {
			const res = await fetch("/api/mock/manage");
			const data = await res.json();
			setMocks(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Fetch Mocks Error:", err);
		}
	}, []);

	useEffect(() => {
		fetchMocks();
	}, [fetchMocks]);

	// Path Normalization & Computations
	const trimmedPath = path.trim();
	const normalizedPath = useMemo(() => {
		if (!trimmedPath) return "";
		return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
	}, [trimmedPath]);

	// Validation helpers
	const pathValidationError = useMemo(() => {
		if (!trimmedPath) return "Endpoint path is required";
		if (normalizedPath === "/") {
			return "Endpoint path cannot be root '/'. Provide a descriptive subpath (e.g. /v1/users)";
		}
		if (normalizedPath.length > 100) {
			return "Endpoint path is too long (maximum 100 characters)";
		}
		if (/\s/.test(normalizedPath)) {
			return "Endpoint path cannot contain spaces";
		}
		if (/[?#]/.test(normalizedPath)) {
			return "Endpoint path cannot contain query parameters (?) or fragments (#)";
		}
		if (normalizedPath.includes("//")) {
			return "Endpoint path cannot contain consecutive slashes (//)";
		}
		const validPathRegex = /^\/[a-zA-Z0-9_\-/]+$/;
		if (!validPathRegex.test(normalizedPath)) {
			return "Path can only contain letters, numbers, hyphens (-), underscores (_), and slashes (/)";
		}
		return null;
	}, [trimmedPath, normalizedPath]);

	const statusValidationError = useMemo(() => {
		if (!Number.isInteger(status) || status < 100 || status > 599) {
			return "Status code must be an integer between 100 and 599";
		}
		return null;
	}, [status]);

	// Existing endpoint check: allows updates without consuming an active endpoint slot
	const isExistingEndpoint = useMemo(() => {
		if (!normalizedPath) return false;
		return mocks.some(
			(m) =>
				m.method.toUpperCase() === method.toUpperCase() &&
				m.path.toLowerCase() === normalizedPath.toLowerCase(),
		);
	}, [mocks, method, normalizedPath]);

	const isAtCapacity = mocks.length >= MAX_ENDPOINTS;
	const isBlockedByLimit = isAtCapacity && !isExistingEndpoint;
	const remainingSlots = Math.max(0, MAX_ENDPOINTS - mocks.length);

	const handleResetForm = () => {
		setMethod("GET");
		setPath("");
		setStatus(200);
		setBody('{\n  "message": "Hello World"\n}');
		setEnableRateLimit(false);
		setTouched(false);
	};

	const handleEditMock = (mock: MockDefinition) => {
		setMethod(mock.method);
		setPath(mock.path);
		setStatus(mock.status);
		setBody(
			typeof mock.body === "string"
				? mock.body
				: JSON.stringify(mock.body, null, 2),
		);
		setEnableRateLimit(Boolean(mock.enableRateLimit));
		setTouched(true);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleFormatJson = () => {
		try {
			const parsed = JSON.parse(body);
			setBody(JSON.stringify(parsed, null, 2));
		} catch (e: any) {
			setModalConfig({
				isOpen: true,
				title: "Invalid JSON Syntax",
				description: `Cannot format JSON: ${e?.message || "Check your JSON syntax and try again."}`,
				variant: "danger",
				cancelText: "Dismiss",
			});
		}
	};

	const handleSave = async () => {
		setTouched(true);

		if (pathValidationError) {
			setModalConfig({
				isOpen: true,
				title: "Invalid Endpoint Path",
				description: pathValidationError,
				variant: "warning",
				cancelText: "Close",
			});
			return;
		}

		if (statusValidationError) {
			setModalConfig({
				isOpen: true,
				title: "Invalid Status Code",
				description: statusValidationError,
				variant: "warning",
				cancelText: "Close",
			});
			return;
		}

		if (isBlockedByLimit) {
			setModalConfig({
				isOpen: true,
				title: "Endpoint Limit Reached",
				description: `Maximum limit of ${MAX_ENDPOINTS} active endpoints reached. Please delete an existing mock from the active list before deploying a new one.`,
				variant: "warning",
				cancelText: "Got it",
			});
			return;
		}

		let parsedBody: any;
		try {
			parsedBody = JSON.parse(body);
		} catch (e: any) {
			setModalConfig({
				isOpen: true,
				title: "Invalid JSON Body",
				description: `The response body must be a valid JSON string: ${e?.message || "Check your syntax and try again."}`,
				variant: "danger",
				cancelText: "Close",
			});
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/mock/manage", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					method,
					path: normalizedPath,
					status,
					body: parsedBody,
					enableRateLimit,
				}),
			});

			const data = await res.json();
			if (!res.ok || !data.success) {
				setModalConfig({
					isOpen: true,
					title:
						data.code === "LIMIT_REACHED"
							? "Endpoint Limit Reached"
							: "Validation Error",
					description:
						data.error || "Failed to deploy mock endpoint. Please try again.",
					variant: "danger",
					cancelText: "Close",
				});
				return;
			}

			setLastCreatedUrl(`${window.location.origin}${data.url}`);
			await fetchMocks();
			handleResetForm();
		} catch (err) {
			console.error("Save Mock Error:", err);
			setModalConfig({
				isOpen: true,
				title: "Network Error",
				description:
					"Failed to communicate with mock API manager. Please try again.",
				variant: "danger",
				cancelText: "Close",
			});
		} finally {
			setLoading(false);
		}
	};

	const confirmDelete = (mock: MockDefinition) => {
		setModalConfig({
			isOpen: true,
			title: "Delete Mock Endpoint",
			description: `Are you sure you want to delete "${mock.method} ${mock.path}"? This will free up 1 slot in your active endpoint quota.`,
			variant: "danger",
			confirmText: "Delete",
			cancelText: "Cancel",
			onConfirm: () => handleDelete(mock.key),
		});
	};

	const handleDelete = async (key: string) => {
		try {
			const res = await fetch(
				`/api/mock/manage?key=${encodeURIComponent(key)}`,
				{
					method: "DELETE",
				},
			);
			if (res.ok) {
				setMocks((prev) => prev.filter((m) => m.key !== key));
				if (lastCreatedUrl?.includes(key.split(":")[2])) {
					setLastCreatedUrl(null);
				}
			}
		} catch (err) {
			console.error("Delete Mock Error:", err);
		} finally {
			setModalConfig((prev) => ({ ...prev, isOpen: false }));
		}
	};

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(id);
		setTimeout(() => setCopiedKey(null), 2000);
	};

	// Filtered active mocks
	const filteredMocks = useMemo(() => {
		if (!searchQuery.trim()) return mocks;
		const q = searchQuery.toLowerCase().trim();
		return mocks.filter(
			(m) =>
				m.path.toLowerCase().includes(q) ||
				m.method.toLowerCase().includes(q) ||
				String(m.status).includes(q),
		);
	}, [mocks, searchQuery]);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
				<UtilHeader
					title="Dynamic Mock API Engine"
					description="Create temporary REST endpoints with custom payloads, HTTP codes, and rate limiting."
					category={{
						label: "Development & Code",
						sublabel: "rest api sandbox",
						color: "indigo",
					}}
					icon={Play}
					badges={
						<div className="flex items-center gap-2 flex-wrap">
							<div
								className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
									isAtCapacity
										? "bg-rose-50 border-rose-200/80 text-rose-700"
										: mocks.length >= 12
											? "bg-amber-50 border-amber-200/80 text-amber-700"
											: "bg-slate-100 border-slate-200/80 text-slate-700"
								}`}
							>
								<span
									className={`w-1.5 h-1.5 rounded-full ${
										isAtCapacity
											? "bg-rose-500 animate-pulse"
											: mocks.length >= 12
												? "bg-amber-500"
												: "bg-emerald-500"
									}`}
								/>
								Quota: {mocks.length} / {MAX_ENDPOINTS} Active
							</div>
							<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100/80 rounded-full text-xs font-bold text-amber-700">
								<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
								TTL: 30 Days Inactivity
							</div>
						</div>
					}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Configuration Form */}
					<div className="lg:col-span-5 space-y-6">
						<div className="bg-white p-6 sm:p-8 border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
							<div className="flex items-center justify-between gap-2 mb-4">
								<h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-900">
									{isExistingEndpoint ? (
										<RefreshCw className="w-5 h-5 text-indigo-600 animate-spin-reverse" />
									) : (
										<Plus className="w-5 h-5 text-indigo-600" />
									)}
									<span>
										{isExistingEndpoint
											? "Update Endpoint"
											: "New Mock Definition"}
									</span>
								</h2>
								{isExistingEndpoint && (
									<button
										type="button"
										onClick={handleResetForm}
										className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
										title="Switch to new endpoint template"
									>
										<RotateCcw className="w-3.5 h-3.5" />
										Reset
									</button>
								)}
							</div>

							{/* Overwrite or Capacity Info Banners */}
							{isExistingEndpoint ? (
								<div className="mb-4 p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between gap-2">
									<div className="flex items-center gap-2 min-w-0">
										<span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
										<p className="text-xs font-semibold text-indigo-900 truncate">
											Editing{" "}
											<code className="font-bold font-mono">
												{method} {normalizedPath}
											</code>{" "}
											(overwrites)
										</p>
									</div>
									<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 shrink-0">
										Slot Preserved
									</span>
								</div>
							) : isBlockedByLimit ? (
								<div className="mb-4 p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl flex items-start gap-2.5">
									<AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
									<div className="text-xs text-rose-900 leading-relaxed">
										<p className="font-bold">Active Limit Reached (15 / 15)</p>
										<p className="mt-0.5 text-rose-700">
											Maximum quota reached. Delete an existing endpoint or
											modify an active path to publish updates.
										</p>
									</div>
								</div>
							) : null}

							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="mock-method"
											className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
										>
											Method
										</label>
										<select
											id="mock-method"
											value={method}
											onChange={(e) => setMethod(e.target.value)}
											className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none cursor-pointer"
										>
											{["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
												<option key={m} value={m}>
													{m}
												</option>
											))}
										</select>
									</div>
									<div>
										<label
											htmlFor="mock-status"
											className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
										>
											Status Code
										</label>
										<input
											id="mock-status"
											type="number"
											min={100}
											max={599}
											value={status}
											onChange={(e) =>
												setStatus(parseInt(e.target.value, 10) || 0)
											}
											className={`w-full bg-slate-50/70 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 outline-none ${
												statusValidationError && touched
													? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
													: "border-slate-200/80 focus:border-indigo-500 focus:ring-indigo-500/10"
											}`}
										/>
									</div>
								</div>

								{/* Status Presets */}
								<div>
									<div className="flex flex-wrap gap-1.5">
										{STATUS_PRESETS.map((preset) => (
											<button
												key={preset.code}
												type="button"
												onClick={() => setStatus(preset.code)}
												className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
													status === preset.code
														? "bg-slate-900 text-white border-slate-900"
														: "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80"
												}`}
											>
												{preset.label}
											</button>
										))}
									</div>
									{statusValidationError && touched && (
										<p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
											<AlertTriangle className="w-3 h-3 shrink-0" />
											{statusValidationError}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="mock-path"
										className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
									>
										Endpoint Path
									</label>
									<div className="flex">
										<span className="bg-slate-100 border border-r-0 border-slate-200/80 rounded-l-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 shrink-0">
											/api/mock
										</span>
										<input
											id="mock-path"
											type="text"
											value={path}
											onChange={(e) => {
												setPath(e.target.value);
												if (!touched) setTouched(true);
											}}
											placeholder="/v1/users/1"
											className={`w-full bg-slate-50/70 border rounded-r-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 outline-none font-mono ${
												pathValidationError && touched && trimmedPath
													? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
													: "border-slate-200/80 focus:border-indigo-500 focus:ring-indigo-500/10"
											}`}
										/>
									</div>
									{pathValidationError && touched && trimmedPath && (
										<p className="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
											<AlertTriangle className="w-3 h-3 shrink-0" />
											{pathValidationError}
										</p>
									)}
								</div>

								<div>
									<div className="flex items-center justify-between mb-1.5">
										<label
											htmlFor="mock-body"
											className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
										>
											Response JSON Body
										</label>
										<button
											type="button"
											onClick={handleFormatJson}
											className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
										>
											<Code2 className="w-3 h-3" />
											Format JSON
										</button>
									</div>
									<textarea
										id="mock-body"
										value={body}
										onChange={(e) => setBody(e.target.value)}
										rows={7}
										className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 text-xs font-mono focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none resize-none text-slate-900"
									/>
								</div>

								<div className="flex items-start gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
									<input
										id="enable-rate-limit"
										type="checkbox"
										checked={enableRateLimit}
										onChange={(e) => setEnableRateLimit(e.target.checked)}
										className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
									/>
									<div
										className="flex flex-col cursor-pointer"
										onClick={() => setEnableRateLimit(!enableRateLimit)}
									>
										<label
											htmlFor="enable-rate-limit"
											className="text-xs font-bold text-slate-900 cursor-pointer select-none"
										>
											Enable Rate Limiter
										</label>
										<span className="text-[11px] font-semibold text-slate-500 select-none">
											Limit requests to 10 requests per 10 seconds per IP
											address to prevent abuse.
										</span>
									</div>
								</div>

								<button
									type="button"
									onClick={handleSave}
									disabled={
										loading ||
										!trimmedPath ||
										Boolean(pathValidationError) ||
										Boolean(statusValidationError) ||
										isBlockedByLimit
									}
									className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer ${
										isBlockedByLimit
											? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-75"
											: isExistingEndpoint
												? "bg-indigo-600 hover:bg-indigo-700 text-white"
												: "bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white"
									}`}
								>
									{loading ? (
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									) : isBlockedByLimit ? (
										<>
											<AlertTriangle className="w-4 h-4 text-amber-500" />
											<span>Active Limit Reached (15/15)</span>
										</>
									) : isExistingEndpoint ? (
										<>
											<RefreshCw className="w-4 h-4" />
											<span>Update Mock Endpoint</span>
										</>
									) : (
										<>
											<Plus className="w-4 h-4" />
											<span>Generate Mock Endpoint</span>
										</>
									)}
								</button>
							</div>
						</div>

						{/* Last Created Success Message */}
						<AnimatePresence>
							{lastCreatedUrl && (
								<motion.div
									initial={reduceMotion ? false : { opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-xs"
								>
									<p className="text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
										Endpoint deployed successfully!
									</p>
									<div
										className="flex items-center gap-2 bg-white border border-emerald-200/80 p-3 rounded-xl group cursor-pointer"
										onClick={() => copyToClipboard(lastCreatedUrl, "last-url")}
									>
										<LinkIcon className="w-4 h-4 text-emerald-600 shrink-0" />
										<code className="text-xs font-mono text-emerald-900 truncate flex-1">
											{lastCreatedUrl}
										</code>
										{copiedKey === "last-url" ? (
											<Check className="w-4 h-4 text-emerald-600" />
										) : (
											<Copy className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
										)}
									</div>
									<div className="mt-3 flex justify-end">
										<a
											href={lastCreatedUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer !no-underline"
										>
											<Play className="w-3 h-3" /> Test in New Tab
										</a>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Active Mocks List */}
					<div className="lg:col-span-7 space-y-4">
						<div className="bg-white p-5 sm:p-6 border border-slate-200/80 rounded-[2rem] shadow-xs space-y-4">
							<div className="flex items-center justify-between gap-3 flex-wrap">
								<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
									Active Endpoints
									<span
										className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${
											isAtCapacity
												? "bg-rose-50 text-rose-700 border-rose-200"
												: "bg-slate-100 text-slate-700 border-slate-200/80"
										}`}
									>
										{mocks.length} / {MAX_ENDPOINTS}
									</span>
								</h3>

								{isAtCapacity ? (
									<span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider flex items-center gap-1">
										<span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
										Max Capacity
									</span>
								) : (
									<span className="text-[11px] font-semibold text-slate-500">
										{remainingSlots} {remainingSlots === 1 ? "slot" : "slots"}{" "}
										remaining
									</span>
								)}
							</div>

							{/* Quota Progress Meter */}
							<div className="space-y-1">
								<div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
									<div
										className={`h-full transition-all duration-300 ${
											isAtCapacity
												? "bg-rose-500"
												: mocks.length >= 12
													? "bg-amber-500"
													: "bg-indigo-600"
										}`}
										style={{
											width: `${Math.min(
												100,
												(mocks.length / MAX_ENDPOINTS) * 100,
											)}%`,
										}}
									/>
								</div>
								<div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
									<span>0 Mocks</span>
									<span>Cap: {MAX_ENDPOINTS} Endpoints</span>
								</div>
							</div>

							{/* Search filter if >= 3 mocks */}
							{mocks.length >= 3 && (
								<div className="relative">
									<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Filter endpoints by path or method..."
										className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl pl-10 pr-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none"
									/>
								</div>
							)}
						</div>

						<div className="space-y-3">
							<AnimatePresence mode="popLayout">
								{mocks.length === 0 ? (
									<motion.div
										initial={reduceMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										className="bg-white border border-dashed border-slate-300 p-12 rounded-[2rem] text-center shadow-xs"
									>
										<p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
											No active mocks. Create one to get started (up to{" "}
											{MAX_ENDPOINTS} endpoints).
										</p>
									</motion.div>
								) : filteredMocks.length === 0 ? (
									<motion.div
										initial={reduceMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										className="bg-white border border-dashed border-slate-300 p-8 rounded-2xl text-center shadow-xs"
									>
										<p className="text-slate-500 font-semibold text-xs">
											No endpoints match "{searchQuery}".
										</p>
									</motion.div>
								) : (
									filteredMocks.map((mock) => {
										const isCurrentlyEditing =
											mock.method.toUpperCase() === method.toUpperCase() &&
											mock.path.toLowerCase() === normalizedPath.toLowerCase();

										return (
											<motion.div
												layout
												key={mock.key}
												initial={reduceMotion ? false : { opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, scale: 0.95 }}
												className={`bg-white border p-5 rounded-2xl shadow-xs hover:shadow-md transition-all group ${
													isCurrentlyEditing
														? "border-indigo-500/80 ring-2 ring-indigo-500/10"
														: "border-slate-200/80"
												}`}
											>
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-2 flex-wrap">
															<span
																className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white ${
																	mock.method === "GET"
																		? "bg-emerald-600"
																		: mock.method === "POST"
																			? "bg-indigo-600"
																			: mock.method === "PUT"
																				? "bg-amber-600"
																				: mock.method === "DELETE"
																					? "bg-rose-600"
																					: "bg-slate-600"
																}`}
															>
																{mock.method}
															</span>
															<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
																{mock.status}
															</span>
															{mock.enableRateLimit && (
																<span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
																	<Shield className="w-3 h-3 text-amber-600" />
																	Rate Limited
																</span>
															)}
															{isCurrentlyEditing && (
																<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
																	Currently Selected
																</span>
															)}
															<span className="text-xs font-mono font-bold text-slate-800 truncate">
																/api/mock{mock.path}
															</span>
														</div>
														<div
															className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"
															onClick={() =>
																copyToClipboard(
																	`${window.location.origin}/api/mock${mock.path}`,
																	mock.key,
																)
															}
														>
															<LinkIcon className="w-3.5 h-3.5 shrink-0" />
															<span className="text-xs font-mono truncate">
																{window.location.origin}/api/mock{mock.path}
															</span>
															{copiedKey === mock.key ? (
																<Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
															) : (
																<Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 shrink-0" />
															)}
														</div>
													</div>
													<div className="flex items-center gap-1.5 shrink-0">
														<button
															type="button"
															onClick={() => handleEditMock(mock)}
															className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
															title="Edit or Update Endpoint"
														>
															<Edit2 className="w-4 h-4" />
														</button>
														<a
															href={`/api/mock${mock.path}`}
															target="_blank"
															rel="noopener noreferrer"
															className="p-2 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
															title="Quick Preview"
														>
															<Play className="w-4 h-4" />
														</a>
														<button
															type="button"
															onClick={() => confirmDelete(mock)}
															className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
															title="Delete Mock (frees 1 slot)"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												</div>
											</motion.div>
										);
									})
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>

			<CustomModal
				isOpen={modalConfig.isOpen}
				onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
				variant={modalConfig.variant}
				title={modalConfig.title}
				description={modalConfig.description}
				confirmText={modalConfig.confirmText}
				cancelText={modalConfig.cancelText || "Close"}
				onConfirm={modalConfig.onConfirm}
			/>
		</main>
	);
}
