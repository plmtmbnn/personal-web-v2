import type { CSSProperties, ReactNode } from "react";

interface HomeAnimatedBackgroundProps {
	className?: string;
}

/**
 * HomeAnimatedBackground (v4)
 *
 * A patient, sunlit coastal morning: warm zenith light breathing softly over
 * sculpted, varied cloud banks and four harmonic layers of gentle water swells
 * that melt seamlessly into a light slate canvas (#f8fafc).
 *
 * Architecture & Next.js notes
 * - Pure Server Component: no hooks, no "use client", zero client-side JS.
 *   All SVG wave geometries are synthesized deterministically at module load.
 * - Parent must be `relative` (this component is `absolute inset-0 -z-10`).
 * - Keyframes are scoped and inlined — no tailwind.config changes required.
 *
 * What's reimagined from v3
 * - Container-relative cloud traversal: clouds drift across the exact width of
 *   their container (`100% + cloudWidth`) with zero off-screen dead time and no
 *   dependency on `100vw` matching the parent width.
 * - 3 distinct, sculpted cloud archetypes (cumulus bank, twin-crown drift, and
 *   high stratocumulus veil) with flat misty bases and sunlit crowns instead of
 *   cloned ellipse blobs.
 * - 3-harmonic wave synthesis: each wave combines three integer harmonics per
 *   tile with analytic cubic-Bézier derivatives for organic, non-repeating swells
 *   that remain 100% seamless across loop boundaries.
 * - Bottom-anchored vertical breathing: waves gently swell in both height and
 *   vertical scale (`transform-origin: 50% 100%`) with an extended bottom bleed
 *   (`-bottom-3`), eliminating the bottom gap caused by pure upward translation.
 * - Responsive `clamp()` proportions so swells never over-stretch on tall mobile
 *   screens or flatten out on ultrawide monitors.
 */

/* ───────────────────────── 3-Harmonic Wave Synthesis ───────────────────────── */

const TILE = 1440; // width of one seamless period in viewBox units
const VB_W = TILE * 2; // two periods side-by-side (-50% translate = 1 exact period)
const VB_H = 400;
const STEP = 48; // cubic-Bézier segment width (TILE / STEP = 30 segments)
const TAU = Math.PI * 2;

interface WaveSpec {
	base: number; // baseline y in viewBox units (0 = top, 400 = bottom)
	amp: number; // composite wave amplitude
	h1: number; // primary integer harmonic per tile
	h2: number; // secondary integer harmonic
	h3: number; // tertiary integer harmonic (adds natural irregularity)
	p1: number; // phase offsets (radians)
	p2: number;
	p3: number;
	stops: [string, string, string]; // top -> mid -> bottom fill gradient
	opacity: number;
	crestOpacity: number; // sunlit rim highlight opacity
	duration: number; // horizontal drift seconds per tile
	reverse: boolean;
	swellDuration: number; // vertical breathing seconds
	swellDelay: number;
	swellPx: number; // vertical lift in px
	swellScale: number; // vertical scale breathing factor
	hideOnSmall?: boolean;
}

