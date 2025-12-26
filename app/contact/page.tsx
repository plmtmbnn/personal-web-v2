"use client";

import { useEffect, useState } from "react";

const contactLinks = [
	{
		href: "mailto:plmtmbnn@gmail.com",
		label: "Email",
		value: "plmtmbnn@gmail.com",
		accent: "from-red-400 to-orange-400",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
		),
	},
	{
		href: "https://www.linkedin.com/in/polma-tambunan/",
		label: "LinkedIn",
		value: "polma-tambunan",
		accent: "from-blue-400 to-cyan-400",
		icon: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5z" />
			</svg>
		),
	},
	{
		href: "https://github.com/plmtmbnn",
		label: "GitHub",
		value: "@plmtmbnn",
		accent: "from-gray-400 to-gray-600",
		icon: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387" />
			</svg>
		),
	},
];

export default function Contact() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(true);
	}, []);

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-20 relative overflow-hidden">
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-6xl mx-auto space-y-16 relative z-10">
				{/* Header */}
				<div
					className={`text-center space-y-6 transition-all duration-700 opacity-100 translate-y-0`}
				>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						Let’s Connect
					</h2>
					<p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
						Open to conversations about engineering, fintech, and collaboration.
					</p>
				</div>

				{/* Compact contact list */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
					{contactLinks.map(({ href, label, value, icon, accent }, i) => (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={`group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
								visible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-4"
							}`}
							style={{ transitionDelay: `${i * 100}ms` }}
						>
							{/* Left */}
							<div className="flex items-center gap-4">
								<div
									className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${accent} text-white`}
								>
									{icon}
								</div>

								<div className="text-left">
									<p className="font-medium text-foreground">{label}</p>
									<p className="text-sm text-muted-foreground">{value}</p>
								</div>
							</div>

							{/* Arrow */}
							<svg
								className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all"
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
		</section>
	);
}
