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
	ArrowUpRight,
	MessageSquare,
	Send,
	Handshake,
	Briefcase,
	Cpu,
	Coffee,
	type LucideIcon,
} from "lucide-react";
import {
	motion,
	AnimatePresence,
	useReducedMotion,
	type Variants,
} from "framer-motion";
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

const contactLinks = (composedMailto: string) => [
	{
		key: "email",
		label: "Email",
		value: AUTHOR.email,
		icon: FaEnvelope,
		href: composedMailto,
		badgeColor: "bg-indigo-50 border-indigo-100 text-indigo-600",
		isCopyable: true,
		copyValue: AUTHOR.email,
		isEmail: true,
	},
	{
		key: "telegram",
		label: "Telegram",
		value: "@plmtmbnn",
		icon: FaTelegramPlane,
		href: "https://t.me/plmtmbnn",
		badgeColor: "bg-sky-50 border-sky-100 text-sky-600",
		isCopyable: true,
		copyValue: "https://t.me/plmtmbnn",
		isEmail: false,
	},
	{
		key: "linkedin",
		label: "LinkedIn",
		value: "polma-tambunan",
		icon: FaLinkedin,
		href: SOCIAL_LINKS.linkedin,
		badgeColor: "bg-blue-50 border-blue-100 text-blue-600",
		isCopyable: true,
		copyValue: SOCIAL_LINKS.linkedin,
		isEmail: false,
	},
	{
		key: "github",
		label: "GitHub",
		value: "@plmtmbnn",
		icon: FaGithub,
		href: SOCIAL_LINKS.github,
		badgeColor: "bg-slate-100 border-slate-200 text-slate-700",
		isCopyable: true,
		copyValue: SOCIAL_LINKS.github,
		isEmail: false,
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
	const [isActive, setIsActive] = useState(false);
	const version = pkg.version;

	useEffect(() => {
		const updateStatusAndClock = () => {
			const now = new Date();

			const time = new Intl.DateTimeFormat("en-US", {
				timeZone: "Asia/Jakarta",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).format(now);
			setLocalTime(time);

			const utcHour = now.getUTCHours();
			const jakartaHour = (utcHour + 7 + 24) % 24;
			setIsActive(jakartaHour >= 8 && jakartaHour < 22);

			const userOffsetMinutes = -now.getTimezoneOffset();
			const jakartaOffsetMinutes = 7 * 60;
			const diffHours = Math.round(
				(jakartaOffsetMinutes - userOffsetMinutes) / 60,
			);

			if (diffHours === 0) {
				setRelativeTimeDiff("Same timezone");
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

	const channels = contactLinks(composedMailto);

	const containerVariants: Variants = {
		hidden: {},
		visible: { transition: { staggerChildren: 0.05 } },
	};
	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 14 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.38, ease: "easeOut" },
		},
	};

	return (
		<main className="min-h-screen lg:h-screen lg:max-h-[100dvh] bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden overflow-y-auto lg:overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 pb-32 sm:py-24 sm:pb-36 lg:py-0 lg:pb-0">
			<div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10 my-auto">
				{/* ── Left — Identity & Context ────────────────────────── */}
				<motion.div
					className="lg:col-span-5 w-full"
					variants={containerVariants}
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
				>
					{/* Status chip */}
					<motion.div variants={itemVariants} className="mb-6 sm:mb-8">
						<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-[10px] font-semibold text-slate-600 w-fit">
							<span className="relative flex h-2 w-2">
								{isActive && (
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								)}
								<span
									className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
								></span>
							</span>
							{isActive ? "Active & available" : "Resting (offline)"}
						</span>
					</motion.div>

					{/* Headline */}
					<motion.h1
						variants={itemVariants}
						className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5 sm:mb-6"
					>
						Let's build
						<br />
						something worth
						<br />
						shipping.
					</motion.h1>

					{/* Sub-copy */}
					<motion.p
						variants={itemVariants}
						className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed mb-8 sm:mb-10 max-w-sm"
					>
						Engineering leadership, fintech core architecture, technical
						advisory — or just a conversation worth having.
					</motion.p>

					{/* Location + time strip (Reimagined as compact cards) */}
					<motion.div
						variants={itemVariants}
						className="flex flex-col gap-4 max-w-md"
					>
						<div className="grid grid-cols-2 gap-3">
							<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
									<FaGlobeAsia className="w-3.5 h-3.5 text-indigo-500" />
								</div>
								<div className="min-w-0">
									<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate">
										Location
									</p>
									<p className="text-xs font-bold text-slate-800 truncate">
										Toba, ID
									</p>
								</div>
							</div>

							<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
									<FaClock className="w-3.5 h-3.5 text-emerald-500" />
								</div>
								<div className="min-w-0">
									<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate">
										Local Time
									</p>
									<p className="font-mono text-xs font-bold text-slate-800 tabular-nums truncate">
										{localTime || "--:--:--"}
									</p>
								</div>
							</div>
						</div>

						{/* Version pill */}
						<div className="inline-flex items-center gap-1.5 px-1">
							<span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
							<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
								System{" "}
								<span className="text-slate-700 font-extrabold">
									v{version}
								</span>
							</span>
							{relativeTimeDiff && (
								<>
									<span className="text-slate-300 mx-1">/</span>
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
										{relativeTimeDiff}
									</span>
								</>
							)}
						</div>
					</motion.div>
				</motion.div>

				{/* ── Right — Action Panel ──────────────────────────────── */}
				<motion.div
					className="lg:col-span-7 w-full space-y-4 lg:pl-6 mt-12 lg:mt-0"
					initial={reduceMotion ? false : { opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.45,
						delay: 0.1,
						ease: [0.25, 0.1, 0.25, 1],
					}}
				>
					{/* Inquiry topic selector */}
					<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-3">
						<div className="flex items-center justify-between mb-5">
							<span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
								<MessageSquare className="w-4 h-4 text-indigo-500" />
								Inquiry Topic
							</span>
							<a
								href={composedMailto}
								className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-150 !no-underline"
							>
								Compose
								<Send className="w-3 h-3" />
							</a>
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							{inquiryTopics.map((topic) => {
								const isSelected = selectedTopic.id === topic.id;
								const TopicIcon = topic.icon;
								return (
									<button
										key={topic.id}
										type="button"
										onClick={() => setSelectedTopic(topic)}
										className={`group relative overflow-hidden p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col gap-3 ${
											isSelected
												? "bg-slate-900 border-slate-800 shadow-md shadow-slate-900/10"
												: "bg-slate-50/50 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
										}`}
									>
										<div
											className={`p-2 rounded-xl w-fit transition-colors duration-300 ${
												isSelected
													? "bg-white/10"
													: "bg-white border border-slate-200 shadow-xs group-hover:border-slate-300"
											}`}
										>
											<TopicIcon
												className={`w-4 h-4 transition-colors duration-300 ${isSelected ? "text-white" : "text-slate-500 group-hover:text-slate-700"}`}
											/>
										</div>
										<span
											className={`text-[10px] font-bold leading-snug line-clamp-2 transition-colors duration-300 ${
												isSelected
													? "text-white"
													: "text-slate-600 group-hover:text-slate-900"
											}`}
										>
											{topic.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Contact channels */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{channels.map((ch, index) => (
							<motion.div
								key={ch.key}
								initial={reduceMotion ? false : { opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: 0.2 + index * 0.04,
									duration: 0.3,
									ease: [0.25, 0.1, 0.25, 1],
								}}
								className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300"
							>
								<div className="flex items-center gap-3.5 min-w-0 relative z-10">
									<div
										className={`p-2.5 rounded-xl border ${ch.badgeColor} shrink-0`}
									>
										<ch.icon className="w-4 h-4" />
									</div>
									<div className="min-w-0">
										<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
											{ch.label}
										</p>
										<a
											href={ch.href}
											target={ch.isEmail ? undefined : "_blank"}
											rel={ch.isEmail ? undefined : "noopener noreferrer"}
											className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 block truncate !no-underline"
										>
											{ch.value}
										</a>
									</div>
								</div>

								<div className="flex items-center gap-1 pl-2 shrink-0 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
									{ch.isCopyable && (
										<button
											type="button"
											onClick={() => handleCopy(ch.copyValue, ch.key)}
											className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-[color,background-color] duration-150 cursor-pointer"
											aria-label={`Copy ${ch.label}`}
										>
											{copiedKey === ch.key ? (
												<FaCheck className="w-3.5 h-3.5 text-emerald-500" />
											) : (
												<FaRegCopy className="w-3.5 h-3.5" />
											)}
										</button>
									)}
									<a
										href={ch.href}
										target={ch.isEmail ? undefined : "_blank"}
										rel={ch.isEmail ? undefined : "noopener noreferrer"}
										className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-transform duration-300 group-hover:translate-x-0.5 cursor-pointer"
										aria-label={`Open ${ch.label}`}
									>
										<ArrowUpRight className="w-4 h-4" />
									</a>
								</div>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>

			{/* Copy Toast */}
			<AnimatePresence>
				{copiedKey && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 12 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-auto px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg z-[100] flex items-center gap-2"
					>
						<FaCheck className="w-3 h-3 text-emerald-400" />
						<span className="text-xs font-medium">Copied to clipboard</span>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
