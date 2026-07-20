"use client";

import { useEffect, useState } from "react";
import { AUTHOR, SOCIAL_LINKS } from "@/lib/shared/constants";
import {
	FaEnvelope,
	FaLinkedin,
	FaGithub,
	FaTelegramPlane,
	FaRegCopy,
	FaCheck,
	FaClock,
	FaGlobeAsia,
} from "react-icons/fa";
import { Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import pkg from "@/package.json";
import ContactForm from "./ContactForm";

export default function ContactView() {
	const reduceMotion = useReducedMotion();
	const [mounted, setMounted] = useState(false);
	const [copied, setCopied] = useState(false);
	const [localTime, setLocalTime] = useState("");
	const [statusChip, setStatusChip] = useState({
		label: "Checking...",
		color: "bg-slate-400",
	});
	const version = pkg.version;

	useEffect(() => {
		setMounted(true);

		const updateStatusAndClock = () => {
			const now = new Date();

			// Format time in Asia/Jakarta timezone
			const time = new Intl.DateTimeFormat("en-US", {
				timeZone: "Asia/Jakarta",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).format(now);
			setLocalTime(time);

			// Calculate Jakarta Hour (Jakarta is UTC+7)
			const utcHour = now.getUTCHours();
			const jakartaHour = (utcHour + 7 + 24) % 24;

			// Define active hours (8:00 AM to 10:00 PM)
			if (jakartaHour >= 8 && jakartaHour < 22) {
				setStatusChip({ label: "Active & Available", color: "bg-emerald-500" });
			} else {
				setStatusChip({ label: "Resting / Offline", color: "bg-indigo-400" });
			}
		};

		updateStatusAndClock();
		const timer = setInterval(updateStatusAndClock, 1000);

		return () => clearInterval(timer);
	}, []);

	const handleCopyEmail = () => {
		navigator.clipboard.writeText(AUTHOR.email);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const contactLinks = [
		{
			label: "Email",
			value: AUTHOR.email,
			icon: FaEnvelope,
			href: `mailto:${AUTHOR.email}`,
			color: "text-rose-500 bg-rose-50 border-rose-100",
			isCopyable: true,
		},
		{
			label: "LinkedIn",
			value: "polma-tambunan",
			icon: FaLinkedin,
			href: SOCIAL_LINKS.linkedin,
			color: "text-blue-500 bg-blue-50 border-blue-100",
		},
		{
			label: "GitHub",
			value: "@plmtmbnn",
			icon: FaGithub,
			href: SOCIAL_LINKS.github,
			color: "text-slate-800 bg-slate-100 border-slate-200",
		},
		{
			label: "Telegram",
			value: "@plmtmbnn",
			icon: FaTelegramPlane,
			href: "https://t.me/plmtmbnn",
			color: "text-sky-500 bg-sky-50 border-sky-100",
		},
	];

	return (
		<main className="min-h-screen bg-white relative overflow-x-hidden flex items-center justify-center px-6 py-24 lg:py-0">
			<div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start lg:items-center relative z-10">
				{/* ── Left Column: Personal Context & Channels ── */}
				<div className="lg:col-span-6 space-y-8">
					{/* Micro-Interaction Top Badge */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
					>
						<Sparkles className="w-3 h-3 text-slate-500 animate-pulse" />
						Let's Connect
					</motion.div>

					{/* Title Section */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.05 }}
						className="space-y-4"
					>
						<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 leading-[0.95] sm:leading-[0.9]">
							Get in <span className="text-indigo-600">Touch.</span>
						</h1>
						<p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-lg">
							Have an interesting project, collaboration proposal, or just want
							to chat about engineering and fintech? Drop me a line through the
							form or reach out via any preferred channel.
						</p>
					</motion.div>

					{/* Interactive Status & Time Panel */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-3xl bg-slate-50/50 backdrop-blur-md border border-slate-100 shadow-sm"
					>
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
								<FaGlobeAsia className="text-sm text-indigo-500" />
							</div>
							<div>
								<p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
									Location
								</p>
								<p className="text-xs font-bold text-slate-800">Toba, ID</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
								<FaClock className="text-sm text-indigo-500 animate-spin-slow" />
							</div>
							<div>
								<p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
									Local Time
								</p>
								<p className="font-mono text-xs font-bold text-slate-800 truncate">
									{localTime || "--:--:--"}
								</p>
							</div>
						</div>

						<div className="col-span-2 sm:col-span-1 flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm shrink-0 relative">
								<div className={`w-2 h-2 rounded-full ${statusChip.color}`} />
								<div
									className={`absolute w-2 h-2 rounded-full ${statusChip.color} animate-ping opacity-75`}
								/>
							</div>
							<div>
								<p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
									Current Status
								</p>
								<p className="text-xs font-bold text-slate-800">
									{statusChip.label}
								</p>
							</div>
						</div>
					</motion.div>

					{/* Flat Sleek Contact Links (Observer grid layout) */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{contactLinks.map((item, index) => (
							<motion.div
								key={item.label}
								initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.15 + index * 0.05, duration: 0.4 }}
								className="group relative"
							>
								{/* Card Glow */}
								<div className="absolute -inset-0.5 bg-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur-md pointer-events-none" />

								<div className="relative bg-white/60 hover:bg-white backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 flex flex-col justify-between h-full hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
									<div className="flex justify-between items-start mb-3">
										<div
											className={`p-2 rounded-xl border ${item.color} shadow-sm shrink-0`}
										>
											<item.icon className="text-sm" />
										</div>

										{item.isCopyable ? (
											<button
												onClick={handleCopyEmail}
												className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors hover:bg-slate-50 rounded-lg cursor-pointer"
												title="Copy Email"
												aria-label="Copy email address to clipboard"
											>
												{copied ? (
													<FaCheck className="w-3.5 h-3.5 text-emerald-500" />
												) : (
													<FaRegCopy className="w-3.5 h-3.5" />
												)}
											</button>
										) : (
											<a
												href={item.href}
												target="_blank"
												rel="noopener noreferrer"
												className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors hover:bg-slate-50 rounded-lg flex items-center justify-center"
												aria-label={`Open ${item.label} profile in a new tab`}
											>
												<svg
													className="w-3.5 h-3.5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2.5}
														d="M14 5l7 7m0 0l-7 7m7-7H3"
													/>
												</svg>
											</a>
										)}
									</div>

									<div>
										<h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
											{item.label}
										</h3>
										{item.isCopyable ? (
											<button
												onClick={handleCopyEmail}
												className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors block truncate w-full text-left cursor-pointer"
											>
												{item.value}
											</button>
										) : (
											<a
												href={item.href}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors block truncate !no-underline"
											>
												{item.value}
											</a>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</div>

					{/* Version Info */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="pt-2 flex justify-start"
					>
						<div className="inline-flex items-center gap-2.5 px-3.5 py-1 py-1.5 rounded-full bg-slate-50 border border-slate-100/80 shadow-sm">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">
								System Version{" "}
								<span className="text-slate-700 font-bold">v{version}</span>
							</span>
						</div>
					</motion.div>
				</div>

				{/* ── Right Column: Interactive Form ── */}
				<div className="lg:col-span-6 flex justify-center lg:justify-end">
					<ContactForm />
				</div>
			</div>

			{/* Copy Toast Alert */}
			<AnimatePresence>
				{copied && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/10 z-[100] flex items-center justify-center gap-2"
					>
						<FaCheck className="w-3.5 h-3.5 text-white" />
						<span className="text-xs text-white">
							Email copied to clipboard!
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
