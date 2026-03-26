"use client";

import { useEffect, useState } from "react";
import { AUTHOR, SITE, SOCIAL_LINKS } from "@/lib/constants";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

const contactLinks = [
	{
		href: `mailto:${AUTHOR.email}`,
		label: "Email",
		value: AUTHOR.email,
		accent: "from-red-400 to-orange-400",
		icon: <FaEnvelope className="w-5 h-5" />,
	},
	{
		href: SOCIAL_LINKS.linkedin,
		label: "LinkedIn",
		value: "polma-tambunan",
		accent: "from-blue-400 to-cyan-400",
		icon: <FaLinkedin className="w-5 h-5" />,
	},
	{
		href: SOCIAL_LINKS.github,
		label: "GitHub",
		value: "@plmtmbnn",
		accent: "from-gray-400 to-gray-600",
		icon: <FaGithub className="w-5 h-5" />,
	},
	{
		href: SOCIAL_LINKS.twitter,
		label: "X (Twitter)",
		value: "@plmtmbnn",
		accent: "from-blue-500 to-indigo-500",
		icon: <FaTwitter className="w-5 h-5" />,
	},
];

export default function Contact() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(true);
	}, []);

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-20 relative overflow-hidden flex flex-col">
			{/* Subtle Background */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-20 right-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-40 animate-float" />
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto space-y-16 relative z-10 flex-grow">
				{/* Header */}
				<div
					className={`text-center space-y-6 transition-all duration-1000 ${
						visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					}`}
				>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						Let’s Connect
					</h2>
					<p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
						Open to conversations about engineering, fintech, and collaboration.
						Feel free to reach out on any of these platforms.
					</p>
				</div>

				{/* Compact contact list */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
					{contactLinks.map(({ href, label, value, icon, accent }, i) => (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={`group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm px-6 py-5 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
								visible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-8"
							}`}
							style={{ transitionDelay: `${i * 150}ms` }}
						>
							{/* Left */}
							<div className="flex items-center gap-5">
								<div
									className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm group-hover:scale-110 transition-transform`}
								>
									{icon}
								</div>

								<div className="text-left">
									<p className="font-semibold text-foreground text-lg">
										{label}
									</p>
									<p className="text-sm text-muted-foreground font-mono">
										{value}
									</p>
								</div>
							</div>

							{/* Arrow */}
							<svg
								className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					))}
				</div>
			</div>

			{/* Project Version Info */}
			<div
				className={`mt-20 text-center transition-all duration-1000 delay-1000 ${
					visible ? "opacity-100" : "opacity-0"
				}`}
			>
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-mono">
					<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
					<span>v{SITE.version}</span>
				</div>
			</div>
		</section>
	);
}
