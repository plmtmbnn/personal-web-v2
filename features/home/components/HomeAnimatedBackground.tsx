import type { CSSProperties } from "react";

interface HomeAnimatedBackgroundProps {
	className?: string;
}

/**
 * HomeAnimatedBackground
 *
 * Calm, light atmospheric background: soft clouds drifting across the sky,
 * layered sea swells rolling beneath a pale horizon haze.
 *
 * What's different from v1
 * - Waves are generated from integer-harmonic sine sums, so every tile starts
 *   and ends at the same height: the loop is seamless (v1 jumped at the seam).
 * - Clouds are real soft cumulus shapes drifting at different speeds/depths
 *   instead of flat bands, spread out on load via negative animation delays.
 * - Each sea layer fades into the canvas colour, so foreground text stays readable.
 * - Parallax: layers scroll at different speeds and gently bob on a separate
 *   element (scroll + bob never fight over the same transform).
 * - Keyframes are self-contained (no tailwind.config dependency) and use only
 *   transform/opacity, so everything runs on the compositor.
 * - prefers-reduced-motion: all motion stops and clouds sit at fixed positions.
 */

/* ───────────────────────── Wave generation ───────────────────────── */

const TILE = 1440; // one seamless tile, in viewBox units
const VB_W = TILE * 2; // two tiles side by side; the layer scrolls exactly one tile
const VB_H = 450;
const STEP = 20;

interface WaveSpec {
	base: number; // baseline y in viewBox units
	amp: number; // amplitude
	h1: number; // integer harmonics per tile (keeps the loop seamless)
	h2: number;
	p1: number; // phase offsets
	p2: number;
	stops: [string, string]; // top -> bottom fill gradient
	opacity: number;
	crest: number; // crest highlight opacity (0 = none)
	duration: number; // scroll seconds per tile
	reverse: boolean;
	bob: number; // bob seconds
	bobDelay: number;
}

const WAVES: WaveSpec[] = [
	{
		base: 110,
		amp: 14,
		h1: 2,
		h2: 3,
		p1: 0.4,
		p2: 1.9,
		stops: ["#dbeafe", "#f1f5f9"],
		opacity: 0.55,
		crest: 0,
		duration: 110,
		reverse: false,
		bob: 11,
		bobDelay: 0,
	},
	{
		base: 175,
		amp: 18,
		h1: 3,
		h2: 5,
		p1: 2.1,
		p2: 0.6,
		stops: ["#e0f2fe", "#f8fafc"],
		opacity: 0.62,
		crest: 0.45,
		duration: 85,
		reverse: true,
		bob: 9,
		bobDelay: -3,
	},
	{
		base: 245,
		amp: 22,
		h1: 2,
		h2: 4,
		p1: 4.0,
		p2: 2.7,
		stops: ["#e2e8f0", "#f8fafc"],
		opacity: 0.7,
		crest: 0,
		duration: 64,
		reverse: false,
		bob: 8,
		bobDelay: -5,
	},
	{
		base: 318,
		amp: 16,
		h1: 3,
		h2: 6,
		p1: 1.2,
		p2: 3.3,
		stops: ["#f8fafc", "#ffffff"],
		opacity: 0.9,
		crest: 0.6,
		duration: 48,
		reverse: true,
		bob: 7,
		bobDelay: -2,
	},
];

function buildWave(w: WaveSpec) {
	const pts: string[] = [];
	for (let x = 0; x <= VB_W; x += STEP) {
		const t = (2 * Math.PI * x) / TILE;
		const y =
			w.base +
			w.amp *
				(0.65 * Math.sin(w.h1 * t + w.p1) + 0.35 * Math.sin(w.h2 * t + w.p2));
		pts.push(`${x},${y.toFixed(1)}`);
	}
	const crest = `M${pts.join(" L")}`;
	return { crest, fill: `${crest} L${VB_W},${VB_H} L0,${VB_H} Z` };
}

const WAVE_PATHS = WAVES.map(buildWave);

/* ───────────────────────── Clouds ───────────────────────── */

interface CloudSpec {
	top: string;
	width: number; // px
	duration: number; // seconds to cross the screen
	progress: number; // 0..1, where it sits on load (and when motion is reduced)
	opacity: number;
}

const CLOUDS: CloudSpec[] = [
	{ top: "9%", width: 360, duration: 170, progress: 0.18, opacity: 0.95 },
	{ top: "20%", width: 250, duration: 125, progress: 0.58, opacity: 0.8 },
	{ top: "3%", width: 200, duration: 210, progress: 0.82, opacity: 0.6 },
	{ top: "29%", width: 300, duration: 150, progress: 0.38, opacity: 0.65 },
	{ top: "15%", width: 170, duration: 105, progress: 0.96, opacity: 0.55 },
];

const CLOUD_SHAPES = (
	<>
		<ellipse cx="62" cy="68" rx="52" ry="22" />
		<ellipse cx="112" cy="52" rx="46" ry="32" />
		<ellipse cx="158" cy="58" rx="44" ry="28" />
		<ellipse cx="196" cy="72" rx="38" ry="18" />
		<rect x="40" y="68" width="170" height="22" rx="11" />
	</>
);

