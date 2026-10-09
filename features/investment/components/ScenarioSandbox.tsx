"use client";

import { useState, useMemo } from "react";
import { Sliders, RotateCcw, Building, Coins, Globe } from "lucide-react";
import type { InvestmentCompassData, CompassOutput } from "../types";
import { computeCompass } from "../lib/engine/index";

interface ScenarioSandboxProps {
	data: InvestmentCompassData;
	liveOutput: CompassOutput;
}

export default function ScenarioSandbox({
	data,
	liveOutput,
}: ScenarioSandboxProps) {
	// Extract initial default values from live data
	const defaultFedFunds =
		data.markets.macro?.FEDFUNDS?.data?.slice(-1)[0]?.value ?? 4.5;
	const defaultUsdIdr = data.markets.quotes.USDIDR?.last ?? 15850;
	const defaultBtcPrice = data.markets.quotes.BTC?.last ?? 88000;

	// Simulation states
	const [fedFunds, setFedFunds] = useState<number>(defaultFedFunds);
	const [usdIdr, setUsdIdr] = useState<number>(defaultUsdIdr);
	const [btcPrice, setBtcPrice] = useState<number>(defaultBtcPrice);
	const [isOpen, setIsOpen] = useState<boolean>(true);

	// Check if simulated parameters have deviated from live data
	const isModified =
		fedFunds !== defaultFedFunds ||
		usdIdr !== defaultUsdIdr ||
		btcPrice !== defaultBtcPrice;

	// Reset all sliders back to live telemetry
	const handleReset = () => {
		setFedFunds(defaultFedFunds);
		setUsdIdr(defaultUsdIdr);
		setBtcPrice(defaultBtcPrice);
	};

	// Presets for rapid stress-testing
	const applyPreset = (preset: "easing" | "hawkish" | "floor") => {
		if (preset === "easing") {
			setFedFunds(3.25);
			setUsdIdr(15100);
			setBtcPrice(105000);
		} else if (preset === "hawkish") {
			setFedFunds(5.5);
			setUsdIdr(17200);
			setBtcPrice(54000);
		} else if (preset === "floor") {
			setFedFunds(4.25);
			setUsdIdr(15900);
			setBtcPrice(42000);
		}
	};

	// Compute simulated output dynamically in real-time
	const simulatedOutput = useMemo(() => {
		// Deep clone data structures for simulation
		const simulatedData: InvestmentCompassData = {
			...data,
			markets: {
				...data.markets,
				quotes: {
					...data.markets.quotes,
					...(data.markets.quotes.USDIDR
						? {
								USDIDR: {
									...data.markets.quotes.USDIDR,
									last: usdIdr,
								},
							}
						: {}),
					...(data.markets.quotes.BTC
						? {
								BTC: {
									...data.markets.quotes.BTC,
									last: btcPrice,
								},
							}
						: {}),
				},
				macro: {
					...data.markets.macro,
					...(data.markets.macro.FEDFUNDS
						? {
								FEDFUNDS: {
									...data.markets.macro.FEDFUNDS,
									data: [
										...(data.markets.macro.FEDFUNDS.data ?? []).slice(0, -1),
										{
											date: new Date().toISOString().split("T")[0],
											value: fedFunds,
										},
									],
								},
							}
						: {}),
				},
			},
		};

		return computeCompass(simulatedData);
	}, [data, fedFunds, usdIdr, btcPrice]);

	const getStateBadge = (state: string) => {
		switch (state) {
			case "risk_on":
				return "bg-emerald-50 text-emerald-800 border-emerald-200";
			case "selective":
				return "bg-amber-50 text-amber-800 border-amber-200";
			case "defensive":
				return "bg-rose-50 text-rose-800 border-rose-200";
			case "stress":
				return "bg-rose-100 text-rose-900 border-rose-300";
			default:
				return "bg-slate-100 text-slate-800 border-slate-200";
		}
	};

	const liveGlobal = liveOutput.regimes.global;
	const liveIhsg = liveOutput.regimes.ihsg;
	const liveCrypto = liveOutput.regimes.crypto;

	const simGlobal = simulatedOutput.regimes.global;
	const simIhsg = simulatedOutput.regimes.ihsg;
	const simCrypto = simulatedOutput.regimes.crypto;

	return (
		<section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Header Stage */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
				<div className="flex items-center gap-3.5">
					<div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
						<Sliders className="w-5 h-5 text-amber-400" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
								Macro Scenario Sandbox
							</h3>
							{isModified && (
								<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/60 animate-pulse">
									Simulation Active
								</span>
							)}
						</div>
						<p className="text-xs text-slate-500 font-medium">
							Stress-test portfolio regime scores against hypothetical macro
							shocks in real-time.
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 self-start sm:self-auto">
					{isModified && (
						<button
							type="button"
							onClick={handleReset}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							Reset to Live
						</button>
					)}
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
					>
						{isOpen ? "Collapse" : "Expand"}
					</button>
				</div>
			</div>

			{isOpen && (
				<div className="space-y-6 animate-in fade-in duration-200">
					{/* Scenario Presets Strip */}
					<div className="flex flex-wrap items-center gap-2 pt-1">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
							Quick Scenarios:
						</span>
						<button
							type="button"
							onClick={() => applyPreset("easing")}
							className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100/70 transition-colors cursor-pointer"
						>
							Fed Easing Cycle (3.25% &amp; Strong IDR)
						</button>
						<button
							type="button"
							onClick={() => applyPreset("hawkish")}
							className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/70 hover:bg-rose-100/70 transition-colors cursor-pointer"
						>
							Hawkish Shock (5.50% &amp; USD/IDR 17.2K)
						</button>
						<button
							type="button"
							onClick={() => applyPreset("floor")}
							className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70 hover:bg-amber-100/70 transition-colors cursor-pointer"
						>
							Crypto Capitulation Floor ($42K BTC)
						</button>
					</div>

					{/* Sliders Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
						{/* 1. Fed Funds Rate Slider */}
						<div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									Fed Funds Rate
								</span>
								<span className="text-sm font-black font-mono text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
									{fedFunds.toFixed(2)}%
								</span>
							</div>
							<input
								type="range"
								min="2.00"
								max="6.50"
								step="0.25"
								value={fedFunds}
								onChange={(e) => setFedFunds(parseFloat(e.target.value))}
								className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
							/>
							<div className="flex justify-between text-[10px] font-semibold text-slate-400">
								<span>2.00% (Ultra-Dovish)</span>
								<span>Live: {defaultFedFunds.toFixed(2)}%</span>
								<span>6.50% (Tight)</span>
							</div>
						</div>

						{/* 2. USD/IDR Slider */}
						<div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									USD / IDR FX Rate
								</span>
								<span className="text-sm font-black font-mono text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
									Rp {Math.round(usdIdr).toLocaleString("id-ID")}
								</span>
							</div>
							<input
								type="range"
								min="14500"
								max="18000"
								step="50"
								value={usdIdr}
								onChange={(e) => setUsdIdr(parseFloat(e.target.value))}
								className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
							/>
							<div className="flex justify-between text-[10px] font-semibold text-slate-400">
								<span>14,500 (Strong IDR)</span>
								<span>
									Live: {Math.round(defaultUsdIdr).toLocaleString("id-ID")}
								</span>
								<span>18,000 (Stress)</span>
							</div>
						</div>

						{/* 3. Bitcoin Price Slider */}
						<div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									Bitcoin Price (BTC)
								</span>
								<span className="text-sm font-black font-mono text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
									${Math.round(btcPrice).toLocaleString("en-US")}
								</span>
							</div>
							<input
								type="range"
								min="30000"
								max="150000"
								step="1000"
								value={btcPrice}
								onChange={(e) => setBtcPrice(parseFloat(e.target.value))}
								className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
							/>
							<div className="flex justify-between text-[10px] font-semibold text-slate-400">
								<span>$30K (Bear Floor)</span>
								<span>
									Live: ${Math.round(defaultBtcPrice).toLocaleString("en-US")}
								</span>
								<span>$150K (Euphoria)</span>
							</div>
						</div>
					</div>

					{/* Simulated Regime Impact Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
						{/* Global Macro Delta */}
						<div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Globe className="w-4 h-4 text-slate-600" />
									<span className="text-xs font-extrabold text-slate-900">
										Global Macro
									</span>
								</div>
								<span
									className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStateBadge(simGlobal.state)}`}
								>
									{simGlobal.state.replace("_", " ")}
								</span>
							</div>

							<div className="flex items-baseline justify-between">
								<div className="flex items-baseline gap-2">
									<span className="text-2xl font-black text-slate-900">
										{simGlobal.score}
									</span>
									<span className="text-xs font-bold text-slate-400">
										/ 100
									</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-[11px] font-bold text-slate-400">
										Live: {liveGlobal.score}
									</span>
									{simGlobal.score !== liveGlobal.score && (
										<span
											className={`text-xs font-black ml-1 ${
												simGlobal.score > liveGlobal.score
													? "text-emerald-600"
													: "text-rose-600"
											}`}
										>
											{simGlobal.score > liveGlobal.score
												? `+${simGlobal.score - liveGlobal.score}`
												: simGlobal.score - liveGlobal.score}
										</span>
									)}
								</div>
							</div>
							<p className="text-[11px] text-slate-500 font-medium line-clamp-2">
								{simGlobal.headline}
							</p>
						</div>

						{/* IHSG Delta */}
						<div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Building className="w-4 h-4 text-slate-600" />
									<span className="text-xs font-extrabold text-slate-900">
										IHSG (IDX)
									</span>
								</div>
								<span
									className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStateBadge(simIhsg.state)}`}
								>
									{simIhsg.state.replace("_", " ")}
								</span>
							</div>

							<div className="flex items-baseline justify-between">
								<div className="flex items-baseline gap-2">
									<span className="text-2xl font-black text-slate-900">
										{simIhsg.score}
									</span>
									<span className="text-xs font-bold text-slate-400">
										/ 100
									</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-[11px] font-bold text-slate-400">
										Live: {liveIhsg.score}
									</span>
									{simIhsg.score !== liveIhsg.score && (
										<span
											className={`text-xs font-black ml-1 ${
												simIhsg.score > liveIhsg.score
													? "text-emerald-600"
													: "text-rose-600"
											}`}
										>
											{simIhsg.score > liveIhsg.score
												? `+${simIhsg.score - liveIhsg.score}`
												: simIhsg.score - liveIhsg.score}
										</span>
									)}
								</div>
							</div>
							<p className="text-[11px] text-slate-500 font-medium line-clamp-2">
								{simIhsg.headline}
							</p>
						</div>

						{/* Crypto Delta */}
						<div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Coins className="w-4 h-4 text-slate-600" />
									<span className="text-xs font-extrabold text-slate-900">
										Crypto (Digital Assets)
									</span>
								</div>
								<span
									className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStateBadge(simCrypto.state)}`}
								>
									{simCrypto.state.replace("_", " ")}
								</span>
							</div>

							<div className="flex items-baseline justify-between">
								<div className="flex items-baseline gap-2">
									<span className="text-2xl font-black text-slate-900">
										{simCrypto.score}
									</span>
									<span className="text-xs font-bold text-slate-400">
										/ 100
									</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-[11px] font-bold text-slate-400">
										Live: {liveCrypto.score}
									</span>
									{simCrypto.score !== liveCrypto.score && (
										<span
											className={`text-xs font-black ml-1 ${
												simCrypto.score > liveCrypto.score
													? "text-emerald-600"
													: "text-rose-600"
											}`}
										>
											{simCrypto.score > liveCrypto.score
												? `+${simCrypto.score - liveCrypto.score}`
												: simCrypto.score - liveCrypto.score}
										</span>
									)}
								</div>
							</div>
							<p className="text-[11px] text-slate-500 font-medium line-clamp-2">
								{simCrypto.headline}
							</p>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
