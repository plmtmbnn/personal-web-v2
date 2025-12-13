"use client";

import { useState, useEffect } from "react";

const contactLinks = [
	{
		href: "mailto:plmtmbnn@gmail.com",
		label: "Email",
		icon: (
			<svg
				className="w-7 h-7"
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
		description: "plmtmbnn@gmail.com",
		accent: "from-red-400 to-orange-400",
		hoverBg: "hover:bg-red-50",
	},
	{
		href: "https://www.linkedin.com/in/polma-tambunan/",
		label: "LinkedIn",
		icon: (
			<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
				<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
			</svg>
		),
		description: "Connect professionally",
		accent: "from-blue-400 to-cyan-400",
		hoverBg: "hover:bg-blue-50",
	},
	{
		href: "https://github.com/plmtmbnn",
		label: "GitHub",
		icon: (
			<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
			</svg>
		),
		description: "View open-source work",
		accent: "from-gray-400 to-gray-600",
		hoverBg: "hover:bg-gray-50",
	},
];

export default function Contact() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section
			id="contact"
			className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-20 relative overflow-hidden"
		>
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-5xl w-full text-center relative z-10">
				{/* Header */}
				<div
					className={`mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
				>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
						Let's Connect
					</h2>
					<p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
						Open to discussing engineering leadership, fintech systems,
						collaboration, or new opportunities.
					</p>
				</div>

				{/* Contact Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					{contactLinks.map(
						({ href, label, icon, description, accent, hoverBg }, i) => (
							<div
								key={label}
								className={`transition-all duration-700 delay-${(i + 2) * 100} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
							>
								<a
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={label}
									className="group block h-full"
								>
									<div
										className={`relative h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${hoverBg}`}
									>
										{/* Accent bar */}
										<div
											className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${accent}`}
										/>

										{/* Icon */}
										<div
											className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${accent} text-white mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110`}
										>
											{icon}
										</div>

										{/* Text */}
										<h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-blue-600 transition-colors duration-300">
											{label}
										</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{description}
										</p>

										{/* Subtle Arrow Indicator */}
										<div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
											<svg
												className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform duration-300"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 7l5 5m0 0l-5 5m5-5H6"
												/>
											</svg>
										</div>
									</div>
								</a>
							</div>
						),
					)}
				</div>
			</div>
		</section>
	);
}
