"use client";

import { Fade } from "react-awesome-reveal";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";

const contactLinks = [
	{
		href: "mailto:plmtmbnn@gmail.com",
		label: "Email",
		Icon: FaEnvelope,
		description: "plmtmbnn@gmail.com",
		accent: "from-red-400 to-orange-400",
	},
	{
		href: "https://www.linkedin.com/in/polma-tambunan/",
		label: "LinkedIn",
		Icon: FaLinkedin,
		description: "Connect professionally",
		accent: "from-blue-400 to-cyan-400",
	},
	{
		href: "https://github.com/plmtmbnn",
		label: "GitHub",
		Icon: FaGithub,
		description: "View open-source work",
		accent: "from-gray-500 to-gray-700",
	},
];

export default function Contact() {
	return (
		<section
			id="contact"
			className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 py-20"
		>
			<div className="max-w-5xl w-full text-center">
				{/* Header */}
				<Fade triggerOnce>
					<div className="mb-14">
						<h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
							Let’s Connect
						</h2>
						<p className="max-w-2xl mx-auto text-muted-foreground text-lg">
							Open to discussing engineering leadership, fintech systems,
							collaboration, or new opportunities.
						</p>
					</div>
				</Fade>

				{/* Contact Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{contactLinks.map(({ href, label, Icon, description, accent }, i) => (
						<Fade key={label} delay={i * 100} triggerOnce>
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								className="group block"
							>
								<div className="relative h-full rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
									{/* Accent bar */}
									<div
										className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${accent}`}
									/>

									{/* Icon */}
									<div
										className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${accent} text-white mb-6`}
									>
										<Icon className="w-7 h-7" />
									</div>

									{/* Text */}
									<h3 className="text-xl font-semibold mb-2">{label}</h3>
									<p className="text-sm text-muted-foreground">{description}</p>
								</div>
							</a>
						</Fade>
					))}
				</div>
			</div>
		</section>
	);
}
