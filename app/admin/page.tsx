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
			color: "bg-blue-500/10 text-blue-500",
		},
		{
			title: "Task Management",
			description: "Track your daily objectives and focus areas.",
			href: "/tasks",
			icon: CheckSquare,
			color: "bg-emerald-500/10 text-emerald-500",
		},
	];

	return (
		<div className="min-h-screen bg-background relative overflow-hidden py-20 px-6">
			{/* Background Ambience */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none">
				<div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-4xl mx-auto relative z-10">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-10">
					<div>
						<div className="flex items-center gap-3 text-accent mb-4">
							<ShieldCheck className="w-6 h-6" />
							<span className="text-[10px] font-black uppercase tracking-[0.3em]">
								Admin Portal
							</span>
						</div>
						<h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
							Dashboard
						</h1>
					</div>

					<form action={logout}>
						<button
							type="submit"
							className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-500/20 transition-all border border-red-500/20"
						>
							<LogOut className="w-4 h-4" />
							Sign Out
						</button>
					</form>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{adminActions.map((action) => (
						<Link
							key={action.title}
							href={action.href}
							className="group block p-8 glass-card border-2 border-white/5 rounded-[2.5rem] hover:border-accent/30 transition-all duration-500"
						>
							<div
								className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
							>
								<action.icon className="w-7 h-7" />
							</div>

							<h3 className="text-xl font-black mb-3 text-foreground group-hover:text-accent transition-colors">
								{action.title}
							</h3>
							<p className="text-muted-foreground text-sm leading-relaxed mb-6">
								{action.description}
							</p>

							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent group-hover:gap-4 transition-all">
								<span>Manage Now</span>
								<ArrowRight className="w-3 h-3" />
							</div>
						</Link>
					))}
				</div>

				<div className="mt-20 text-center">
					<p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.5em] font-medium">
						Personal Portal • Secure Management Layer
					</p>
				</div>
			</div>
		</div>
	);
}
