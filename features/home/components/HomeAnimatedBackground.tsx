import type { CSSProperties } from "react";

interface HomeAnimatedBackgroundProps {
	className?: string;
}

/**
 * HomeAnimatedBackground (v3)
 *
 * A quiet, light sky: a few soft clouds drifting slowly over three layers of
 * gentle sea swells, with a faint warm glow in the corner.
 *
 * Next.js notes
 * - Pure Server Component: no hooks, no "use client", zero client JS.
 *   Wave paths are computed once at module load (deterministic).
 * - Parent must be `relative` (this component is `absolute inset-0 -z-10`).
 * - Keyframes are inlined, so there is no tailwind.config dependency.
 *
 * Calmer than v2
 * - 3 sea layers instead of 4, 4 clouds instead of 5, no sheen sweep.
 * - Slower motion everywhere (clouds ~3-5 min per crossing, sea 80-150s per tile).
 * - Clouds are built from radial-gradient puffs, so there is no SVG blur filter.
 * - Waves are cubic Béziers from exact sine derivatives: smooth, compact, and
 *   still perfectly seamless (integer harmonics per tile).
 * - The front swell fades into the canvas colour (#f8fafc), so text stays readable.
 * - Only transform/opacity are animated (compositor-friendly).
 * - On small screens one cloud and the back swell are hidden.
 * - prefers-reduced-motion: all motion stops, clouds sit at fixed positions.
 */

/* ───────────────────────── Wave generation ───────────────────────── */

const TILE = 1440; // one seamless tile, in viewBox units
const VB_W = TILE * 2; // two tiles side by side; the layer scrolls exactly one tile
const VB_H = 400;
const STEP = 48; // segment width (TILE / STEP must be an integer)
const TAU = Math.PI * 2;

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
	bobPx: number; // bob distance in px (negative = up)
	hideOnSmall?: boolean;
}

const WAVES: WaveSpec[] = [
	{
		base: 95,
		amp: 12,
		h1: 2,
		h2: 3,
		p1: 0.4,
		p2: 1.9,
		stops: ["#dbeafe", "#eef4fb"],
		opacity: 0.5,
		crest: 0,
		duration: 150,
		reverse: false,
		bob: 12,
		bobDelay: 0,
		bobPx: -4,
		hideOnSmall: true,
	},
	{
		base: 170,
		amp: 15,
		h1: 3,
		h2: 5,
		p1: 2.1,
		p2: 0.6,
		stops: ["#e0f2fe", "#f3f8fc"],
		opacity: 0.6,
		crest: 0.5,
		duration: 110,
		reverse: true,
		bob: 10,
		bobDelay: -3,
		bobPx: -5,
	},
	{
		base: 250,
		amp: 14,
		h1: 2,
		h2: 4,
		p1: 4.0,
		p2: 2.7,
		stops: ["#eef2f7", "#f8fafc"], // ends exactly on the canvas colour
		opacity: 0.95,
		crest: 0.75,
		duration: 80,
		reverse: false,
		bob: 9,
		bobDelay: -5,
		bobPx: -6,
	},
];

function waveY(w: WaveSpec, x: number) {
	const t = (TAU * x) / TILE;
	return (
		w.base +
		w.amp *
			(0.65 * Math.sin(w.h1 * t + w.p1) + 0.35 * Math.sin(w.h2 * t + w.p2))
	);
}

// Analytic derivative, used for smooth Bézier handles.
function waveDY(w: WaveSpec, x: number) {
	const t = (TAU * x) / TILE;
	return (
		w.amp *
		(TAU / TILE) *
		(0.65 * w.h1 * Math.cos(w.h1 * t + w.p1) +
			0.35 * w.h2 * Math.cos(w.h2 * t + w.p2))
	);
}

function buildWave(w: WaveSpec) {
	const f = (n: number) => n.toFixed(1);
	const k = STEP / 3;
	let crest = `M0,${f(waveY(w, 0))}`;
	for (let x = 0; x < VB_W; x += STEP) {
		const x1 = x + STEP;
		crest += ` C${f(x + k)},${f(waveY(w, x) + waveDY(w, x) * k)} ${f(
			x1 - k,
		)},${f(waveY(w, x1) - waveDY(w, x1) * k)} ${x1},${f(waveY(w, x1))}`;
	}
	return { crest, fill: `${crest} L${VB_W},${VB_H} L0,${VB_H} Z` };
}

const WAVE_PATHS = WAVES.map(buildWave);

/* ───────────────────────── Clouds ───────────────────────── */

interface CloudSpec {
	top: string;
	width: number; // max px (scales down with the viewport)
	duration: number; // seconds to cross the screen
	progress: number; // 0..1, where it sits on load (and when motion is reduced)
	opacity: number;
	hideOnSmall?: boolean;
}

const CLOUDS: CloudSpec[] = [
	{ top: "8%", width: 340, duration: 260, progress: 0.22, opacity: 0.9 },
	{ top: "19%", width: 240, duration: 200, progress: 0.62, opacity: 0.7 },
	{ top: "3%", width: 190, duration: 320, progress: 0.85, opacity: 0.55 },
	{
		top: "27%",
		width: 280,
		duration: 240,
		progress: 0.42,
		opacity: 0.6,
		hideOnSmall: true,
	},
];

// [cx, cy, rx, ry] inside a 300 x 130 viewBox
const PUFFS: [number, number, number, number][] = [
	[66, 82, 48, 30],
	[122, 62, 58, 46],
	[184, 66, 54, 44],
	[238, 84, 42, 28],
	[150, 96, 104, 24],
];

