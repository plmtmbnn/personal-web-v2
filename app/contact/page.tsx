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
	FaExternalLinkAlt,
	FaClock,
	FaGlobeAsia,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import pkg from "@/package.json";

/**
 * Contact Page
 * Highly polished above-the-fold layout for desktop, responsive and touch-optimized.
 */
export default function ContactPage() {
	const [mounted, setMounted] = useState(false);
	const [copied, setCopied] = useState(false);
	const [localTime, setLocalTime] = useState("");
	const version = pkg.version;

	useEffect(() => {
		setMounted(true);

		const timer = setInterval(() => {
			const time = new Intl.DateTimeFormat("en-US", {
				timeZone: "Asia/Jakarta",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).format(new Date());
			setLocalTime(time);
		}, 1000);

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
			color: "text-rose-500",
			isCopyable: true,
		},
		{
			label: "LinkedIn",
			value: "polma-tambunan",
			icon: FaLinkedin,
			href: SOCIAL_LINKS.linkedin,
			color: "text-blue-500",
		},
		{
			label: "GitHub",
			value: "@plmtmbnn",
			icon: FaGithub,
			href: SOCIAL_LINKS.github,
			color: "text-slate-800",
		},
		{
			label: "Telegram",
			value: "@plmtmbnn",
			icon: FaTelegramPlane,
			href: "https://t.me/plmtmbnn",
			color: "text-sky-500",
		},
	];

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-x-hidden flex flex-col items-center justify-start lg:justify-center p-6 sm:p-12 pb-32 lg:pb-0 lg:py-0">
			{/* Dynamic Background Ambience */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
				<div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-5xl w-full space-y-6 sm:space-y-12 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start lg:items-center">
					{/* Left Section: Info & Status */}
					<div className="lg:col-span-5 space-y-6 sm:space-y-8">
						<motion.div
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="space-y-3 sm:space-y-4"
						>
							<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground leading-[0.95] sm:leading-[0.9]">
								Let's <span className="gradient-text">Connect.</span>
							</h1>
							<p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed max-w-sm">
								Interested in building scalable systems or discussing fintech
								innovations? I'm always open to talking tech.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.15 }}
							className="grid grid-cols-2 lg:grid-cols-1 gap-4 pt-5 border-t border-slate-100"
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-accent flex-shrink-0 border border-slate-100 shadow-sm">
									<FaGlobeAsia className="text-xs" />
								</div>
								<div>
									<p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
										Location
									</p>
									<p className="text-xs font-bold text-slate-800">Toba</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-accent flex-shrink-0 border border-slate-100 shadow-sm">
									<FaClock className="text-xs" />
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
						</motion.div>

						{/* Versioning */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="pt-2 flex justify-start"
						>
							<div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
								<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">
									Version <span className="text-slate-800">v{version}</span>
								</span>
							</div>
						</motion.div>
					</div>

					{/* Right Section: Contact Cards */}
					<div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
						{contactLinks.map((item, index) => (
							<motion.div
								key={item.label}
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
								className="group relative"
							>
								{/* Subtle outer glow on card hover */}
								<div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 to-purple-500/10 rounded-[1.8rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-md" />

								<div className="relative glass-card p-5 sm:p-6 rounded-[1.8rem] border border-slate-200/50 flex flex-col justify-between h-full hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-slate-100 bg-white/70 backdrop-blur-md">
									<div className="flex justify-between items-start mb-4 sm:mb-5">
										<div
											className={`p-2.5 rounded-lg bg-slate-50 border border-slate-100 ${item.color} shadow-sm`}
										>
											<item.icon className="text-sm" />
										</div>

										{item.isCopyable ? (
											<button
												onClick={handleCopyEmail}
												className="p-1.5 text-slate-400 hover:text-accent transition-colors hover:bg-slate-50 rounded-lg"
												title="Copy Email"
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
												className="p-1.5 text-slate-400 hover:text-accent transition-colors hover:bg-slate-50 rounded-lg"
											>
												<FaExternalLinkAlt className="w-2.5 h-2.5" />
											</a>
										)}
									</div>

									<div>
										<h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
											{item.label}
										</h3>
										<a
											href={item.href}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm font-bold text-slate-800 hover:text-accent transition-colors block truncate"
										>
											{item.value}
										</a>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Copy Toast Notification */}
			<AnimatePresence>
				{copied && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/10 z-[100] flex items-center justify-center gap-2"
					>
						<FaCheck className="w-3.5 h-3.5" />
						<span className="text-xs">Email added to clipboard!</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
