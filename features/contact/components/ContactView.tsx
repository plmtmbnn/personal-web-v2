"use client";

import { useEffect, useState, useMemo } from "react";
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
import {
	Sparkles,
	ArrowUpRight,
	MessageSquare,
	Send,
	Handshake,
	Briefcase,
	Cpu,
	Coffee,
	Zap,
	type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import pkg from "@/package.json";

interface InquiryTopic {
	id: string;
	label: string;
	icon: LucideIcon;
	subject: string;
	body: string;
}

const inquiryTopics: InquiryTopic[] = [
	{
		id: "consulting",
		label: "Consulting & Advisory",
		icon: Handshake,
		subject: "Consulting Inquiry - [Your Name / Company]",
		body: "Hi Polma,\n\nI'm reaching out regarding a potential consulting or technical advisory collaboration.\n\nProject details:\n- Goal:\n- Timeline:\n\nBest regards,\n[Your Name]",
	},
	{
		id: "leadership",
		label: "Engineering Leadership",
		icon: Briefcase,
		subject: "Leadership Opportunity - [Your Company]",
		body: "Hi Polma,\n\nI came across your experience in fintech engineering leadership and would like to discuss an opportunity at [Company Name].\n\nRole context:\n\nBest regards,\n[Your Name]",
	},
	{
		id: "architecture",
		label: "Fintech Core (LOS/LMS)",
		icon: Cpu,
		subject: "Fintech Architecture Discussion - [Your Project]",
		body: "Hi Polma,\n\nWe are exploring / scaling a lending or fintech core platform and would love to consult on architecture and engineering execution.\n\nBest regards,\n[Your Name]",
	},
	{
		id: "chat",
		label: "General Tech Chat",
		icon: Coffee,
		subject: "Connecting from [Your Name] - Tech Chat",
		body: "Hi Polma,\n\nFound your portfolio and wanted to connect to chat about software engineering, system design, and fintech.\n\nCheers,\n[Your Name]",
	},
];

export default function ContactView() {
	const reduceMotion = useReducedMotion();
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [localTime, setLocalTime] = useState("");
	const [relativeTimeDiff, setRelativeTimeDiff] = useState<string>("");
	const [selectedTopic, setSelectedTopic] = useState<InquiryTopic>(
		inquiryTopics[0],
	);
	const [statusChip, setStatusChip] = useState({
		label: "Checking...",
		color: "bg-slate-400",
	});
	const version = pkg.version;

	useEffect(() => {
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
				setStatusChip({ label: "Resting / Offline", color: "bg-slate-400" });
			}

			// Relative timezone calculation
			const userOffsetMinutes = -now.getTimezoneOffset();
			const jakartaOffsetMinutes = 7 * 60;
			const diffHours = Math.round(
				(jakartaOffsetMinutes - userOffsetMinutes) / 60,
			);

			if (diffHours === 0) {
				setRelativeTimeDiff("Same time as you");
			} else if (diffHours > 0) {
				setRelativeTimeDiff(`${diffHours}h ahead of you`);
			} else {
				setRelativeTimeDiff(`${Math.abs(diffHours)}h behind you`);
			}
		};

		updateStatusAndClock();
		const timer = setInterval(updateStatusAndClock, 1000);

		return () => clearInterval(timer);
	}, []);

	const handleCopy = (text: string, key: string) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(key);
		setTimeout(() => setCopiedKey(null), 2000);
	};

	const composedMailto = useMemo(() => {
		const subject = encodeURIComponent(selectedTopic.subject);
		const body = encodeURIComponent(selectedTopic.body);
		return `mailto:${AUTHOR.email}?subject=${subject}&body=${body}`;
	}, [selectedTopic]);

	const contactLinks = [
		{
			key: "email",
			label: "Direct Email",
			value: AUTHOR.email,
			icon: FaEnvelope,
			href: composedMailto,
			color: "text-indigo-600 bg-indigo-50 border-indigo-100",
			isCopyable: true,
			copyValue: AUTHOR.email,
		},
		{
			key: "telegram",
			label: "Telegram",
			value: "@plmtmbnn",
			icon: FaTelegramPlane,
			href: "https://t.me/plmtmbnn",
			color: "text-sky-600 bg-sky-50 border-sky-100",
			isCopyable: true,
			copyValue: "https://t.me/plmtmbnn",
		},
		{
			key: "linkedin",
			label: "LinkedIn",
			value: "polma-tambunan",
			icon: FaLinkedin,
			href: SOCIAL_LINKS.linkedin,
			color: "text-blue-600 bg-blue-50 border-blue-100",
			isCopyable: true,
			copyValue: SOCIAL_LINKS.linkedin,
		},
		{
			key: "github",
			label: "GitHub",
			value: "@plmtmbnn",
			icon: FaGithub,
			href: SOCIAL_LINKS.github,
			color: "text-slate-800 bg-slate-100 border-slate-200",
			isCopyable: true,
			copyValue: SOCIAL_LINKS.github,
		},
	];

	return (
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-2xl w-full space-y-4 sm:space-y-5 relative z-10 my-auto">
				{/* Top Status & Badge Bar */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex flex-wrap items-center justify-between gap-2.5"
				>
					<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
						<Sparkles className="w-3.5 h-3.5 text-indigo-600" />
						<span>Let's Connect & Collaborate</span>
					</div>

					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs text-[11px] font-semibold text-slate-600">
						<div className={`w-2 h-2 rounded-full ${statusChip.color}`} />
						<span>{statusChip.label}</span>
					</div>
				</motion.div>

				{/* Title Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.05 }}
					className="space-y-1.5 sm:space-y-2"
				>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
						Get in <span className="text-indigo-600">Touch.</span>
					</h1>
					<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
						Have an engineering leadership opportunity, fintech core project, or
						technical advisory proposal? Select a topic below or reach out
						directly.
					</p>
				</motion.div>

				{/* Interactive Quick Inquiry Topic Selector */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5"
				>
					<div className="flex items-center justify-between">
						<span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
							<MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
							<span>Quick Inquiry Topic</span>
						</span>
						<a
							href={composedMailto}
							className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
						>
							<span>Compose Draft</span>
							<Send className="w-3 h-3" />
						</a>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{inquiryTopics.map((topic) => {
							const isSelected = selectedTopic.id === topic.id;
							const TopicIcon = topic.icon;
							return (
								<button
									key={topic.id}
									type="button"
									onClick={() => setSelectedTopic(topic)}
									className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
										isSelected
											? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs"
											: "bg-slate-50/60 border-slate-200/70 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
									}`}
								>
									<div
										className={`p-1.5 rounded-lg w-fit ${
											isSelected
												? "bg-indigo-600 text-white"
												: "bg-white border border-slate-200 text-slate-700"
										}`}
									>
										<TopicIcon className="w-3.5 h-3.5" />
									</div>
									<span className="text-[11px] font-bold leading-snug line-clamp-1">
										{topic.label}
									</span>
								</button>
							);
						})}
					</div>
				</motion.div>

				{/* Status & Time Hub */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.15 }}
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
							<p className="text-xs font-bold text-slate-900">
								Toba, Indonesia
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
							<FaClock className="text-xs text-indigo-600" />
						</div>
						<div>
							<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
								Jakarta Time (WIB)
							</p>
							<p className="font-mono text-xs font-bold text-slate-900 truncate">
								{localTime || "--:--:--"}
							</p>
						</div>
					</div>

					<div className="col-span-2 sm:col-span-1 flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 shrink-0">
							<Zap className="w-4 h-4" />
						</div>
						<div>
							<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
								Timezone Offset
							</p>
							<p className="text-xs font-bold text-slate-900 truncate">
								{relativeTimeDiff || "UTC+7"}
							</p>
						</div>
					</div>
				</motion.div>

				{/* Contact Channels Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
					{contactLinks.map((item, index) => (
						<motion.div
							key={item.key}
							initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 + index * 0.04, duration: 0.3 }}
							className="group relative"
						>
							<div className="relative bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between hover:border-indigo-300 hover:shadow-xs transition-all duration-200">
								<div className="flex items-center gap-3 min-w-0 pr-2">
									<div
										className={`p-2 rounded-xl border ${item.color} shrink-0`}
									>
										<item.icon className="text-sm" />
									</div>

									<div className="min-w-0">
										<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
											{item.label}
										</p>
										<a
											href={item.href}
											target={item.key === "email" ? undefined : "_blank"}
											rel={
												item.key === "email" ? undefined : "noopener noreferrer"
											}
											className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate !no-underline"
										>
											{item.value}
										</a>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-1 shrink-0">
									{item.isCopyable && (
										<button
											type="button"
											onClick={() => handleCopy(item.copyValue, item.key)}
											className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
											title={`Copy ${item.label}`}
											aria-label={`Copy ${item.label}`}
										>
											{copiedKey === item.key ? (
												<FaCheck className="w-3.5 h-3.5 text-emerald-600" />
											) : (
												<FaRegCopy className="w-3.5 h-3.5" />
											)}
										</button>
									)}

									<a
										href={item.href}
										target={item.key === "email" ? undefined : "_blank"}
										rel={
											item.key === "email" ? undefined : "noopener noreferrer"
										}
										className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
										title={`Open ${item.label}`}
										aria-label={`Open ${item.label}`}
									>
										<ArrowUpRight className="w-4 h-4" />
									</a>
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
					className="pt-0.5 flex justify-start"
				>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
						<span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
							System Version{" "}
							<span className="text-slate-900 font-extrabold">v{version}</span>
						</span>
					</div>
				</motion.div>
			</div>

			{/* Copy Toast Alert */}
			<AnimatePresence>
				{copiedKey && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-auto px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg z-[100] flex items-center gap-2"
					>
						<FaCheck className="w-3.5 h-3.5 text-emerald-400" />
						<span className="text-xs text-white font-medium">
							Copied to clipboard!
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
