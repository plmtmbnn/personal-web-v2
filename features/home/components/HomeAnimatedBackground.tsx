interface HomeAnimatedBackgroundProps {
	className?: string;
}

/**
 * HomeAnimatedBackground
 *
 * Calming, low-noise atmospheric background for the Home page.
 * Evokes the feeling of gentle sea waves rolling across the lower horizon
 * and peaceful clouds drifting across the upper sky.
 *
 * Strict AGENTS.md Compliance:
 * - Zero noisy sharp lines, zero dashed surveyor marks, zero technical text labels.
 * - Zero ambient blur orbs (no blur-3xl AI-slop).
 * - Zero multi-color gradient text or saturated colors.
 * - Pure light canvas with disciplined soft slate & sea-sky tones (#f8fafc, #f1f5f9, #e2e8f0).
 * - 100% GPU compositor thread CSS keyframes.
 * - Accessible: respects prefers-reduced-motion: reduce.
 */
export default function HomeAnimatedBackground({
	className = "",
}: HomeAnimatedBackgroundProps) {
	return (
		<div
			aria-hidden="true"
			className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-slate-50 ${className}`}
		>
			{/* ══════════════════════════════════════════════════════════════════════
			    SKY & DRIFTING CLOUDS (Upper Viewport)
			    ══════════════════════════════════════════════════════════════════════ */}
			<div className="absolute top-0 inset-x-0 h-1/2 overflow-hidden pointer-events-none">
				{/* ── Cloud Tier 1: High Cirrus Billows (Slowest Drift) ── */}
				<div className="absolute top-0 inset-x-0 w-[200%] h-full flex animate-cloud-slow will-change-transform opacity-70">
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-white"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,170 C160,120 300,190 480,140 C640,90 820,170 1000,120 C1180,80 1320,160 1440,130 L1440,0 L0,0 Z"
							fill="currentColor"
							opacity="0.65"
						/>
					</svg>
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-white"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,170 C160,120 300,190 480,140 C640,90 820,170 1000,120 C1180,80 1320,160 1440,130 L1440,0 L0,0 Z"
							fill="currentColor"
							opacity="0.65"
						/>
					</svg>
				</div>

				{/* ── Cloud Tier 2: Mid Cumulus Silhouettes (Gentle Counter-Float) ── */}
				<div className="absolute top-0 inset-x-0 w-[200%] h-full flex animate-cloud-medium will-change-transform opacity-60">
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-slate-100"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,230 C140,190 280,240 440,185 C600,130 760,215 940,165 C1120,120 1280,205 1440,170 L1440,0 L0,0 Z"
							fill="currentColor"
							opacity="0.55"
						/>
					</svg>
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-slate-100"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,230 C140,190 280,240 440,185 C600,130 760,215 940,165 C1120,120 1280,205 1440,170 L1440,0 L0,0 Z"
							fill="currentColor"
							opacity="0.55"
						/>
					</svg>
				</div>
			</div>

			{/* ══════════════════════════════════════════════════════════════════════
			    SEA & ROLLING OCEAN SWELLS (Lower Viewport)
			    ══════════════════════════════════════════════════════════════════════ */}
			<div className="absolute bottom-0 inset-x-0 h-1/2 overflow-hidden pointer-events-none">
				{/* ── Swell Tier 1: Distant Deep Sea Swell (Slowest rolling wave) ── */}
				<div className="absolute bottom-0 inset-x-0 w-[200%] h-full flex animate-sea-deep will-change-transform">
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-slate-200"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,170 C240,110 520,230 840,150 C1120,90 1320,200 1440,140 L1440,450 L0,450 Z"
							fill="currentColor"
							opacity="0.32"
						/>
					</svg>
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-slate-200"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,170 C240,110 520,230 840,150 C1120,90 1320,200 1440,140 L1440,450 L0,450 Z"
							fill="currentColor"
							opacity="0.32"
						/>
					</svg>
				</div>

				{/* ── Swell Tier 2: Mid-Range Rolling Sea Wave (Counter-flowing) ── */}
				<div className="absolute bottom-0 inset-x-0 w-[200%] h-full flex animate-sea-mid will-change-transform">
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-slate-200"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,240 C280,170 560,280 880,200 C1160,140 1340,250 1440,200 L1440,450 L0,450 Z"
							fill="currentColor"
							opacity="0.48"
						/>
						{/* Soft organic crest highlight */}
						<path
							d="M0,240 C280,170 560,280 880,200 C1160,140 1340,250 1440,200"
							stroke="#cbd5e1"
							strokeWidth="1.5"
							opacity="0.5"
						/>
					</svg>
					<svg
						className="w-1/2 h-full object-cover shrink-0 text-slate-200"
						viewBox="0 0 1440 450"
						preserveAspectRatio="none"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0,240 C280,170 560,280 880,200 C1160,140 1340,250 1440,200 L1440,450 L0,450 Z"
							fill="currentColor"
							opacity="0.48"
						/>
						<path
							d="M0,240 C280,170 560,280 880,200 C1160,140 1340,250 1440,200"
							stroke="#cbd5e1"
							strokeWidth="1.5"
							opacity="0.5"
						/>
					</svg>
				</div>

				{/* ── Swell Tier 3: Foreground Gentle Tide (With Vertical Breathing) ── */}
				<div className="absolute bottom-0 inset-x-0 w-[200%] h-full flex animate-sea-deep will-change-transform">
					<div className="w-full h-full flex animate-sea-breathe">
						<svg
							className="w-1/2 h-full object-cover shrink-0 text-slate-100"
							viewBox="0 0 1440 450"
							preserveAspectRatio="none"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M0,320 C320,260 620,360 960,280 C1220,220 1360,320 1440,270 L1440,450 L0,450 Z"
								fill="currentColor"
								opacity="0.7"
							/>
							<path
								d="M0,320 C320,260 620,360 960,280 C1220,220 1360,320 1440,270"
								stroke="#cbd5e1"
								strokeWidth="1.5"
								opacity="0.6"
							/>
						</svg>
						<svg
							className="w-1/2 h-full object-cover shrink-0 text-slate-100"
							viewBox="0 0 1440 450"
							preserveAspectRatio="none"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M0,320 C320,260 620,360 960,280 C1220,220 1360,320 1440,270 L1440,450 L0,450 Z"
								fill="currentColor"
								opacity="0.7"
							/>
							<path
								d="M0,320 C320,260 620,360 960,280 C1220,220 1360,320 1440,270"
								stroke="#cbd5e1"
								strokeWidth="1.5"
								opacity="0.6"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Soft Atmosphere Edge Vignette */}
			<div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-transparent to-slate-50/60 pointer-events-none" />
		</div>
	);
}