const CLOUD_SHAPES = PUFFS.map(([cx, cy, rx, ry], i) => (
	<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} />
));

/* ───────────────────────── Styles ───────────────────────── */

const CSS = `
.hab-root { contain: paint; }

@keyframes hab-scroll-left  { from { transform: translate3d(0,0,0); }    to { transform: translate3d(-50%,0,0); } }
@keyframes hab-scroll-right { from { transform: translate3d(-50%,0,0); } to { transform: translate3d(0,0,0); } }
@keyframes hab-bob   { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,var(--hab-bob,-5px),0); } }
@keyframes hab-drift { from { transform: translate3d(-120%,0,0); }       to { transform: translate3d(calc(100vw + 20%),0,0); } }
@keyframes hab-haze  { 0%,100% { opacity: .6; } 50% { opacity: .95; } }

.hab-scroll { animation-timing-function: linear; animation-iteration-count: infinite; }
.hab-track  { width: max(200%, 2400px); } /* keeps swells gentle on narrow screens; -50% is still exactly one tile */
.hab-bob    { animation-name: hab-bob; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
.hab-cloud  { animation-name: hab-drift; animation-timing-function: linear; animation-iteration-count: infinite; }
.hab-haze   { animation: hab-haze 16s ease-in-out infinite; }

@media (max-width: 640px) {
	.hab-sm-hide { display: none; }
}

@media (prefers-reduced-motion: reduce) {
	.hab-scroll, .hab-bob, .hab-haze { animation: none !important; }
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
			className={`hab-root absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-slate-50 ${className}`}
		>
			<style dangerouslySetInnerHTML={{ __html: CSS }} />

			{/* Shared gradients (defined once, referenced by id) */}
			<svg width="0" height="0" className="absolute" focusable="false">
				<defs>
					<radialGradient id="hab-puff">
						<stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
						<stop offset="0.55" stopColor="#ffffff" stopOpacity="0.5" />
						<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="hab-puff-shade">
						<stop offset="0" stopColor="#cbd5e1" stopOpacity="0.5" />
						<stop offset="1" stopColor="#cbd5e1" stopOpacity="0" />
					</radialGradient>
					{WAVES.map((w, i) => (
						<linearGradient
							key={i}
							id={`hab-sea-${i}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop offset="0" stopColor={w.stops[0]} />
							<stop offset="1" stopColor={w.stops[1]} />
						</linearGradient>
					))}
				</defs>
			</svg>

			{/* Sky: faint blue easing into the canvas */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(to bottom, #eaf4fc 0%, #f4f8fc 38%, #f8fafc 62%)",
				}}
			/>

			{/* A barely-there warm glow, top right */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 60% 45% at 82% 2%, rgba(255,246,228,0.85) 0%, rgba(255,246,228,0) 100%)",
				}}
			/>

			{/* Clouds */}
			<div className="absolute top-0 inset-x-0 h-[55%] overflow-hidden">
				{CLOUDS.map((c, i) => (
					<div
						key={i}
						className={`hab-cloud absolute left-0 will-change-transform ${
							c.hideOnSmall ? "hab-sm-hide" : ""
						}`}
						style={
							{
								top: c.top,
								width: `clamp(${Math.round(c.width * 0.55)}px, ${(
									c.width / 14.4
								).toFixed(1)}vw, ${c.width}px)`,
								opacity: c.opacity,
								animationDuration: `${c.duration}s`,
								animationDelay: `-${(c.duration * c.progress).toFixed(1)}s`,
								"--hab-x": `${Math.round(c.progress * 100)}vw`,
							} as CSSProperties
						}
					>
						<svg
							viewBox="0 0 300 130"
							className="block w-full h-auto"
							fill="none"
						>
							<g fill="url(#hab-puff-shade)" transform="translate(0 10)">
								{CLOUD_SHAPES}
							</g>
							<g fill="url(#hab-puff)">{CLOUD_SHAPES}</g>
						</svg>
					</div>
				))}
			</div>

			{/* Horizon haze: a pale band where sea meets sky */}
			<div className="hab-haze absolute inset-x-0 top-[42%] h-[20%] bg-gradient-to-b from-transparent via-white/60 to-transparent" />

			{/* Sea */}
			<div className="absolute bottom-0 inset-x-0 h-[46%] overflow-hidden">
				{WAVES.map((w, i) => (
					<div
						key={i}
						className={`hab-bob absolute inset-0 ${
							w.hideOnSmall ? "hab-sm-hide" : ""
						}`}
						style={
							{
								animationDuration: `${w.bob}s`,
								animationDelay: `${w.bobDelay}s`,
								"--hab-bob": `${w.bobPx}px`,
							} as CSSProperties
						}
					>
						<div
							className="hab-scroll hab-track absolute inset-y-0 left-0 will-change-transform"
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
							>
								<path
									d={WAVE_PATHS[i].fill}
									fill={`url(#hab-sea-${i})`}
									opacity={w.opacity}
								/>
								{w.crest > 0 && (
									<path
										d={WAVE_PATHS[i].crest}
										stroke="#ffffff"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										vectorEffect="non-scaling-stroke"
										opacity={w.crest}
									/>
								)}
							</svg>
						</div>
					</div>
				))}
			</div>

			{/* Soft vignette: keeps the content area calm and readable */}
			<div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-transparent to-slate-50/60" />
		</div>
	);
}
