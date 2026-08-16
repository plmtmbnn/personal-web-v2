"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, QrCode } from "lucide-react";
import type {
	CryptoPayload,
	EmailPayload,
	PayloadType,
	QRStyleConfig,
	SmsPayload,
	VCardPayload,
	WiFiPayload,
} from "../types";
import { INITIAL_PAYLOAD_EXAMPLES } from "../data/presets";
import { generatePayloadString } from "../utils/formatters";
import PayloadEditor from "./PayloadEditor";
import StyleEditor from "./StyleEditor";
import QRPreview from "./QRPreview";

export default function QRCodeGeneratorView() {
	const reduceMotion = useReducedMotion();
	const [mounted, setMounted] = useState(false);

	// Payload States
	const [activeTab, setActiveTab] = useState<PayloadType>("url");
	const [url, setUrl] = useState(INITIAL_PAYLOAD_EXAMPLES.url);
	const [text, setText] = useState(INITIAL_PAYLOAD_EXAMPLES.text);
	const [wifi, setWifi] = useState<WiFiPayload>(INITIAL_PAYLOAD_EXAMPLES.wifi);
	const [vcard, setVcard] = useState<VCardPayload>(
		INITIAL_PAYLOAD_EXAMPLES.vcard,
	);
	const [email, setEmail] = useState<EmailPayload>(
		INITIAL_PAYLOAD_EXAMPLES.email,
	);
	const [sms, setSms] = useState<SmsPayload>(INITIAL_PAYLOAD_EXAMPLES.sms);
	const [crypto, setCrypto] = useState<CryptoPayload>(
		INITIAL_PAYLOAD_EXAMPLES.crypto,
	);

	// Style Config State
	const [styleConfig, setStyleConfig] = useState<QRStyleConfig>({
		dotStyle: "rounded",
		eyeFrameStyle: "rounded",
		eyeBallStyle: "rounded",
		fgColor: "#0f172a",
		bgColor: "#ffffff",
		transparentBg: false,
		customEyeColors: false,
		eyeFrameColor: "#0f172a",
		eyeBallColor: "#0f172a",
		errorCorrectionLevel: "M",
		margin: 2,
		logo: {
			type: "none",
			presetId: "globe",
			sizeRatio: 0.22,
			bgPadding: 0.5,
		},
		frame: {
			style: "none",
			text: "SCAN ME",
			textColor: "#ffffff",
			bgColor: "#0f172a",
		},
	});

	useEffect(() => setMounted(true), []);

	// Formatted payload string based on active tab
	const payloadString = useMemo(() => {
		return generatePayloadString(activeTab, {
			url,
			text,
			wifi,
			vcard,
			email,
			sms,
			crypto,
		});
	}, [activeTab, url, text, wifi, vcard, email, sms, crypto]);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* Breadcrumb */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-8"
				>
					<Link
						href="/utils"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Utilities
					</Link>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="max-w-3xl mb-12 space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<QrCode className="w-4 h-4 text-indigo-600" />
							Developer & Operational Utilities
						</span>
					</div>
					<h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
						QR Code <span className="text-indigo-600">Generator</span>
					</h1>
					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
						Convert URLs, raw text, Wi-Fi credentials, vCard contact cards,
						emails, and crypto wallets into customizable, high-resolution vector
						and raster QR codes.
					</p>
				</motion.div>

				{/* Two-Column Working Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Left Column: Data Payload & Visual Styling (7 cols) */}
					<div className="lg:col-span-7 space-y-6">
						{/* 1. Payload Data Inputs */}
						<PayloadEditor
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							url={url}
							setUrl={setUrl}
							text={text}
							setText={setText}
							wifi={wifi}
							setWifi={setWifi}
							vcard={vcard}
							setVcard={setVcard}
							email={email}
							setEmail={setEmail}
							sms={sms}
							setSms={setSms}
							crypto={crypto}
							setCrypto={setCrypto}
						/>

						{/* 2. Visual Styling & Customization */}
						<StyleEditor config={styleConfig} setConfig={setStyleConfig} />
					</div>

					{/* Right Column: Sticky Live Preview & Export Toolbar (5 cols) */}
					<div className="lg:col-span-5">
						<QRPreview
							payloadString={payloadString}
							config={styleConfig}
							payloadType={activeTab}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
