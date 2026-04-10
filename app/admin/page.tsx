import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase-server";
import { redirect } from "next/navigation";
import {
	LayoutDashboard,
	BookOpen,
	CheckSquare,
	LogOut,
	ShieldCheck,
	ArrowRight,
	Settings,
	Users,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

export const metadata = {
	title: "Admin Dashboard | Personal Hub",
	description: "Manage your personal portal content and tasks.",
};

/**
 * Authorization Helper
 */
async function checkAdmin() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return false;

	const { data: profile } = await supabase
		.from("profiles")
		.select("is_admin")
		.eq("id", user.id)
		.single();

	return !!profile?.is_admin;
}

export default async function AdminDashboardPage() {
	const isAdmin = await checkAdmin();

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const adminActions = [
		{
			title: "Blog Management",
			description: "Create, edit, and delete your journal entries.",
			href: "/admin/blog",
			icon: BookOpen,
			color: "text-blue-400",
			bg: "bg-blue-500/10",
			border: "hover:border-blue-500/30",
		},
		{
			title: "Task Management",
			description: "Track your daily objectives and focus areas.",
			href: "/tasks",
			icon: CheckSquare,
			color: "text-emerald-400",
			bg: "bg-emerald-500/10",
			border: "hover:border-emerald-500/30",
		},
	];

	return (
		<main className="min-h-screen bg-background relative overflow-hidden py-24 px-6">
			{/* Aesthetic Background Ambience */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
				<div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-4xl mx-auto relative z-10">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 border-b border-white/5 pb-12">
					<div>
						<div className="flex items-center gap-3 text-accent mb-4">
							<ShieldCheck className="w-6 h-6" />
							<span className="text-[10px] font-black uppercase tracking-[0.4em]">
								Secure Management Layer
							</span>
						</div>
						<h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
							Dashboard.
						</h1>
					</div>

					<form action={logout}>
						<button
							type="submit"
							className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs hover:bg-red-500/20 transition-all border border-red-500/20 uppercase tracking-widest active:scale-95"
						>
							<LogOut className="w-4 h-4" />
							Sign Out
						</button>
					</form>
				</div>

				{/* Action Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{adminActions.map((action) => (
						<Link
							key={action.title}
							href={action.href}
							className={`group block p-8 glass-card border-2 border-white/5 rounded-[3rem] transition-all duration-500 hover:-translate-y-1 bg-white/5 backdrop-blur-xl ${action.border} shadow-2xl overflow-hidden relative !no-underline`}
						>
							{/* Inner ambient glow */}
							<div
								className={`absolute top-0 right-0 w-32 h-32 ${action.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
							/>

							<div
								className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5`}
							>
								<action.icon className={`w-7 h-7 ${action.color}`} />
							</div>

							<h3 className="text-2xl font-black mb-3 text-foreground transition-colors group-hover:text-accent tracking-tight">
								{action.title}
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed mb-10 font-medium">
								{action.description}
							</p>

							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent group-hover:gap-4 transition-all">
								<span>Execute Command</span>
								<ArrowRight className="w-3.5 h-3.5" />
							</div>
						</Link>
					))}
				</div>

				{/* System Health / Footer */}
				<div className="mt-24 text-center space-y-6">
					<div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
								Systems Nominal
							</span>
						</div>
						<div className="w-px h-4 bg-white/10" />
						<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
							v2.4.0-Stable
						</span>
					</div>

					<p className="text-[10px] text-muted-foreground/20 uppercase tracking-[0.6em] font-medium block">
						Personal Portal • Administration Gateway
					</p>
				</div>
			</div>
		</main>
	);
}