/* ───────────────────────── Keyframes ───────────────────────── */

const CSS = `
@keyframes hab-scroll-left  { from { transform: translate3d(0,0,0); }    to { transform: translate3d(-50%,0,0); } }
@keyframes hab-scroll-right { from { transform: translate3d(-50%,0,0); } to { transform: translate3d(0,0,0); } }
@keyframes hab-bob   { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-8px,0); } }
@keyframes hab-drift { from { transform: translate3d(-120%,0,0); }       to { transform: translate3d(calc(100vw + 20%),0,0); } }
@keyframes hab-haze  { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
@keyframes hab-sheen { from { transform: translate3d(-70%,0,0); }        to { transform: translate3d(170%,0,0); } }

.hab-scroll { animation-timing-function: linear; animation-iteration-count: infinite; }
.hab-bob    { animation: hab-bob ease-in-out infinite; }
.hab-cloud  { animation: hab-drift linear infinite; }
.hab-haze   { animation: hab-haze 14s ease-in-out infinite; }
.hab-sheen  { animation: hab-sheen 42s linear infinite; }

@media (prefers-reduced-motion: reduce) {
	.hab-scroll, .hab-bob, .hab-haze, .hab-sheen { animation: none !important; }
	.hab-cloud { animation: none !important; transform: translate3d(var(--hab-x, 20vw),0,0); }
}
`;

/* ───────────────────────── Component ───────────────────────── */

export default function HomeAnimatedBackground({
	className = "",
}: HomeAnimatedBackgroundProps) {
	return (
		<div
			aria-hidden="true"
			className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-slate-50 ${className}`}
		>
			<style>{CSS}</style>

			{/* Shared soft-edge filter for clouds */}
			<svg width="0" height="0" className="absolute">
				<defs>
					<filter id="hab-soft" x="-10%" y="-10%" width="120%" height="120%">
						<feGaussianBlur stdDeviation="2.5" />
					</filter>
				</defs>
			</svg>

			{/* ── Sky tint: faint sea-sky blue at the top easing into the canvas ── */}
			<div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50" />

			{/* ── Clouds ── */}
			<div className="absolute top-0 inset-x-0 h-[55%] overflow-hidden">
				{CLOUDS.map((c, i) => (
					<div
						key={i}
						className="hab-cloud absolute left-0 will-change-transform"
						style={
							{
								top: c.top,
								width: c.width,
								opacity: c.opacity,
								animationDuration: `${c.duration}s`,
								animationDelay: `-${(c.duration * c.progress).toFixed(1)}s`,
								"--hab-x": `${Math.round(c.progress * 100)}vw`,
							} as CSSProperties
						}
					>
						<svg
							viewBox="0 0 240 100"
							className="block w-full h-auto"
							fill="none"
						>
							<g filter="url(#hab-soft)">
								<g fill="#e2e8f0" opacity="0.55" transform="translate(0 7)">
									{CLOUD_SHAPES}
								</g>
								<g fill="#ffffff">{CLOUD_SHAPES}</g>
							</g>
						</svg>
					</div>
				))}
			</div>

			{/* ── Horizon haze: a pale band where sea meets sky ── */}
			<div className="hab-haze absolute inset-x-0 top-[40%] h-[22%] bg-gradient-to-b from-transparent via-white/70 to-transparent" />

			{/* ── Sea ── */}
			<div className="absolute bottom-0 inset-x-0 h-[48%] overflow-hidden">
				{WAVES.map((w, i) => (
					<div
						key={i}
						className="hab-bob absolute inset-0"
						style={{
							animationDuration: `${w.bob}s`,
							animationDelay: `${w.bobDelay}s`,
						}}
					>
						<div
							className="hab-scroll absolute inset-y-0 left-0 w-[200%] will-change-transform"
							style={{
								animationName: w.reverse
									? "hab-scroll-right"
									: "hab-scroll-left",
								animationDuration: `${w.duration}s`,
							}}
						>
							<svg
								viewBox={`0 0 ${VB_W} ${VB_H}`}
								preserveAspectRatio="none"
								className="block w-full h-full"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs>
									<linearGradient id={`hab-g${i}`} x1="0" y1="0" x2="0" y2="1">
										<stop offset="0" stopColor={w.stops[0]} />
										<stop offset="1" stopColor={w.stops[1]} />
									</linearGradient>
								</defs>
								<path
									d={WAVE_PATHS[i].fill}
									fill={`url(#hab-g${i})`}
									opacity={w.opacity}
								/>
								{w.crest > 0 && (
									<path
										d={WAVE_PATHS[i].crest}
										stroke="#ffffff"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										vectorEffect="non-scaling-stroke"
										opacity={w.crest}
									/>
								)}
							</svg>
						</div>

						{/* Slow light sheen sweeping across the water, behind the nearer swells */}
						{i === 1 && (
							<div
								className="hab-sheen absolute inset-y-0 left-0 w-1/2 will-change-transform opacity-60"
								style={{
									background:
										"linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
								}}
							/>
						)}
					</div>
				))}
			</div>

			{/* ── Soft edge vignette (keeps content area calm and readable) ── */}
			<div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-transparent to-slate-50/60" />
		</div>
	);
}
