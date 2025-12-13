"use client";

import {
	ArcElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	Title,
	Tooltip,
} from "chart.js";
import { useState } from "react";
import { Fade, JackInTheBox, Slide, Zoom } from "react-awesome-reveal";
import { Pie } from "react-chartjs-2";
import {
	MdKeyboardDoubleArrowDown,
	MdKeyboardDoubleArrowUp,
} from "react-icons/md";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

/* ---------------------------------- */
/* Toggle Indicator                    */
/* ---------------------------------- */
interface ToggleIndicatorProps {
	isCollapsed: boolean;
	onClick: () => void;
}

const ToggleIndicator = ({ isCollapsed, onClick }: ToggleIndicatorProps) => (
	<button
		type="button"
		onClick={onClick}
		className="ml-auto text-slate-400 hover:text-slate-700 transition-colors"
		aria-label="Toggle section"
	>
		{isCollapsed ? (
			<MdKeyboardDoubleArrowDown size={22} />
		) : (
			<MdKeyboardDoubleArrowUp size={22} />
		)}
	</button>
);

/* ---------------------------------- */
/* Page Component                     */
/* ---------------------------------- */
const Portfolio = () => {
	const [isCollapsedLOS, setIsCollapsedLOS] = useState(true);
	const [isCollapsedOther, setIsCollapsedOther] = useState(true);
	const [activeSlice, setActiveSlice] = useState<number | null>(null);

	const toggleCollapse = (
		setter: React.Dispatch<React.SetStateAction<boolean>>,
	) => setter((prev) => !prev);

	/* -------- Chart Data -------- */
	const data = {
		labels: ["LOS & LMS Core Systems", "Other Projects"],
		datasets: [
			{
				data: [80, 20],
				backgroundColor: ["#3b82f6", "#a855f7"],
				hoverBackgroundColor: ["#2563eb", "#9333ea"],
				borderWidth: 2,
				borderColor: "#ffffff",
				borderRadius: 8,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: {
					color: "#475569",
					font: { size: 13, weight: "500" },
					padding: 16,
					usePointStyle: true,
				},
			},
			tooltip: {
				backgroundColor: "#ffffff",
				titleColor: "#0f172a",
				bodyColor: "#334155",
				borderColor: "#e2e8f0",
				borderWidth: 1,
				padding: 12,
				callbacks: {
					label: (context: any) => `${context.label}: ${context.raw}%`,
				},
			},
		},
		onClick: (_: any, elements: any[]) => {
			if (!elements.length) return;
			const index = elements[0].index;
			setActiveSlice(index);
			setIsCollapsedLOS(index !== 0);
			setIsCollapsedOther(index !== 1);
		},
		onHover: (_: any, elements: any[]) => {
			setActiveSlice(elements.length ? elements[0].index : null);
		},
	};

	return (
		<section
			id="portfolio"
			className="min-h-screen bg-white px-4 sm:px-6 py-16 lg:py-24"
		>
			<div className="max-w-7xl mx-auto space-y-16">
				{/* ---------------------------------- */}
				{/* Header                             */}
				{/* ---------------------------------- */}
				<div className="text-center space-y-6">
					<JackInTheBox triggerOnce>
						<h2 className="text-4xl sm:text-5xl font-bold text-slate-900">
							Portfolio
						</h2>

						<p className="max-w-2xl mx-auto text-lg text-slate-600">
							Systems and products I’ve built across fintech and platforms
						</p>
					</JackInTheBox>
				</div>

				{/* ---------------------------------- */}
				{/* Content Grid                       */}
				{/* ---------------------------------- */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
					{/* -------- Pie Chart -------- */}
					<Zoom triggerOnce>
						<div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8">
							<h3 className="text-lg font-semibold text-slate-900 mb-6">
								Project Distribution
							</h3>

							<div className="h-80">
								<Pie data={data} options={options as any} />
							</div>

							<p className="mt-4 text-sm text-slate-500 text-center">
								Click a segment to explore projects
							</p>
						</div>
					</Zoom>

					{/* -------- Descriptions -------- */}
					<div className="space-y-8">
						{/* LOS & LMS */}
						<Fade triggerOnce>
							<div
								className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8 transition ${
									activeSlice === 0 ? "ring-2 ring-blue-400/40" : ""
								}`}
							>
								<h3
									className="flex items-center gap-3 text-xl font-semibold text-slate-900 cursor-pointer"
									onClick={() => toggleCollapse(setIsCollapsedLOS)}
								>
									💼 LOS & LMS Core Systems
									<ToggleIndicator
										isCollapsed={isCollapsedLOS}
										onClick={() => toggleCollapse(setIsCollapsedLOS)}
									/>
								</h3>

								{!isCollapsedLOS && (
									<div className="mt-6 space-y-6">
										<p className="text-slate-600">
											End-to-end Loan Origination and Loan Management systems
											used by multiple fintech companies, processing millions in
											transactions.
										</p>

										<Slide cascade damping={0.08} triggerOnce>
											<div className="grid sm:grid-cols-2 gap-4">
												{[
													[
														"Borrower Onboarding",
														"Registration & verification",
													],
													["eKYC System", "Automated identity validation"],
													["Underwriting", "Risk assessment workflow"],
													["Digital Signing", "Secure document approval"],
													["Disbursement", "Automated fund release"],
													["Collections", "Repayment tracking"],
													["Accounting", "Reports & compliance"],
												].map(([title, desc]) => (
													<div
														key={title}
														className="p-4 border border-slate-200 rounded-xl hover:border-blue-400 transition"
													>
														<p className="font-medium text-slate-900">
															{title}
														</p>
														<p className="text-sm text-slate-600">{desc}</p>
													</div>
												))}
											</div>
										</Slide>
									</div>
								)}
							</div>
						</Fade>

						{/* Other Projects */}
						<Fade triggerOnce>
							<div
								className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8 transition ${
									activeSlice === 1 ? "ring-2 ring-purple-400/40" : ""
								}`}
							>
								<h3
									className="flex items-center gap-3 text-xl font-semibold text-slate-900 cursor-pointer"
									onClick={() => toggleCollapse(setIsCollapsedOther)}
								>
									🚀 Other Projects
									<ToggleIndicator
										isCollapsed={isCollapsedOther}
										onClick={() => toggleCollapse(setIsCollapsedOther)}
									/>
								</h3>

								{!isCollapsedOther && (
									<Slide cascade damping={0.08} triggerOnce>
										<div className="mt-6 space-y-4">
											{[
												[
													"Insurance Core System",
													"Policy & underwriting platform",
												],
												["Standalone Tools", "OCR & bank statement extractor"],
												["Organization App", "Membership & digital ID system"],
												["Investment App", "Market data & portfolio insights"],
											].map(([title, desc]) => (
												<div
													key={title}
													className="p-4 border border-slate-200 rounded-xl hover:border-purple-400 transition"
												>
													<p className="font-medium text-slate-900">{title}</p>
													<p className="text-sm text-slate-600">{desc}</p>
												</div>
											))}
										</div>
									</Slide>
								)}
							</div>
						</Fade>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Portfolio;