const WAVES: WaveSpec[] = [
	{
		// Distant horizon groundswell — slow, misty periwinkle-sky tone
		base: 92,
		amp: 10,
		h1: 1,
		h2: 2,
		h3: 3,
		p1: 0.3,
		p2: 1.7,
		p3: 4.1,
		stops: ["#cfe4f9", "#dfeefb", "#eef5fc"],
		opacity: 0.55,
		crestOpacity: 0.3,
		duration: 190,
		reverse: false,
		swellDuration: 18,
		swellDelay: 0,
		swellPx: -3,
		swellScale: 1.02,
		hideOnSmall: true,
	},
	{
		// Mid-far swell — counter-drifting for calm interference patterns
		base: 146,
		amp: 14,
		h1: 1,
		h2: 3,
		h3: 4,
		p1: 2.2,
		p2: 0.8,
		p3: 5.0,
		stops: ["#d8ecfb", "#e6f3fc", "#f2f7fd"],
		opacity: 0.68,
		crestOpacity: 0.5,
		duration: 145,
		reverse: true,
		swellDuration: 15,
		swellDelay: -4,
		swellPx: -4,
		swellScale: 1.025,
	},
	{
		// Mid-near swell — soft pearlescent sky-water
		base: 206,
		amp: 15,
		h1: 2,
		h2: 3,
		h3: 5,
		p1: 1.1,
		p2: 3.4,
		p3: 0.6,
		stops: ["#e1f0fb", "#edf5fc", "#f5f9fd"],
		opacity: 0.82,
		crestOpacity: 0.68,
		duration: 112,
		reverse: false,
		swellDuration: 13,
		swellDelay: -8,
		swellPx: -5,
		swellScale: 1.03,
	},
	{
		// Foreground swell — melts seamlessly into the #f8fafc (slate-50) canvas
		base: 272,
		amp: 13,
		h1: 1,
		h2: 2,
		h3: 4,
		p1: 3.9,
		p2: 2.1,
		p3: 1.3,
		stops: ["#eaf2f9", "#f3f7fb", "#f8fafc"],
		opacity: 0.96,
		crestOpacity: 0.85,
		duration: 86,
		reverse: true,
		swellDuration: 11,
		swellDelay: -6,
		swellPx: -5,
		swellScale: 1.025,
	},
];

function waveY(w: WaveSpec, x: number): number {
	const t = (TAU * x) / TILE;
	return (
		w.base +
		w.amp *
			(0.55 * Math.sin(w.h1 * t + w.p1) +
				0.3 * Math.sin(w.h2 * t + w.p2) +
				0.15 * Math.sin(w.h3 * t + w.p3))
	);
}

// Exact first derivative dy/dx for C1-continuous cubic-Bézier tangents
function waveDY(w: WaveSpec, x: number): number {
	const t = (TAU * x) / TILE;
	return (
		w.amp *
		(TAU / TILE) *
		(0.55 * w.h1 * Math.cos(w.h1 * t + w.p1) +
			0.3 * w.h2 * Math.cos(w.h2 * t + w.p2) +
			0.15 * w.h3 * Math.cos(w.h3 * t + w.p3))
	);
}

function buildWave(w: WaveSpec) {
	const f = (n: number) => n.toFixed(1);
	const k = STEP / 3;
	let crest = `M0,${f(waveY(w, 0))}`;
	for (let x = 0; x < VB_W; x += STEP) {
		const x1 = x + STEP;
		const y0 = waveY(w, x);
		const y1 = waveY(w, x1);
		const c1y = y0 + waveDY(w, x) * k;
		const c2y = y1 - waveDY(w, x1) * k;
		crest += ` C${f(x + k)},${f(c1y)} ${f(x1 - k)},${f(c2y)} ${x1},${f(y1)}`;
	}
	return { crest, fill: `${crest} L${VB_W},${VB_H} L0,${VB_H} Z` };
}

const WAVE_PATHS = WAVES.map(buildWave);

/* ───────────────────────── Sculpted Cloud Archetypes ───────────────────────── */

interface CloudSpec {
	variant: 0 | 1 | 2;
	top: string;
	width: number; // max width in px on desktop
	duration: number; // seconds to cross the container
	progress: number; // 0..1 initial phase offset (and static reduced-motion position)
	opacity: number;
	flip?: boolean;
	hideOnSmall?: boolean;
}

const CLOUDS: CloudSpec[] = [
	{
		variant: 0,
		top: "6%",
		width: 380,
		duration: 310,
		progress: 0.18,
		opacity: 0.92,
	},
	{
		variant: 1,
		top: "17%",
		width: 270,
		duration: 240,
		progress: 0.58,
		opacity: 0.78,
	},
	{
		variant: 2,
		top: "3%",
		width: 320,
		duration: 390,
		progress: 0.82,
		opacity: 0.6,
	},
	{
		variant: 1,
		top: "26%",
		width: 240,
		duration: 275,
		progress: 0.36,
		opacity: 0.65,
		flip: true,
		hideOnSmall: true,
	},
];

