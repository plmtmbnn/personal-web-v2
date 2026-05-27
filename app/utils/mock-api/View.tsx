"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Link, Play, Copy, Check, Info } from "lucide-react";
import CustomModal from "@/features/shared/components/CustomModal";

interface MockDefinition {
	key: string;
	method: string;
	path: string;
	status: number;
	body: any;
}

export default function MockApiView() {
	const [method, setMethod] = useState("GET");
	const [path, setPath] = useState("");
	const [status, setStatus] = useState(200);
	const [body, setBody] = useState('{\n  "message": "Hello World"\n}');
	const [mocks, setMocks] = useState<MockDefinition[]>([]);
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
				body: JSON.stringify({ method, path, status, body: parsedBody }),
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
		<div className="min-h-screen bg-slate-50 p-4 md:p-8">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">
							Dynamic Mock API Engine
						</h1>
						<p className="text-slate-500 mt-1">
							Create temporary REST endpoints with custom logic.
						</p>
					</div>
					<div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
						<Info className="w-4 h-4" />
						<span>Mocks expire after 1 month of inactivity.</span>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Configuration Form */}
					<div className="lg:col-span-5 space-y-6">
						<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
							<h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
								<Plus className="w-5 h-5" />
								New Mock Definition
							</h2>

							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="mock-method"
											className="block text-sm font-medium text-slate-700 mb-1"
										>
											Method
										</label>
										<select
											id="mock-method"
											value={method}
											onChange={(e) => setMethod(e.target.value)}
											className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
											className="block text-sm font-medium text-slate-700 mb-1"
										>
											Status Code
										</label>
										<input
											id="mock-status"
											type="number"
											value={status}
											onChange={(e) => setStatus(parseInt(e.target.value, 10))}
											className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="mock-path"
										className="block text-sm font-medium text-slate-700 mb-1"
									>
										Endpoint Path
									</label>
									<div className="flex">
										<span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg px-3 py-2 text-sm text-slate-500">
											/api/mock
										</span>
										<input
											id="mock-path"
											type="text"
											value={path}
											onChange={(e) => setPath(e.target.value)}
											placeholder="/v1/users/1"
											className="w-full bg-slate-50 border border-slate-200 rounded-r-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="mock-body"
										className="block text-sm font-medium text-slate-700 mb-1"
									>
										Response JSON Body
									</label>
									<textarea
										id="mock-body"
										value={body}
										onChange={(e) => setBody(e.target.value)}
										rows={8}
										className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
									/>
								</div>

								<button
									onClick={handleSave}
									disabled={loading || !path}
									className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
								>
									{loading ? (
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									) : (
										<>
											<Plus className="w-5 h-5" />
											Generate Mock Endpoint
										</>
									)}
								</button>
							</div>
						</div>

						{/* Last Created Success Message */}
						<AnimatePresence>
							{lastCreatedUrl && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="bg-green-50 border border-green-200 p-4 rounded-xl"
								>
									<p className="text-green-800 text-sm font-medium mb-2">
										Endpoint created successfully!
									</p>
									<div
										className="flex items-center gap-2 bg-white border border-green-100 p-3 rounded-lg group cursor-pointer"
										onClick={() => copyToClipboard(lastCreatedUrl, "last-url")}
									>
										<Link className="w-4 h-4 text-green-600 shrink-0" />
										<code className="text-xs text-green-700 truncate flex-1">
											{lastCreatedUrl}
										</code>
										{copiedKey === "last-url" ? (
											<Check className="w-4 h-4 text-green-600" />
										) : (
											<Copy className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
										)}
									</div>
									<div className="mt-3 flex justify-end">
										<a
											href={lastCreatedUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs font-semibold text-green-700 hover:underline flex items-center gap-1"
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
						<h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
							Active Endpoints
							<span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
								{mocks.length}
							</span>
						</h3>

						<div className="space-y-3">
							<AnimatePresence mode="popLayout">
								{mocks.length === 0 ? (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="bg-white border border-dashed border-slate-300 p-12 rounded-xl text-center"
									>
										<p className="text-slate-400 italic">
											No active mocks. Create one to get started.
										</p>
									</motion.div>
								) : (
									mocks.map((mock) => (
										<motion.div
											layout
											key={mock.key}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, scale: 0.95 }}
											className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-2">
														<span
															className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
																mock.method === "GET"
																	? "bg-green-500"
																	: mock.method === "POST"
																		? "bg-blue-500"
																		: mock.method === "PUT"
																			? "bg-amber-500"
																			: mock.method === "DELETE"
																				? "bg-red-500"
																				: "bg-slate-500"
															}`}
														>
															{mock.method}
														</span>
														<span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
															{mock.status}
														</span>
														<span className="text-xs font-mono text-slate-600 truncate">
															/api/mock{mock.path}
														</span>
													</div>
													<div
														className="flex items-center gap-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
														onClick={() =>
															copyToClipboard(
																`${window.location.origin}/api/mock${mock.path}`,
																mock.key,
															)
														}
													>
														<Link className="w-3.5 h-3.5" />
														<span className="text-[11px] truncate">
															{window.location.origin}/api/mock{mock.path}
														</span>
														{copiedKey === mock.key ? (
															<Check className="w-3.5 h-3.5 text-green-500" />
														) : (
															<Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
														)}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<a
														href={`/api/mock${mock.path}`}
														target="_blank"
														rel="noopener noreferrer"
														className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
														title="Quick Preview"
													>
														<Play className="w-4 h-4" />
													</a>
													<button
														onClick={() => handleDelete(mock.key)}
														className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
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
		</div>
	);
}
