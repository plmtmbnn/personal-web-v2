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
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import pkg from "@/package.json";

export default function ContactView() {
	const reduceMotion = useReducedMotion();
	const [_mounted, setMounted] = useState(false);
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
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-2xl w-full space-y-5 sm:space-y-6 relative z-10 my-auto">
				{/* Micro-Interaction Top Badge */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs"
				>
					<Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
					<span>Let's Connect & Collaborate</span>
				</motion.div>

				{/* Title Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.05 }}
					className="space-y-2 sm:space-y-3"
				>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
						Get in <span className="text-indigo-600">Touch.</span>
					</h1>
					<p className="text-xs sm:text-base text-slate-600 font-semibold leading-relaxed max-w-xl">
						Have an interesting project, collaboration proposal, or just want to
						chat about engineering and fintech? Reach out via any preferred
						channel below.
					</p>
				</motion.div>

				{/* Interactive Status & Time Panel */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs"
				>
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
							<FaGlobeAsia className="text-xs text-indigo-600" />
						</div>
						<div>
							<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
								Location
							</p>
							<p className="text-xs font-extrabold text-slate-900">Toba, ID</p>
						</div>
					</div>

					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
							<FaClock className="text-xs text-indigo-600 animate-spin-slow" />
						</div>
						<div>
							<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
								Local Time
							</p>
							<p className="font-mono text-xs font-extrabold text-slate-900 truncate">
								{localTime || "--:--:--"}
							</p>
						</div>
					</div>

					<div className="col-span-2 sm:col-span-1 flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0 relative">
							<div className={`w-2 h-2 rounded-full ${statusChip.color}`} />
							<div
								className={`absolute w-2 h-2 rounded-full ${statusChip.color} animate-ping opacity-75`}
							/>
						</div>
						<div>
							<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
								Current Status
							</p>
							<p className="text-xs font-extrabold text-slate-900 truncate">
								{statusChip.label}
							</p>
						</div>
					</div>
				</motion.div>

				{/* Flat Sleek Contact Links */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
					{contactLinks.map((item, index) => (
						<motion.div
							key={item.label}
							initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.15 + index * 0.05, duration: 0.4 }}
							className="group relative"
						>
							<div className="relative bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between h-full hover:border-slate-300 hover:shadow-xs transition-all duration-300">
								<div className="flex justify-between items-start mb-2.5">
									<div
										className={`p-2 rounded-xl border ${item.color} shrink-0`}
									>
										<item.icon className="text-sm" />
									</div>

									{item.isCopyable ? (
										<button
											onClick={handleCopyEmail}
											className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-lg cursor-pointer active:scale-95"
											title="Copy Email"
											aria-label="Copy email address to clipboard"
										>
											{copied ? (
												<FaCheck className="w-3.5 h-3.5 text-emerald-600" />
											) : (
												<FaRegCopy className="w-3.5 h-3.5" />
											)}
										</button>
									) : (
										<a
											href={item.href}
											target="_blank"
											rel="noopener noreferrer"
											className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer active:scale-95"
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
									<h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
										{item.label}
									</h3>
									{item.isCopyable ? (
										<button
											onClick={handleCopyEmail}
											className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-indigo-600 transition-colors block truncate w-full text-left cursor-pointer"
										>
											{item.value}
										</button>
									) : (
										<a
											href={item.href}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-indigo-600 transition-colors block truncate !no-underline cursor-pointer"
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
					transition={{ delay: 0.35 }}
					className="pt-1 flex justify-start"
				>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
							System Version{" "}
							<span className="text-slate-900 font-extrabold">v{version}</span>
						</span>
					</div>
				</motion.div>
			</div>

			{/* Copy Toast Alert */}
			<AnimatePresence>
				{copied && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 z-[100] flex items-center justify-center gap-2"
					>
						<FaCheck className="w-3.5 h-3.5 text-white" />
						<span className="text-xs text-white font-semibold">
							Email copied to clipboard!
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