// Three distinct cloud silhouettes inside a 360 x 140 viewBox.
// Each combines a flat-bottomed Bézier body (fading softly into the sky haze)
// with internal volumetric radial puffs so no two clouds look stamped.
const CLOUD_VARIANTS: ReactNode[] = [
	// Variant 0: Broad coastal cumulus bank
	<g key="v0">
		<path
			d="M28,118 C18,118 14,104 26,95 C32,74 54,62 78,66 C94,40 128,26 164,32 C194,20 232,30 250,56 C276,52 302,66 310,88 C328,90 338,104 330,118 Z"
			fill="url(#hab-cloud-body)"
		/>
		<ellipse cx="165" cy="88" rx="118" ry="26" fill="url(#hab-puff-shade)" />
		<ellipse cx="112" cy="68" rx="58" ry="40" fill="url(#hab-puff-core)" />
		<ellipse cx="174" cy="56" rx="68" ry="46" fill="url(#hab-puff-core)" />
		<ellipse cx="238" cy="74" rx="54" ry="36" fill="url(#hab-puff-core)" />
		<ellipse cx="72" cy="86" rx="44" ry="26" fill="url(#hab-puff-core)" />
		<ellipse cx="282" cy="92" rx="38" ry="22" fill="url(#hab-puff-core)" />
	</g>,

	// Variant 1: Asymmetric twin-crown drift cloud
	<g key="v1">
		<path
			d="M42,118 C30,118 28,102 42,94 C50,68 78,52 110,58 C134,30 176,24 206,46 C228,42 254,54 264,76 C288,76 306,90 312,106 C320,112 316,118 304,118 Z"
			fill="url(#hab-cloud-body)"
		/>
		<ellipse cx="176" cy="90" rx="102" ry="24" fill="url(#hab-puff-shade)" />
		<ellipse cx="166" cy="58" rx="64" ry="44" fill="url(#hab-puff-core)" />
		<ellipse cx="104" cy="74" rx="52" ry="34" fill="url(#hab-puff-core)" />
		<ellipse cx="228" cy="78" rx="48" ry="32" fill="url(#hab-puff-core)" />
		<ellipse cx="270" cy="94" rx="36" ry="22" fill="url(#hab-puff-core)" />
	</g>,

	// Variant 2: High, gentle stratocumulus veil
	<g key="v2">
		<path
			d="M20,114 C12,114 12,102 24,96 C38,80 68,70 100,74 C126,54 168,48 202,60 C232,52 268,60 288,78 C312,80 332,92 338,106 C342,112 336,114 326,114 Z"
			fill="url(#hab-cloud-body)"
		/>
		<ellipse cx="180" cy="94" rx="126" ry="20" fill="url(#hab-puff-shade)" />
		<ellipse cx="158" cy="72" rx="74" ry="34" fill="url(#hab-puff-core)" />
		<ellipse cx="96" cy="84" rx="56" ry="26" fill="url(#hab-puff-core)" />
		<ellipse cx="236" cy="80" rx="62" ry="28" fill="url(#hab-puff-core)" />
	</g>,
];

/* ───────────────────────── Scoped Styles & Keyframes ───────────────────────── */

