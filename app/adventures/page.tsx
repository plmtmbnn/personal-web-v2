"use client";

import { Fade, JackInTheBox, Slide, Zoom } from "react-awesome-reveal";
import { FaCamera, FaInstagram, FaRunning } from "react-icons/fa";
import { SiStrava } from "react-icons/si";

const adventures = [
	{
		title: "Running Milestone",
		description: "Miles logged, progress made. Every step is a victory.",
		embedUrl:
			"https://www.strava.com/athletes/38682026/activity-summary/84e311c34f606bea25b477bc6aa3e24b84c55e33",
		iframeHeight: "200px",
		icon: <FaRunning />,
		accent: "from-emerald-500 to-teal-500",
		badge: <SiStrava />,
	},
	{
		title: "Photography",
		description: "Capturing moments, telling stories through the lens.",
		embedUrl: "https://www.instagram.com/p/DBqBiMYzd4D/embed",
		iframeHeight: "520px",
		icon: <FaCamera />,
		accent: "from-purple-500 to-pink-500",
		badge: <FaInstagram />,
	},
];

const Adventure = () => {
	return (
		<section className="min-h-screen bg-slate-50 px-4 sm:px-6 py-16 lg:py-20">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-16">
					<JackInTheBox triggerOnce>
						<h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
							Adventure
						</h1>

						<p className="text-slate-600 text-lg max-w-2xl mx-auto">
							Exploring the world through running and photography
						</p>
					</JackInTheBox>
				</div>

				{/* Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{adventures.map((item, index) => (
						<Zoom triggerOnce delay={100 * index} key={item.title}>
							<div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
								{/* Card Header */}
								<div className="p-6 border-b border-slate-100">
									<div className="flex items-start justify-between mb-4">
										<div
											className={`p-4 rounded-xl bg-gradient-to-br ${item.accent} text-white`}
										>
											{item.icon}
										</div>

										<div className="p-2 rounded-lg bg-slate-100 text-slate-600">
											{item.badge}
										</div>
									</div>

									<h3 className="text-2xl font-semibold text-slate-900 mb-2">
										{item.title}
									</h3>

									<div
										className={`w-14 h-1 bg-gradient-to-r ${item.accent} rounded-full mb-4`}
									/>

									<p className="text-slate-600 leading-relaxed">
										{item.description}
									</p>
								</div>

								{/* Embed */}
								<Fade triggerOnce>
									<div className="p-6">
										<div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
											<iframe
												title={item.title}
												className="w-full"
												height={item.iframeHeight}
												src={item.embedUrl}
												frameBorder="0"
												scrolling="no"
												loading="lazy"
												allowFullScreen
											/>
										</div>
									</div>
								</Fade>

								{/* Footer */}
								<div className="px-6 pb-6">
									<div className="flex items-center gap-2 text-sm text-slate-500">
										<div
											className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.accent}`}
										/>
										<span>Live updates from my journey</span>
									</div>
								</div>
							</div>
						</Zoom>
					))}
				</div>

				{/* CTA */}
				<Slide direction="up" triggerOnce>
					<div className="mt-20 pt-12 border-t border-slate-200 flex justify-center gap-4">
						<a
							href="https://www.strava.com/athletes/38682026"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
						>
							<SiStrava />
							Strava
						</a>

						<a
							href="https://www.instagram.com/me.a.mag/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
						>
							<FaInstagram />
							Instagram
						</a>
					</div>
				</Slide>
			</div>
		</section>
	);
};

export default Adventure;
