"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Send, Check, AlertCircle, Loader2 } from "lucide-react";
import { submitContactForm } from "../actions";
import type { ContactFormData } from "../types";

export default function ContactForm() {
	const reduceMotion = useReducedMotion();
	const [formData, setFormData] = useState<ContactFormData>({
		name: "",
		email: "",
		subject: "Collaboration",
		message: "",
	});

	const [errors, setErrors] = useState<{
		[K in keyof ContactFormData]?: string[];
	}>({});
	const [isPending, setIsPending] = useState(false);
	const [status, setStatus] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-expand textarea based on content
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	}, [formData.message]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear specific field error when user starts typing
		if (errors[name as keyof ContactFormData]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsPending(true);
		setErrors({});
		setStatus(null);

		try {
			const res = await submitContactForm(formData);
			if (res.success) {
				setStatus({ type: "success", message: res.message });
				setFormData({
					name: "",
					email: "",
					subject: "Collaboration",
					message: "",
				});
			} else {
				if (res.errors) {
					setErrors(res.errors);
				}
				setStatus({
					type: "error",
					message: res.message || "Please correct the highlighted errors.",
				});
			}
		} catch (err: any) {
			setStatus({
				type: "error",
				message: "A network error occurred. Please try again.",
			});
		} finally {
			setIsPending(false);
		}
	};

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
			className="relative w-full max-w-lg mx-auto lg:mx-0"
		>
			{/* Form Container Border & Subtle Glow */}
			<div className="absolute -inset-0.5 bg-indigo-500/15 rounded-[2rem] blur-xl opacity-75 pointer-events-none" />

			<div className="relative bg-white/70 backdrop-blur-xl border border-slate-200/50 p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-slate-100/50">
				<h2 className="text-xl font-black text-slate-800 tracking-tight mb-6">
					Send a Message
				</h2>

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Name field */}
					<div className="flex flex-col">
						<label
							htmlFor="name"
							className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block"
						>
							Your Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							disabled={isPending}
							placeholder="John Doe"
							className={`w-full rounded-xl p-3.5 border bg-white/50 text-slate-800 text-sm outline-none transition-all duration-200 ${
								errors.name
									? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
									: "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
							}`}
						/>
						<AnimatePresence>
							{errors.name && (
								<motion.span
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"
								>
									<AlertCircle className="w-3 h-3" />
									{errors.name[0]}
								</motion.span>
							)}
						</AnimatePresence>
					</div>

					{/* Email field */}
					<div className="flex flex-col">
						<label
							htmlFor="email"
							className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block"
						>
							Your Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							disabled={isPending}
							placeholder="john@example.com"
							className={`w-full rounded-xl p-3.5 border bg-white/50 text-slate-800 text-sm outline-none transition-all duration-200 ${
								errors.email
									? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
									: "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
							}`}
						/>
						<AnimatePresence>
							{errors.email && (
								<motion.span
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"
								>
									<AlertCircle className="w-3 h-3" />
									{errors.email[0]}
								</motion.span>
							)}
						</AnimatePresence>
					</div>

					{/* Subject Select */}
					<div className="flex flex-col">
						<label
							htmlFor="subject"
							className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block"
						>
							Subject / Reason
						</label>
						<div className="relative">
							<select
								id="subject"
								name="subject"
								value={formData.subject}
								onChange={handleChange}
								disabled={isPending}
								className={`w-full rounded-xl p-3.5 border bg-white/50 text-slate-800 text-sm outline-none appearance-none transition-all duration-200 cursor-pointer ${
									errors.subject
										? "border-rose-400 focus:border-rose-500"
										: "border-slate-200 focus:border-indigo-500"
								}`}
							>
								<option value="Collaboration">Collaboration / Project</option>
								<option value="Consulting">Consulting / Contracting</option>
								<option value="Say Hello">Just Saying Hello</option>
								<option value="Tech Discussion">
									Tech / Fintech Discussion
								</option>
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
								<svg
									className="fill-current h-4 w-4"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
								>
									<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
								</svg>
							</div>
						</div>
						<AnimatePresence>
							{errors.subject && (
								<motion.span
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"
								>
									<AlertCircle className="w-3 h-3" />
									{errors.subject[0]}
								</motion.span>
							)}
						</AnimatePresence>
					</div>

					{/* Message field */}
					<div className="flex flex-col">
						<label
							htmlFor="message"
							className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block"
						>
							Your Message
						</label>
						<textarea
							id="message"
							name="message"
							ref={textareaRef}
							value={formData.message}
							onChange={handleChange}
							disabled={isPending}
							placeholder="Tell me about your project or what you want to talk about..."
							rows={4}
							className={`w-full rounded-xl p-3.5 border bg-white/50 text-slate-800 text-sm outline-none resize-none transition-all duration-200 ${
								errors.message
									? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
									: "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
							}`}
							style={{ minHeight: "100px", maxHeight: "300px" }}
						/>
						<AnimatePresence>
							{errors.message && (
								<motion.span
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1"
								>
									<AlertCircle className="w-3 h-3" />
									{errors.message[0]}
								</motion.span>
							)}
						</AnimatePresence>
					</div>

					{/* Feedback Messages */}
					<AnimatePresence mode="wait">
						{status && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
									status.type === "success"
										? "bg-emerald-50 border border-emerald-100 text-emerald-800"
										: "bg-rose-50 border border-rose-100 text-rose-850"
								}`}
							>
								{status.type === "success" ? (
									<Check className="w-4 h-4 text-emerald-600 shrink-0" />
								) : (
									<AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
								)}
								<span>{status.message}</span>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Submit Button */}
					<motion.button
						type="submit"
						disabled={isPending}
						whileTap={{ scale: 0.98 }}
						className="relative w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm transition-all duration-200 shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed overflow-hidden group cursor-pointer"
					>
						{isPending ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin text-white" />
								<span className="text-white">Sending...</span>
							</>
						) : (
							<>
								<span className="text-white group-hover:translate-x-0.5 transition-transform duration-200">
									Send Message
								</span>
								<Send className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
							</>
						)}
					</motion.button>
				</form>
			</div>
		</motion.div>
	);
}
