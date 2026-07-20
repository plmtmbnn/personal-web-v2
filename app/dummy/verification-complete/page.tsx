"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ShieldCheck, UserCheck, FileCheck } from "lucide-react";
import Link from "next/link";

export default function VerificationCompletePage() {
	const reduceMotion = useReducedMotion();
	const steps = [
		{
			id: 1,
			title: "OCR KTP Verified",
			icon: <FileCheck className="w-5 h-5 text-emerald-500" />,
		},
		{
			id: 2,
			title: "OCR KK Verified",
			icon: <FileCheck className="w-5 h-5 text-emerald-500" />,
		},
		{
			id: 3,
			title: "Liveness Passed",
			icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
		},
	];

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				staggerChildren: 0.15,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -10 },
		visible: { opacity: 1, x: 0 },
	};

	return (
		<div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute top-0 w-full h-[40vh] bg-emerald-500/5 pointer-events-none" />

			<motion.div
				className="z-10 bg-white rounded-2xl border border-slate-200 shadow-xl p-8 md:p-12 max-w-md w-full mx-4"
				variants={containerVariants}
				initial={reduceMotion ? false : "hidden"}
				animate="visible"
			>
				<div className="flex flex-col items-center text-center mb-8">
					<motion.div
						initial={reduceMotion ? false : { scale: 0 }}
						animate={{ scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 15,
							delay: 0.1,
						}}
						className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm"
					>
						<ShieldCheck className="w-10 h-10 text-emerald-600" />
					</motion.div>
					<h1 className="text-2xl font-bold text-slate-800 mb-2">
						Verification Complete
					</h1>
					<p className="text-slate-500 text-sm">
						Your identity has been successfully verified. You now have full
						access.
					</p>
				</div>

				<div className="space-y-4 mb-8">
					{steps.map((step) => (
						<motion.div
							key={step.id}
							variants={itemVariants}
							className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
						>
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center">
								{step.icon}
							</div>
							<div className="flex-1 font-medium text-slate-700">
								{step.title}
							</div>
							<CheckCircle2 className="w-5 h-5 text-emerald-500" />
						</motion.div>
					))}
				</div>

				<motion.div
					variants={itemVariants}
					className="pt-2 border-t border-slate-100"
				>
					<Link
						href="/"
						className="w-full flex items-center justify-center h-12 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors active:scale-[0.98]"
					>
						Return to Dashboard
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
}
