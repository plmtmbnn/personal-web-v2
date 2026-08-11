import { Crown, Gauge, Mountain, Route } from "lucide-react";
import type { PersonalBestItem } from "../types/personal-bests";

interface CardContentProps {
	item: PersonalBestItem;
}

export function CardContent({ item }: CardContentProps) {
	return (
		<div className="relative z-10 flex flex-col h-full">
			<CardHeader item={item} />
			<MainMetric item={item} />
			<FooterMetrics item={item} />
		</div>
	);
}

interface CardSectionProps {
	item: PersonalBestItem;
}

function CardHeader({ item }: CardSectionProps) {
	return (
		<div className="flex items-start justify-between">
			<div className="flex items-center gap-4">
				<div
					className={`w-14 h-14 rounded-2xl ${item.badgeBg} border border-white/50 flex items-center justify-center shadow-inner shrink-0`}
				>
					<item.icon className={`w-7 h-7 ${item.color}`} />
				</div>
				<div>
					{item.isHighest ? (
						<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1 ring-1 ring-amber-500/20">
							<Crown className="w-3 h-3 text-amber-500" /> Highest Peak
						</span>
					) : (
						<p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
							Distance Record
						</p>
					)}
					<h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
						{item.distance}
					</h4>
				</div>
			</div>
		</div>
	);
}

function MainMetric({ item }: CardSectionProps) {
	return (
		<div className="mt-auto mb-6">
			<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
				Best Duration
			</span>
			<div className="flex items-end gap-3 flex-wrap">
				<p className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-none font-mono">
					{item.time}
				</p>
				<span
					className={`mb-2 inline-flex items-center px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-black/5 shadow-sm ${item.badgeBg}`}
				>
					{item.badge}
				</span>
			</div>
		</div>
	);
}

function FooterMetrics({ item }: CardSectionProps) {
	return (
		<div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-100/80">
			<MetricItem icon={Gauge} label="Pace" value={item.pace} />
			<MetricItem
				icon={item.elevation ? Mountain : Route}
				label={item.elevation ? "Elevation" : "Target"}
				value={item.elevation ?? `${item.distanceKm} km`}
			/>
		</div>
	);
}

interface MetricItemProps {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
}

function MetricItem({ icon: Icon, label, value }: MetricItemProps) {
	return (
		<div className="flex items-center gap-3">
			<div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 shrink-0 shadow-sm">
				<Icon className="w-4 h-4" />
			</div>
			<div className="flex flex-col">
				<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
					{label}
				</span>
				<span className="text-sm font-bold text-slate-900">{value}</span>
			</div>
		</div>
	);
}
