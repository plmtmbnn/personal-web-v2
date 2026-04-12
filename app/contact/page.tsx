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
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import pkg from "@/package.json";

/**
 * Contact Page
 * Features glassmorphism interactive cards and project versioning.
 */
export default function ContactPage() {
	const [mounted, setMounted] = useState(false);
	const [copied, setCopied] = useState(false);
	const version = pkg.version;

	useEffect(() => {
		setMounted(true);
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
			href: "https://t.me/plmtmbnn", // Standard placeholder
			color: "text-sky-400",
		},
	];

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
			{/* Dynamic Background Ambience */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-4xl w-full space-y-12 relative z-10">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center space-y-4"
				>
					<h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground">
						Let's <span className="gradient-text">Connect</span>
					</h1>
					<p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">
						Interested in collaboration or just want to talk about fintech
						engineering? Pick your preferred way to reach out.
					</p>
				</motion.div>

				{/* Contact Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					{contactLinks.map((item, index) => (
						<motion.div
							key={item.label}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.1, duration: 0.5 }}
							className="group relative"
						>
							<div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-xl" />

							<div className="relative glass-card p-8 rounded-[2rem] border-2 border-white/5 flex flex-col justify-between h-full hover:border-accent/30 transition-all duration-500 bg-white/5 backdrop-blur-xl">
								<div className="flex justify-between items-start mb-8">
									<div
										className={`p-4 rounded-2xl bg-background-secondary border border-white/5 ${item.color} shadow-inner`}
									>
										<item.icon className="w-6 h-6" />
									</div>

									{item.isCopyable ? (
										<button
											onClick={handleCopyEmail}
											className="p-2 text-muted-foreground hover:text-accent transition-colors"
											title="Copy Email"
										>
											{copied ? (
												<FaCheck className="w-4 h-4 text-emerald-400" />
											) : (
												<FaRegCopy className="w-4 h-4" />
											)}
										</button>
									) : (
										<a
											href={item.href}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 text-muted-foreground hover:text-accent transition-colors"
										>
											<FaExternalLinkAlt className="w-4 h-4" />
										</a>
									)}
								</div>

								<div>
									<h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
										{item.label}
									</h3>
									<a
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-lg font-bold text-foreground hover:text-accent transition-colors block truncate"
									>
										{item.value}
									</a>
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Footer / Versioning */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
					className="pt-12 text-center"
				>
					<div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md">
						<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
							Build Version: <span className="text-accent">v{version}</span>
						</span>
					</div>
				</motion.div>
			</div>

			{/* Copy Toast Notification */}
			<AnimatePresence>
				{copied && (
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="fixed bottom-32 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold shadow-2xl shadow-emerald-500/20 z-[100] flex items-center gap-3"
					>
						<FaCheck className="w-4 h-4" />
						<span>Email copied to clipboard!</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