const CSS = `
.hab-root {
	contain: paint;
	background-color: #f8fafc;
}

@keyframes hab-scroll-left {
	from { transform: translate3d(0, 0, 0); }
	to   { transform: translate3d(-50%, 0, 0); }
}
@keyframes hab-scroll-right {
	from { transform: translate3d(-50%, 0, 0); }
	to   { transform: translate3d(0, 0, 0); }
}
@keyframes hab-swell {
	0%, 100% { transform: translate3d(0, 0, 0) scaleY(1); }
	50%      { transform: translate3d(0, var(--hab-bob, -4px), 0) scaleY(var(--hab-scale, 1.025)); }
}
@keyframes hab-cloud-traverse {
	from { transform: translate3d(0, 0, 0); }
	to   { transform: translate3d(calc(100% + var(--hab-cw, 320px)), 0, 0); }
}
@keyframes hab-breathe {
	0%, 100% { opacity: 0.72; transform: scale(1); }
	50%      { opacity: 1;    transform: scale(1.04); }
}
@keyframes hab-shimmer {
	0%, 100% { opacity: 0.45; transform: scaleX(0.96); }
	50%      { opacity: 0.85; transform: scaleX(1.04); }
}

.hab-scroll {
	width: clamp(1920px, 200%, 3840px);
	animation-timing-function: linear;
	animation-iteration-count: infinite;
	will-change: transform;
}
.hab-swell {
	transform-origin: 50% 100%;
	animation-name: hab-swell;
	animation-timing-function: ease-in-out;
	animation-iteration-count: infinite;
	will-change: transform;
}
.hab-cloud-lane {
	animation-name: hab-cloud-traverse;
	animation-timing-function: linear;
	animation-iteration-count: infinite;
	will-change: transform;
}
.hab-sun {
	transform-origin: 82% 8%;
	animation: hab-breathe 28s ease-in-out infinite;
}
.hab-shimmer {
	transform-origin: 76% 50%;
	animation: hab-shimmer 22s ease-in-out infinite;
}

@media (max-width: 640px) {
	.hab-sm-hide { display: none; }
}

@media (prefers-reduced-motion: reduce) {
	.hab-scroll,
	.hab-swell,
	.hab-sun,
	.hab-shimmer {
		animation: none !important;
	}
	.hab-cloud-lane {
		animation: none !important;
		transform: translate3d(calc(var(--hab-progress, 0.25) * 100% + var(--hab-cw, 260px) * 0.65), 0, 0);
	}
}
`;

/* ───────────────────────── Component ───────────────────────── */

