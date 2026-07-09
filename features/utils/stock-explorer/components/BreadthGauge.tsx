"use client";

interface BreadthGaugeProps {
	advancers: number;
	decliners: number;
	unchanged: number;
	total: number;
}

const BreadthGauge = ({
	advancers,
	decliners,
	unchanged,
	total,
}: BreadthGaugeProps) => {
	const advPct = (advancers / total) * 100;
	const decPct = (decliners / total) * 100;
	const uncPct = (unchanged / total) * 100;

	return (
		<div className="w-24 h-12 flex items-center justify-center">
			<svg
				width="96"
				height="48"
				viewBox="0 0 96 48"
				className="-rotate-90"
				aria-label="Market breadth gauge"
			>
				<path
					d="M 8 48 A 40 40 0 0 1 88 48"
					stroke="#e7e5e4"
					strokeWidth="8"
					fill="none"
				/>
				<path
					d="M 8 48 A 40 40 0 0 1 88 48"
					stroke="#10b981"
					strokeWidth="8"
					fill="none"
					strokeDasharray={`${advPct * 0.8} 80`}
					strokeLinecap="round"
				/>
				<path
					d="M 8 48 A 40 40 0 0 1 88 48"
					stroke="#f97316"
					strokeWidth="8"
					fill="none"
					strokeDasharray={`${decPct * 0.8} 80`}
					strokeDashoffset={-advPct * 0.8}
					strokeLinecap="round"
				/>
				<path
					d="M 8 48 A 40 40 0 0 1 88 48"
					stroke="#64748b"
					strokeWidth="8"
					fill="none"
					strokeDasharray={`${uncPct * 0.8} 80`}
					strokeDashoffset={-(advPct + decPct) * 0.8}
					strokeLinecap="round"
				/>
			</svg>
			<div className="absolute flex flex-col gap-1 text-[8px] font-black uppercase tracking-wider">
				<div className="flex items-center gap-1">
					<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
					<span className="text-emerald-600">{advancers}</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
					<span className="text-rose-500">{decliners}</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
					<span className="text-stone-400">{unchanged}</span>
				</div>
			</div>
		</div>
	);
};

export default BreadthGauge;
