"use client";

import type React from "react";
import {
	Globe,
	FileText,
	Wifi,
	User,
	Mail,
	MessageSquare,
	Coins,
	RotateCcw,
	Eye,
	EyeOff,
} from "lucide-react";
import { useState } from "react";
import type {
	CryptoCurrency,
	CryptoPayload,
	EmailPayload,
	PayloadType,
	SmsPayload,
	VCardPayload,
	WiFiPayload,
} from "../types";
import { INITIAL_PAYLOAD_EXAMPLES } from "../data/presets";

interface PayloadEditorProps {
	activeTab: PayloadType;
	setActiveTab: (tab: PayloadType) => void;
	url: string;
	setUrl: (v: string) => void;
	text: string;
	setText: (v: string) => void;
	wifi: WiFiPayload;
	setWifi: React.Dispatch<React.SetStateAction<WiFiPayload>>;
	vcard: VCardPayload;
	setVcard: React.Dispatch<React.SetStateAction<VCardPayload>>;
	email: EmailPayload;
	setEmail: React.Dispatch<React.SetStateAction<EmailPayload>>;
	sms: SmsPayload;
	setSms: React.Dispatch<React.SetStateAction<SmsPayload>>;
	crypto: CryptoPayload;
	setCrypto: React.Dispatch<React.SetStateAction<CryptoPayload>>;
}

const TABS: { id: PayloadType; label: string; icon: typeof Globe }[] = [
	{ id: "url", label: "URL", icon: Globe },
	{ id: "text", label: "Plain Text", icon: FileText },
	{ id: "wifi", label: "Wi-Fi", icon: Wifi },
	{ id: "vcard", label: "vCard", icon: User },
	{ id: "email", label: "Email", icon: Mail },
	{ id: "sms", label: "SMS", icon: MessageSquare },
	{ id: "crypto", label: "Crypto", icon: Coins },
];