export default function HomeAnimatedBackground({
	className = "",
}: HomeAnimatedBackgroundProps) {
	return (
		<div
			aria-hidden="true"
			className={`hab-root absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none ${className}`}
		>
			<style dangerouslySetInnerHTML={{ __html: CSS }} />

			{/* Shared SVG paint definitions */}
			<svg width="0" height="0" className="absolute" focusable="false">
				<defs>
					{/* Cloud silhouette vertical fade: warm sunlit crown -> misty flat base */}
					<linearGradient id="hab-cloud-body" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
						<stop offset="52%" stopColor="#f8fbff" stopOpacity="0.82" />
						<stop offset="84%" stopColor="#e8f1fa" stopOpacity="0.38" />
						<stop offset="100%" stopColor="#e8f1fa" stopOpacity="0" />
					</linearGradient>

					{/* Volumetric sunlit puff highlight */}
					<radialGradient id="hab-puff-core" cx="46%" cy="38%" r="54%">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
						<stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
						<stop offset="82%" stopColor="#f1f7fd" stopOpacity="0.15" />
						<stop offset="100%" stopColor="#f1f7fd" stopOpacity="0" />
					</radialGradient>

					{/* Soft atmospheric cloud underbelly shade */}
					<radialGradient id="hab-puff-shade" cx="50%" cy="55%" r="50%">
						<stop offset="0%" stopColor="#cbdcf0" stopOpacity="0.36" />
						<stop offset="65%" stopColor="#dbe7f5" stopOpacity="0.12" />
						<stop offset="100%" stopColor="#dbe7f5" stopOpacity="0" />
					</radialGradient>

					{/* Sunlit wave crest stroke gradient */}
					<linearGradient id="hab-crest" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
						<stop offset="35%" stopColor="#fffdf9" stopOpacity="0.95" />
						<stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
						<stop offset="85%" stopColor="#fffdf9" stopOpacity="0.95" />
						<stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
					</linearGradient>

					{/* Vertical water depth gradients per wave */}
					{WAVES.map((w, i) => (
						<linearGradient
							key={i}
							id={`hab-sea-${i}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop offset="0%" stopColor={w.stops[0]} />
							<stop offset="48%" stopColor={w.stops[1]} />
							<stop offset="100%" stopColor={w.stops[2]} />
						</linearGradient>
					))}
				</defs>
			</svg>

			{/* Daylight sky: zenith powder-blue easing into porcelain horizon */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(180deg, #dfeefb 0%, #ebf4fc 28%, #f3f8fd 56%, #f8fafc 82%)",
				}}
			/>

			{/* Patient morning sun glow in the upper right */}
			<div
				className="hab-sun absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 64% 48% at 82% 4%, rgba(255,245,224,0.88) 0%, rgba(255,248,235,0.42) 48%, rgba(255,250,242,0) 100%)",
				}}
			/>

			{/* Clouds: container-relative lanes with zero off-screen dead time */}
			<div
				className="absolute top-0 inset-x-0 overflow-hidden"
				style={{ height: "clamp(200px, 54%, 520px)" }}
			>
				{CLOUDS.map((c, i) => {
					const widthCss = `clamp(${Math.round(c.width * 0.55)}px, ${(
						c.width / 14.4
					).toFixed(1)}vw, ${c.width}px)`;

					return (
						<div
							key={i}
							className={`hab-cloud-lane absolute inset-x-0 ${
								c.hideOnSmall ? "hab-sm-hide" : ""
							}`}
							style={
								{
									top: c.top,
									opacity: c.opacity,
									animationDuration: `${c.duration}s`,
									animationDelay: `-${(c.duration * c.progress).toFixed(1)}s`,
									"--hab-cw": widthCss,
									"--hab-progress": c.progress,
								} as CSSProperties
							}
						>
							<div
								className="absolute right-full top-0"
								style={{
									width: widthCss,
									transform: c.flip ? "scaleX(-1)" : undefined,
								}}
							>
								<svg
									viewBox="0 0 360 140"
									className="block w-full h-auto"
									fill="none"
								>
									{CLOUD_VARIANTS[c.variant]}
								</svg>
							</div>
						</div>
					);
				})}
			</div>

			{/* Horizon atmospheric mist & warm water shimmer where sky meets sea */}
			<div
				className="hab-shimmer absolute inset-x-0"
				style={{
					bottom: "clamp(150px, 34%, 340px)",
					height: "clamp(80px, 18%, 180px)",
					background:
						"radial-gradient(ellipse 55% 50% at 76% 50%, rgba(255,248,234,0.75) 0%, rgba(255,255,255,0.45) 55%, rgba(248,250,252,0) 100%)",
				}}
			/>

			{/* Rolling Sea Swells */}
			<div
				className="absolute bottom-0 inset-x-0 overflow-hidden"
				style={{ height: "clamp(190px, 45%, 440px)" }}
			>
				{WAVES.map((w, i) => (
					<div
						key={i}
						className={`hab-swell absolute inset-x-0 top-0 -bottom-3 ${
							w.hideOnSmall ? "hab-sm-hide" : ""
						}`}
						style={
							{
								animationDuration: `${w.swellDuration}s`,
								animationDelay: `${w.swellDelay}s`,
								"--hab-bob": `${w.swellPx}px`,
								"--hab-scale": w.swellScale,
							} as CSSProperties
						}
					>
						<div
							className="hab-scroll absolute inset-y-0 left-0"
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
								{w.crestOpacity > 0 && (
									<path
										d={WAVE_PATHS[i].crest}
										stroke="url(#hab-crest)"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										vectorEffect="non-scaling-stroke"
										opacity={w.crestOpacity}
									/>
								)}
							</svg>
						</div>
					</div>
				))}
			</div>

			{/* Gentle top-and-bottom veil so foreground typography stays effortless to read */}
			<div className="absolute inset-0 bg-gradient-to-b from-slate-50/25 via-transparent to-slate-50/65" />
		</div>
	);
}
