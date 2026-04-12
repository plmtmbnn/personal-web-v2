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
	FaArrowLeft,
	FaClock,
	FaGlobeAsia,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import pkg from "@/package.json";
import Link from "next/link";

/**
 * Contact Page
 * Mobile-optimized with refined visual hierarchy and real-time data.
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
			color: "text-rose-400",
			isCopyable: true,
		},
		{
			label: "LinkedIn",
			value: "polma-tambunan",
			icon: FaLinkedin,
			href: SOCIAL_LINKS.linkedin,
			color: "text-blue-400",
		},
		{
			label: "GitHub",
			value: "@plmtmbnn",
			icon: FaGithub,
			href: SOCIAL_LINKS.github,
			color: "text-slate-200",
		},
		{
			label: "Telegram",
			value: "@plmtmbnn",
			icon: FaTelegramPlane,
			href: "https://t.me/plmtmbnn",
			color: "text-sky-400",
		},
	];

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-x-hidden flex flex-col items-center p-6 sm:p-12 pb-32 sm:pb-12">
			{/* Dynamic Background Ambience */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
				<div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-5xl w-full space-y-8 sm:space-y-16 relative z-10">
				{/* Top Navigation - Optimized for mobile tap */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex justify-start"
				>
					<Link
						href="/"
						className="group flex items-center gap-2 py-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors"
					>
						<FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
						Back to Portal
					</Link>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start lg:items-center">
					{/* Left Section: Info & Status - Responsive Hierarchy */}
					<div className="lg:col-span-5 space-y-8 sm:space-y-10">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-4 sm:space-y-6"
						>
							<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
								</span>
								<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-500">
									Available for collaboration
								</span>
							</div>

							<h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground leading-[0.95] sm:leading-[0.9]">
								Let's <span className="gradient-text">Connect.</span>
							</h1>
							<p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-md">
								Interested in building scalable systems or discussing fintech
								innovations? I'm always open to talking tech.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="grid grid-cols-2 lg:grid-cols-1 gap-4 pt-6 border-t border-white/5"
						>
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-accent flex-shrink-0">
									<FaGlobeAsia className="text-sm sm:text-lg" />
								</div>
								<div>
									<p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
										Location
									</p>
									<p className="text-xs sm:text-base font-bold text-foreground">
										Jakarta, ID
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-accent flex-shrink-0">
									<FaClock className="text-sm sm:text-lg" />
								</div>
								<div>
									<p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
										Local Time
									</p>
									<p className="font-mono text-sm sm:text-xl font-bold text-foreground truncate">
										{localTime || "--:--:--"}
									</p>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Right Section: Contact Cards - Compact for mobile */}
					<div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{contactLinks.map((item, index) => (
							<motion.div
								key={item.label}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
								className="group relative"
							>
								<div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-[1.5rem] sm:rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-lg" />

								<div className="relative glass-card p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-white/5 flex flex-col justify-between h-full hover:border-accent/30 transition-all duration-500 bg-white/5 backdrop-blur-xl">
									<div className="flex justify-between items-start mb-4 sm:mb-6">
										<div
											className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-background-secondary border border-white/5 ${item.color} shadow-inner`}
										>
											<item.icon className="text-lg sm:text-xl" />
										</div>

										{item.isCopyable ? (
											<button
												onClick={handleCopyEmail}
												className="p-2 text-muted-foreground hover:text-accent transition-colors"
												title="Copy Email"
											>
												{copied ? (
													<FaCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
												) : (
													<FaRegCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
												)}
											</button>
										) : (
											<a
												href={item.href}
												target="_blank"
												rel="noopener noreferrer"
												className="p-2 text-muted-foreground hover:text-accent transition-colors"
											>
												<FaExternalLinkAlt className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
											</a>
										)}
									</div>

									<div>
										<h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5 sm:mb-1">
											{item.label}
										</h3>
										<a
											href={item.href}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm sm:text-base font-bold text-foreground hover:text-accent transition-colors block truncate"
										>
											{item.value}
										</a>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Footer / Versioning */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
					className="pt-8 sm:pt-12 text-center"
				>
					<div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2 sm:2.5 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md">
						<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 whitespace-nowrap">
							Project Hash: <span className="text-accent">v{version}</span>
						</span>
					</div>
				</motion.div>
			</div>

			{/* Copy Toast Notification - Positioned above Bottom Navigation */}
			<AnimatePresence>
				{copied && (
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="fixed bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto px-6 py-3 bg-emerald-500 text-white rounded-xl sm:rounded-2xl font-bold shadow-2xl shadow-emerald-500/20 z-[100] flex items-center justify-center gap-3"
					>
						<FaCheck className="w-4 h-4" />
						<span className="text-sm sm:text-base">
							Email added to clipboard!
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
