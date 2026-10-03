"use client";

import { useMemo } from "react";
import { Globe, TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { InvestmentCompassData } from "@/features/investment/types";
import { INSTRUMENTS } from "@/features/investment/data/instruments";

export default function GlobalMarkets({
	data,
}: {
	data: InvestmentCompassData;
}) {
	// Group instruments by category
	const groupedInstruments = useMemo(() => {
		const groups = {
			US: INSTRUMENTS.filter((i) => i.group === "us"),
			Europe: INSTRUMENTS.filter((i) => i.group === "europe"),
			Asia: INSTRUMENTS.filter((i) => i.group === "asia"),
			Crypto: INSTRUMENTS.filter((i) => i.group === "crypto"),
			Commodities: INSTRUMENTS.filter((i) => i.group === "commodity"),
			Rates: INSTRUMENTS.filter((i) => i.group === "rates"),
		};
		return groups;
	}, []);

	const marketSummary = useMemo(() => {
		const summarizeGroup = (group: typeof INSTRUMENTS) => {
			let pos = 0;
			let neg = 0;
			let best = { id: "", pct: -Infinity };
			let worst = { id: "", pct: Infinity };

			for (const inst of group) {
				const quote = data.markets.quotes[inst.id];
				if (quote && quote.changePct != null) {
					if (quote.changePct >= 0) pos++;
					else neg++;
					if (quote.changePct > best.pct)
						best = { id: inst.label, pct: quote.changePct };
					if (quote.changePct < worst.pct)
						worst = { id: inst.label, pct: quote.changePct };
				}
			}
			return { pos, neg, best, worst };
		};

		const us = summarizeGroup(groupedInstruments.US);
		const asia = summarizeGroup(groupedInstruments.Asia);
		const crypto = summarizeGroup(groupedInstruments.Crypto);
		const commodities = summarizeGroup(groupedInstruments.Commodities);

		const notes = [];

		// Regional Equities
		if (us.pos > 0 || us.neg > 0) {
			if (us.pos >= us.neg) {
				notes.push(
					`North America is advancing (${us.pos}/${us.pos + us.neg} green), led by ${us.best.id}.`,
				);
			} else {
				notes.push(
					`North America is pulling back, weighed down by ${us.worst.id}.`,
				);
			}
		}

		if (asia.pos > 0 || asia.neg > 0) {
			if (asia.pos >= asia.neg) {
				notes.push(
					`Asia Pacific shows relative strength, led by ${asia.best.id}.`,
				);
			} else {
				notes.push(
					`Asia Pacific is facing headwinds, with ${asia.worst.id} lagging.`,
				);
			}
		}

		// Crypto
		if (crypto.pos > 0 || crypto.neg > 0) {
			if (crypto.pos >= crypto.neg) {
				notes.push(
					`Crypto markets are bullish, with ${crypto.best.id} up +${crypto.best.pct.toFixed(1)}%.`,
				);
			} else {
				notes.push(
					`Crypto markets are seeing distribution, with ${crypto.worst.id} down ${crypto.worst.pct.toFixed(1)}%.`,
				);
			}
		}

		// Commodities
		if (commodities.best.pct > 1.0) {
			notes.push(`Commodities are rallying, driven by ${commodities.best.id}.`);
		} else if (commodities.worst.pct < -1.0) {
			notes.push(
				`Commodities are weakening, dragged by ${commodities.worst.id}.`,
			);
		}

		return notes;
	}, [groupedInstruments, data.markets.quotes]);

	const renderQuoteCard = (id: string, label: string) => {
		const quote = data.markets.quotes[id];
		if (!quote) return null;

		const changePct = quote.changePct ?? 0;
		const isPositive = changePct >= 0;

		return (
			<div
				key={id}
				className="bg-slate-50/50 rounded-xl p-2.5 sm:p-3 border border-slate-100 flex items-center justify-between gap-2"
			>
				<div className="min-w-0 flex-1 pr-1.5">
					<div className="text-xs font-extrabold text-slate-800 truncate">
						{label}
					</div>
					<div className="text-[10px] text-slate-500 font-bold">{id}</div>
				</div>
				<div className="text-right shrink-0">
					<div className="text-xs sm:text-sm font-black text-slate-900">
						{quote.last?.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						}) ?? "---"}
					</div>
					<div
						className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
							isPositive ? "text-emerald-600" : "text-rose-600"
						}`}
					>
						{isPositive ? (
							<TrendingUp className="w-3 h-3" />
						) : (
							<TrendingDown className="w-3 h-3" />
						)}
						{isPositive ? "+" : ""}
						{changePct.toFixed(2)}%
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6 sm:space-y-8">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
					<Globe className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Global Macro &amp; Micro Outlook
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Equities, Commodities, and Crypto Markets
					</p>
				</div>
			</div>

			{marketSummary.length > 0 && (
				<div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 flex items-start gap-3">
					<Activity className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
					<div className="space-y-2.5">
						<h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
							Live Cross-Asset Summary
						</h3>
						<ul className="space-y-2">
							{marketSummary.map((note, idx) => (
								<li
									key={idx}
									className="text-xs font-semibold text-slate-600 flex items-start gap-2"
								>
									<span className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5 shrink-0" />
									<span>{note}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* US Equities */}
				<div className="space-y-3">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
						North America
					</h3>
					<div className="space-y-2">
						{groupedInstruments.US.map((inst) =>
							renderQuoteCard(inst.id, inst.label),
						)}
					</div>
				</div>

				{/* European Equities */}
				<div className="space-y-3">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
						Europe
					</h3>
					<div className="space-y-2">
						{groupedInstruments.Europe.map((inst) =>
							renderQuoteCard(inst.id, inst.label),
						)}
					</div>
				</div>

				{/* Asian Equities */}
				<div className="space-y-3">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
						Asia Pacific
					</h3>
					<div className="space-y-2">
						{groupedInstruments.Asia.map((inst) =>
							renderQuoteCard(inst.id, inst.label),
						)}
					</div>
				</div>

				{/* Crypto */}
				<div className="space-y-3">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
						Cryptocurrencies
					</h3>
					{data.markets.cryptoGlobal && (
						<div className="text-[10px] font-bold text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
							<span>
								BTC Dominance:{" "}
								{data.markets.cryptoGlobal.btcDominance.toFixed(1)}%
							</span>
							<span>
								Global Vol: $
								{(data.markets.cryptoGlobal.totalVolumeUsd / 1e9).toFixed(1)}B
							</span>
						</div>
					)}
					<div className="space-y-2">
						{groupedInstruments.Crypto.map((inst) =>
							renderQuoteCard(inst.id, inst.label),
						)}
					</div>
				</div>

				{/* Commodities */}
				<div className="space-y-3">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
						Commodities
					</h3>
					<div className="space-y-2">
						{groupedInstruments.Commodities.map((inst) =>
							renderQuoteCard(inst.id, inst.label),
						)}
					</div>
				</div>

				{/* Rates / Treasury */}
				<div className="space-y-3">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
						Treasury &amp; Rates
					</h3>
					<div className="space-y-2">
						{groupedInstruments.Rates.map((inst) =>
							renderQuoteCard(inst.id, inst.label),
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
