"use client";

import { useState, useEffect } from "react";

interface ToggleIndicatorProps {
	isCollapsed: boolean;
	onClick: () => void;
}

const ToggleIndicator = ({ isCollapsed, onClick }: ToggleIndicatorProps) => (
	<button
		type="button"
		onClick={onClick}
		className="ml-auto text-slate-400 hover:text-slate-700 transition-colors duration-300"
		aria-label="Toggle section"
	>
		{isCollapsed ? (
			<svg
				className="w-6 h-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		) : (
			<svg
				className="w-6 h-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M5 15l7-7 7 7"
				/>
			</svg>
		)}
	</button>
);

export default function Portfolio() {
	const [isCollapsedLOS, setIsCollapsedLOS] = useState(true);
	const [isCollapsedOther, setIsCollapsedOther] = useState(true);
	const [activeSlice, setActiveSlice] = useState<number | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	const toggleCollapse = (
		setter: React.Dispatch<React.SetStateAction<boolean>>,
	) => setter((prev) => !prev);

	const handleSliceClick = (index: number) => {
		setActiveSlice(index);
		setIsCollapsedLOS(index !== 0);
		setIsCollapsedOther(index !== 1);
	};

	return (
		<section
			id="portfolio"
			className="min-h-screen bg-background px-4 sm:px-6 py-16 lg:py-24 relative overflow-hidden"
		>
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-7xl mx-auto space-y-16 relative z-10">
				{/* Header */}
				<div
					className={`text-center space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
				>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
						Portfolio
					</h2>
					<p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
						Systems and products I've built across fintech and platforms
					</p>
				</div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
					{/* Pie Chart */}
					<div
						className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
					>
						<div className="bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 lg:p-8">
							<div className="flex items-center gap-2 mb-6">
								<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
								<h3 className="text-lg font-semibold text-foreground">
									Project Distribution
								</h3>
							</div>

							{/* Custom SVG Pie Chart */}
							<div className="h-80 flex flex-col justify-center items-center gap-8">
								<div className="relative w-64 h-64">
									<svg
										viewBox="0 0 200 200"
										className="w-full h-full transform -rotate-90"
									>
										{/* LOS & LMS (80%) */}
										<circle
											cx="100"
											cy="100"
											r="80"
											fill="none"
											stroke="#3b82f6"
											strokeWidth="40"
											className="cursor-pointer transition-all duration-300 hover:stroke-[#2563eb]"
											onClick={() => handleSliceClick(0)}
											onMouseEnter={() => setActiveSlice(0)}
											onMouseLeave={() => setActiveSlice(null)}
											style={{
												strokeDasharray: "402 502",
												filter:
													activeSlice === 0
														? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))"
														: "none",
												opacity:
													activeSlice === null || activeSlice === 0 ? 1 : 0.4,
											}}
										/>
										{/* Other Projects (20%) */}
										<circle
											cx="100"
											cy="100"
											r="80"
											fill="none"
											stroke="#a855f7"
											strokeWidth="40"
											className="cursor-pointer transition-all duration-300 hover:stroke-[#9333ea]"
											onClick={() => handleSliceClick(1)}
											onMouseEnter={() => setActiveSlice(1)}
											onMouseLeave={() => setActiveSlice(null)}
											style={{
												strokeDasharray: "100 502",
												strokeDashoffset: "-402",
												filter:
													activeSlice === 1
														? "drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))"
														: "none",
												opacity:
													activeSlice === null || activeSlice === 1 ? 1 : 0.4,
											}}
										/>
									</svg>

									{/* Center Text */}
									<div className="absolute inset-0 flex flex-col items-center justify-center">
										<p className="text-4xl font-bold text-foreground">
											{activeSlice === 0
												? "80%"
												: activeSlice === 1
													? "20%"
													: "100%"}
										</p>
										<p className="text-sm text-muted-foreground mt-1">
											{activeSlice === 0
												? "Core Systems"
												: activeSlice === 1
													? "Other Projects"
													: "Total Work"}
										</p>
									</div>
								</div>

								{/* Legend */}
								<div className="flex flex-col gap-3 w-full max-w-xs">
									<div
										className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-300 border border-transparent hover:border-blue-200"
										onClick={() => handleSliceClick(0)}
									>
										<div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
										<span className="text-sm text-foreground font-medium">
											LOS & LMS Core Systems (80%)
										</span>
									</div>
									<div
										className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-all duration-300 border border-transparent hover:border-purple-200"
										onClick={() => handleSliceClick(1)}
									>
										<div className="w-4 h-4 rounded-full bg-purple-500 flex-shrink-0"></div>
										<span className="text-sm text-foreground font-medium">
											Other Projects (20%)
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Descriptions */}
					<div
						className={`space-y-8 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
					>
						{/* LOS & LMS */}
						<div
							className={`bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 lg:p-8 ${
								activeSlice === 0 ? "ring-2 ring-blue-400/40 shadow-lg" : ""
							}`}
						>
							<h3
								className="flex items-center gap-3 text-xl font-bold text-foreground cursor-pointer hover:text-blue-600 transition-colors duration-300"
								onClick={() => toggleCollapse(setIsCollapsedLOS)}
							>
								<span className="text-2xl">💼</span>
								<span className="flex-1">LOS & LMS Core Systems</span>
								<ToggleIndicator
									isCollapsed={isCollapsedLOS}
									onClick={() => toggleCollapse(setIsCollapsedLOS)}
								/>
							</h3>

							<div
								className={`transition-all duration-500 overflow-hidden ${
									isCollapsedLOS ? "max-h-0" : "max-h-[1000px]"
								}`}
							>
								<div className="mt-6 space-y-6">
									<div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
									<p className="text-muted-foreground leading-relaxed">
										End-to-end Loan Origination and Loan Management systems used
										by multiple fintech companies, processing millions in
										transactions.
									</p>

									<div className="grid sm:grid-cols-2 gap-4">
										{[
											{
												icon: "👤",
												title: "Borrower Onboarding",
												desc: "Registration & verification",
											},
											{
												icon: "🔍",
												title: "eKYC System",
												desc: "Automated identity validation",
											},
											{
												icon: "📊",
												title: "Underwriting",
												desc: "Risk assessment workflow",
											},
											{
												icon: "✍️",
												title: "Digital Signing",
												desc: "Secure document approval",
											},
											{
												icon: "💸",
												title: "Disbursement",
												desc: "Automated fund release",
											},
											{
												icon: "📥",
												title: "Collections",
												desc: "Repayment tracking",
											},
											{
												icon: "📚",
												title: "Accounting",
												desc: "Reports & compliance",
											},
										].map(({ icon, title, desc }) => (
											<div
												key={title}
												className="p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all duration-300 group"
											>
												<p className="font-semibold text-foreground flex items-center gap-2 mb-1">
													<span className="text-lg">{icon}</span>
													<span className="group-hover:text-blue-600 transition-colors duration-300">
														{title}
													</span>
												</p>
												<p className="text-sm text-muted-foreground">{desc}</p>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Other Projects */}
						<div
							className={`bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 lg:p-8 ${
								activeSlice === 1 ? "ring-2 ring-purple-400/40 shadow-lg" : ""
							}`}
						>
							<h3
								className="flex items-center gap-3 text-xl font-bold text-foreground cursor-pointer hover:text-purple-600 transition-colors duration-300"
								onClick={() => toggleCollapse(setIsCollapsedOther)}
							>
								<span className="text-2xl">🚀</span>
								<span className="flex-1">Other Notable Projects</span>
								<ToggleIndicator
									isCollapsed={isCollapsedOther}
									onClick={() => toggleCollapse(setIsCollapsedOther)}
								/>
							</h3>

							<div
								className={`transition-all duration-500 overflow-hidden ${
									isCollapsedOther ? "max-h-0" : "max-h-[1000px]"
								}`}
							>
								<div className="mt-6 space-y-4">
									<div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>

									{[
										{
											icon: "🛡️",
											title: "Insurance Core System",
											desc: "Policy & underwriting platform",
										},
										{
											icon: "🧰",
											title: "Standalone Tools",
											desc: "OCR & bank statement extractor",
										},
										{
											icon: "🏛️",
											title: "Organization App",
											desc: "Membership & digital ID system",
										},
										{
											icon: "📈",
											title: "Investment App",
											desc: "Market data & portfolio insights",
										},
									].map(({ icon, title, desc }) => (
										<div
											key={title}
											className="p-5 border border-slate-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 hover:shadow-md transition-all duration-300 group"
										>
											<p className="font-semibold text-foreground flex items-center gap-2 mb-1 text-lg">
												<span className="text-xl">{icon}</span>
												<span className="group-hover:text-purple-600 transition-colors duration-300">
													{title}
												</span>
											</p>
											<p className="text-muted-foreground leading-relaxed">
												{desc}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
