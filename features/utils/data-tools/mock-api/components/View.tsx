"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Plus,
	Trash2,
	Link,
	Play,
	Copy,
	Check,
	Info,
	Shield,
} from "lucide-react";
import CustomModal from "@/features/shared/components/CustomModal";

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
	const [isModalOpen, setIsModalOpen] = useState(false);

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

	const handleSave = async () => {
		setLoading(true);
		try {
			let parsedBody: any;
			try {
				parsedBody = JSON.parse(body);
			} catch (_e) {
				setIsModalOpen(true);
				setLoading(false);
				return;
			}

			const res = await fetch("/api/mock/manage", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					method,
					path,
					status,
					body: parsedBody,
					enableRateLimit,
				}),
			});

			const data = await res.json();
			if (data.success) {
				setLastCreatedUrl(`${window.location.origin}${data.url}`);
				fetchMocks();
				// Clear form on success
				setPath("");
				setMethod("GET");
				setStatus(200);
				setBody('{\n  "message": "Hello World"\n}');
				setEnableRateLimit(false);
			}
		} catch (err) {
			console.error("Save Mock Error:", err);
		} finally {
			setLoading(false);
		}
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
				setMocks(mocks.filter((m) => m.key !== key));
				if (lastCreatedUrl?.includes(key.split(":")[2])) {
					setLastCreatedUrl(null);
				}
			}
		} catch (err) {
			console.error("Delete Mock Error:", err);
		}
	};

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(id);
		setTimeout(() => setCopiedKey(null), 2000);
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
							Dynamic Mock API Engine
						</h1>
						<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
							Create temporary REST endpoints with custom logic.
						</p>
					</div>
					<div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 shrink-0">
						<Info className="w-4 h-4 text-indigo-600" />
						<span>Mocks expire after 1 month of inactivity.</span>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Configuration Form */}
					<div className="lg:col-span-5 space-y-6">
						<div className="bg-white p-6 sm:p-8 border border-slate-200/80 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
							<h2 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-slate-900">
								<Plus className="w-5 h-5 text-indigo-600" />
								New Mock Definition
							</h2>

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
											value={status}
											onChange={(e) => setStatus(parseInt(e.target.value, 10))}
											className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="mock-path"
										className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
									>
										Endpoint Path
									</label>
									<div className="flex">
										<span className="bg-slate-100 border border-r-0 border-slate-200/80 rounded-l-xl px-3.5 py-2.5 text-xs font-bold text-slate-600">
											/api/mock
										</span>
										<input
											id="mock-path"
											type="text"
											value={path}
											onChange={(e) => setPath(e.target.value)}
											placeholder="/v1/users/1"
											className="w-full bg-slate-50/70 border border-slate-200/80 rounded-r-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="mock-body"
										className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
									>
										Response JSON Body
									</label>
									<textarea
										id="mock-body"
										value={body}
										onChange={(e) => setBody(e.target.value)}
										rows={8}
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
									onClick={handleSave}
									disabled={loading || !path}
									className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
								>
									{loading ? (
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
										Endpoint created successfully!
									</p>
									<div
										className="flex items-center gap-2 bg-white border border-emerald-200/80 p-3 rounded-xl group cursor-pointer"
										onClick={() => copyToClipboard(lastCreatedUrl, "last-url")}
									>
										<Link className="w-4 h-4 text-emerald-600 shrink-0" />
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
						<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
							Active Endpoints
							<span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 font-bold">
								{mocks.length}
							</span>
						</h3>

						<div className="space-y-3">
							<AnimatePresence mode="popLayout">
								{mocks.length === 0 ? (
									<motion.div
										initial={reduceMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										className="bg-white border border-dashed border-slate-300 p-12 rounded-[2rem] text-center shadow-xs"
									>
										<p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
											No active mocks. Create one to get started.
										</p>
									</motion.div>
								) : (
									mocks.map((mock) => (
										<motion.div
											layout
											key={mock.key}
											initial={reduceMotion ? false : { opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, scale: 0.95 }}
											className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all group"
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-2">
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
														<Link className="w-3.5 h-3.5" />
														<span className="text-xs font-mono truncate">
															{window.location.origin}/api/mock{mock.path}
														</span>
														{copiedKey === mock.key ? (
															<Check className="w-3.5 h-3.5 text-emerald-600" />
														) : (
															<Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
														)}
													</div>
												</div>
												<div className="flex items-center gap-1.5">
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
														onClick={() => handleDelete(mock.key)}
														className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
														title="Delete Mock"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>
										</motion.div>
									))
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>

			<CustomModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				variant="danger"
				title="Invalid JSON Body"
				description="The response body must be a valid JSON string. Please check your syntax and try again."
				cancelText="Close"
			/>
		</main>
	);
}