export default function PayloadEditor({
	activeTab,
	setActiveTab,
	url,
	setUrl,
	text,
	setText,
	wifi,
	setWifi,
	vcard,
	setVcard,
	email,
	setEmail,
	sms,
	setSms,
	crypto,
	setCrypto,
}: PayloadEditorProps) {
	const [showWifiPassword, setShowWifiPassword] = useState(false);

	const handleLoadSample = () => {
		switch (activeTab) {
			case "url":
				setUrl(INITIAL_PAYLOAD_EXAMPLES.url);
				break;
			case "text":
				setText(INITIAL_PAYLOAD_EXAMPLES.text);
				break;
			case "wifi":
				setWifi(INITIAL_PAYLOAD_EXAMPLES.wifi);
				break;
			case "vcard":
				setVcard(INITIAL_PAYLOAD_EXAMPLES.vcard);
				break;
			case "email":
				setEmail(INITIAL_PAYLOAD_EXAMPLES.email);
				break;
			case "sms":
				setSms(INITIAL_PAYLOAD_EXAMPLES.sms);
				break;
			case "crypto":
				setCrypto(INITIAL_PAYLOAD_EXAMPLES.crypto);
				break;
		}
	};

	return (
		<div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
			{/* Top Type Selector Tabs */}
			<div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
				<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
					{TABS.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
									isActive
										? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/20"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
								}`}
							>
								<Icon className="w-3.5 h-3.5" />
								<span>{tab.label}</span>
							</button>
						);
					})}
				</div>

				<button
					type="button"
					onClick={handleLoadSample}
					className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/60 transition-colors shrink-0 cursor-pointer"
					title="Load example payload"
				>
					<RotateCcw className="w-3 h-3" />
					<span>Sample Data</span>
				</button>
			</div>

			{/* Form Inputs based on activeTab */}
			<div className="space-y-4">
				{activeTab === "url" && (
					<div className="space-y-2">
						<label
							htmlFor="qr-url-input"
							className="block text-xs font-bold uppercase tracking-wider text-slate-700"
						>
							Website / Destination URL
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<Globe className="w-4 h-4" />
							</div>
							<input
								id="qr-url-input"
								type="url"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="https://example.com"
								className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
							/>
						</div>
						<p className="text-[11px] text-slate-500">
							Protocols like{" "}
							<code className="font-mono text-indigo-600">https://</code> will
							be added automatically if omitted.
						</p>
					</div>
				)}

				{activeTab === "text" && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label
								htmlFor="qr-text-input"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Raw Text / Secret Notes
							</label>
							<span className="text-[11px] text-slate-400 font-mono">
								{text.length} chars
							</span>
						</div>
						<textarea
							id="qr-text-input"
							rows={4}
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Enter any text, instructions, or markdown..."
							className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-y"
						/>
					</div>
				)}

				{activeTab === "wifi" && (
					<div className="space-y-4">
						<div className="space-y-1.5">
							<label
								htmlFor="qr-wifi-ssid"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Network Name (SSID)
							</label>
							<input
								id="qr-wifi-ssid"
								type="text"
								value={wifi.ssid}
								onChange={(e) =>
									setWifi((prev) => ({ ...prev, ssid: e.target.value }))
								}
								placeholder="e.g. Home_5G_Network"
								className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<label
									htmlFor="qr-wifi-password"
									className="block text-xs font-bold uppercase tracking-wider text-slate-700"
								>
									Password
								</label>
								<div className="relative">
									<input
										id="qr-wifi-password"
										type={showWifiPassword ? "text" : "password"}
										value={wifi.password}
										disabled={wifi.encryption === "nopass"}
										onChange={(e) =>
											setWifi((prev) => ({
												...prev,
												password: e.target.value,
											}))
										}
										placeholder={
											wifi.encryption === "nopass"
												? "No password required"
												: "Wi-Fi password"
										}
										className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
									/>
									{wifi.encryption !== "nopass" && (
										<button
											type="button"
											onClick={() => setShowWifiPassword((v) => !v)}
											className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
										>
											{showWifiPassword ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</button>
									)}
								</div>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="qr-wifi-security"
									className="block text-xs font-bold uppercase tracking-wider text-slate-700"
								>
									Security Protocol
								</label>
								<select
									id="qr-wifi-security"
									value={wifi.encryption}
									onChange={(e) =>
										setWifi((prev) => ({
											...prev,
											encryption: e.target.value as "WPA" | "WEP" | "nopass",
										}))
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
								>
									<option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
									<option value="WEP">WEP (Legacy)</option>
									<option value="nopass">Open / No Password</option>
								</select>
							</div>
						</div>

						<label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
							<input
								type="checkbox"
								checked={wifi.hidden}
								onChange={(e) =>
									setWifi((prev) => ({ ...prev, hidden: e.target.checked }))
								}
								className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
							/>
							<span className="text-xs font-semibold text-slate-700">
								Hidden SSID network
							</span>
						</label>
					</div>
				)}

				{activeTab === "vcard" && (
					<div className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="space-y-1">
								<label
									htmlFor="qr-vcard-firstname"
									className="block text-[11px] font-bold uppercase text-slate-600"
								>
									First Name
								</label>
								<input
									id="qr-vcard-firstname"
									type="text"
									value={vcard.firstName}
									onChange={(e) =>
										setVcard((prev) => ({
											...prev,
											firstName: e.target.value,
										}))
									}
									placeholder="John"
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="qr-vcard-lastname"
									className="block text-[11px] font-bold uppercase text-slate-600"
								>
									Last Name
								</label>
								<input
									id="qr-vcard-lastname"
									type="text"
									value={vcard.lastName}
									onChange={(e) =>
										setVcard((prev) => ({
											...prev,
											lastName: e.target.value,
										}))
									}
									placeholder="Doe"
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="space-y-1">
								<label
									htmlFor="qr-vcard-org"
									className="block text-[11px] font-bold uppercase text-slate-600"
								>
									Company / Org
								</label>
								<input
									id="qr-vcard-org"
									type="text"
									value={vcard.organization}
									onChange={(e) =>
										setVcard((prev) => ({
											...prev,
											organization: e.target.value,
										}))
									}
									placeholder="Acme Corp"
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="qr-vcard-title"
									className="block text-[11px] font-bold uppercase text-slate-600"
								>
									Job Title
								</label>
								<input
									id="qr-vcard-title"
									type="text"
									value={vcard.title}
									onChange={(e) =>
										setVcard((prev) => ({ ...prev, title: e.target.value }))
									}
									placeholder="Product Manager"
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="space-y-1">
								<label
									htmlFor="qr-vcard-phone"
									className="block text-[11px] font-bold uppercase text-slate-600"
								>
									Phone Number
								</label>
								<input
									id="qr-vcard-phone"
									type="tel"
									value={vcard.phone}
									onChange={(e) =>
										setVcard((prev) => ({ ...prev, phone: e.target.value }))
									}
									placeholder="+1 (555) 000-1234"
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="qr-vcard-email"
									className="block text-[11px] font-bold uppercase text-slate-600"
								>
									Email Address
								</label>
								<input
									id="qr-vcard-email"
									type="email"
									value={vcard.email}
									onChange={(e) =>
										setVcard((prev) => ({ ...prev, email: e.target.value }))
									}
									placeholder="john@example.com"
									className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="qr-vcard-url"
								className="block text-[11px] font-bold uppercase text-slate-600"
							>
								Personal Website / Portfolio
							</label>
							<input
								id="qr-vcard-url"
								type="url"
								value={vcard.url}
								onChange={(e) =>
									setVcard((prev) => ({ ...prev, url: e.target.value }))
								}
								placeholder="https://example.com"
								className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
							/>
						</div>
					</div>
				)}

				{activeTab === "email" && (
					<div className="space-y-3">
						<div className="space-y-1">
							<label
								htmlFor="qr-email-recipient"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Recipient Email
							</label>
							<input
								id="qr-email-recipient"
								type="email"
								value={email.email}
								onChange={(e) =>
									setEmail((prev) => ({ ...prev, email: e.target.value }))
								}
								placeholder="recipient@example.com"
								className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
							/>
						</div>
						<div className="space-y-1">
							<label
								htmlFor="qr-email-subject"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Subject Line
							</label>
							<input
								id="qr-email-subject"
								type="text"
								value={email.subject}
								onChange={(e) =>
									setEmail((prev) => ({ ...prev, subject: e.target.value }))
								}
								placeholder="Inquiry / Meeting Request"
								className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
							/>
						</div>
						<div className="space-y-1">
							<label
								htmlFor="qr-email-body"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Email Body
							</label>
							<textarea
								id="qr-email-body"
								rows={3}
								value={email.body}
								onChange={(e) =>
									setEmail((prev) => ({ ...prev, body: e.target.value }))
								}
								placeholder="Write your email body template..."
								className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
							/>
						</div>
					</div>
				)}

				{activeTab === "sms" && (
					<div className="space-y-3">
						<div className="space-y-1">
							<label
								htmlFor="qr-sms-phone"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Phone Number
							</label>
							<input
								id="qr-sms-phone"
								type="tel"
								value={sms.phone}
								onChange={(e) =>
									setSms((prev) => ({ ...prev, phone: e.target.value }))
								}
								placeholder="+1234567890"
								className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
							/>
						</div>
						<div className="space-y-1">
							<label
								htmlFor="qr-sms-message"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Pre-filled SMS Message
							</label>
							<textarea
								id="qr-sms-message"
								rows={3}
								value={sms.message}
								onChange={(e) =>
									setSms((prev) => ({ ...prev, message: e.target.value }))
								}
								placeholder="Hello, I'm interested in..."
								className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
							/>
						</div>
					</div>
				)}

				{activeTab === "crypto" && (
					<div className="space-y-3">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div className="space-y-1">
								<label
									htmlFor="qr-crypto-currency"
									className="block text-xs font-bold uppercase tracking-wider text-slate-700"
								>
									Currency
								</label>
								<select
									id="qr-crypto-currency"
									value={crypto.currency}
									onChange={(e) =>
										setCrypto((prev) => ({
											...prev,
											currency: e.target.value as CryptoCurrency,
										}))
									}
									className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
								>
									<option value="BTC">Bitcoin (BTC)</option>
									<option value="ETH">Ethereum (ETH)</option>
									<option value="SOL">Solana (SOL)</option>
									<option value="USDT">Tether (USDT)</option>
								</select>
							</div>
							<div className="sm:col-span-2 space-y-1">
								<label
									htmlFor="qr-crypto-amount"
									className="block text-xs font-bold uppercase tracking-wider text-slate-700"
								>
									Amount (Optional)
								</label>
								<input
									id="qr-crypto-amount"
									type="text"
									value={crypto.amount}
									onChange={(e) =>
										setCrypto((prev) => ({
											...prev,
											amount: e.target.value,
										}))
									}
									placeholder="0.05"
									className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="qr-crypto-address"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700"
							>
								Wallet Address
							</label>
							<input
								id="qr-crypto-address"
								type="text"
								value={crypto.address}
								onChange={(e) =>
									setCrypto((prev) => ({
										...prev,
										address: e.target.value,
									}))
								}
								placeholder="0x... or bc1..."
								className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
