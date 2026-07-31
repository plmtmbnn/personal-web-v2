"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { SupabaseConn } from "@/lib/core/supabase";
import { logout } from "@/features/auth/actions";
import { ENV_GLOBAL } from "@/lib/core/env";
import {
	Home,
	BookOpen,
	LayoutDashboard,
	CheckSquare,
	LogOut,
	LogIn,
	ChevronUp,
	TrendingUp,
	Mail,
	Briefcase,
	Mountain,
	Map as MapIcon,
	Layers,
	Sparkles,
	Toolbox,
	Database,
} from "lucide-react";
import {
	motion,
	AnimatePresence,
	useReducedMotion,
	type Variants,
} from "framer-motion";

/**
 * Navigation Item Types
 */
type SubNavItem = {
	href?: string;
	label: string;
	icon: React.ElementType;
	onClick?: () => void;
};

type NavItem = {
	href: string;
	label: string;
	icon: React.ElementType;
	subItems?: SubNavItem[];
	adminOnly?: boolean;
	hideIfLoggedIn?: boolean;
	toggle?: keyof typeof ENV_GLOBAL;
};

/**
 * NAV_ITEMS Configuration
 */
const NAV_ITEMS: NavItem[] = [
	{
		label: "Home",
		href: "/",
		icon: Home,
	},
	{
		label: "Work",
		href: "/portfolio",
		icon: Briefcase,
		subItems: [
			{ label: "Portfolio", href: "/portfolio", icon: Sparkles },
			{ label: "Experience", href: "/work-experience", icon: Layers },
			{ label: "Contact", href: "/contact", icon: Mail },
		],
	},
	{
		label: "Insights",
		href: "/blog",
		icon: BookOpen,
		subItems: [
			{ label: "Blog Posts", href: "/blog", icon: BookOpen },
			{ label: "Investments", href: "/investment", icon: TrendingUp },
			{ label: "Utils", href: "/utils", icon: Toolbox },
		],
	},
	{
		label: "Adventures",
		href: "/adventures",
		icon: Mountain,
		subItems: [
			{ label: "Explore", href: "/adventures", icon: MapIcon },
			{ label: "Running", href: "/adventures/running", icon: Mountain },
			{ label: "Travel", href: "/adventures/travel", icon: MapIcon },
		],
	},
	{
		label: "Login",
		href: "/login",
		icon: LogIn,
		hideIfLoggedIn: true,
	},
	{
		label: "Admin",
		href: "/admin",
		icon: LayoutDashboard,
		adminOnly: true,
		subItems: [
			{ label: "Dashboard", href: "/admin", icon: LayoutDashboard },
			{ label: "Manage Blog", href: "/admin/blog", icon: BookOpen },
			{ label: "Manage Tasks", href: "/tasks", icon: CheckSquare },
			{
				label: "Manage Stocks",
				href: "/utils/stock-explorer/admin",
				icon: Database,
			},
			{ label: "Logout", icon: LogOut, onClick: () => logout() },
		],
	},
];

// Motion Variants
const containerVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 12,
		scale: 0.96,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 28,
			staggerChildren: 0.04,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 0,
		y: 8,
		scale: 0.96,
		transition: {
			duration: 0.15,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 6 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 22,
		},
	},
};

export default function CompactBottomBar() {
	const pathname = usePathname();
	const [expandedItem, setExpandedItem] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [pendingTasksCount, setPendingTasksCount] = useState(0);
	const [hasHover, setHasHover] = useState(false);
	const navRef = useRef<HTMLElement>(null);
	const reduceMotion = useReducedMotion();

	// Detect hover-capable device dynamically
	useEffect(() => {
		const mediaQuery = window.matchMedia("(hover: hover)");
		setHasHover(mediaQuery.matches);

		const listener = (e: MediaQueryListEvent) => {
			setHasHover(e.matches);
		};

		mediaQuery.addEventListener("change", listener);
		return () => {
			mediaQuery.removeEventListener("change", listener);
		};
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				setExpandedItem(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const checkUser = async () => {
			const {
				data: { user },
			} = await SupabaseConn.auth.getUser();
			if (user) {
				setIsLoggedIn(true);
				const { data: profile } = await SupabaseConn.from("profiles")
					.select("is_admin")
					.eq("id", user.id)
					.single();
				if (profile?.is_admin) setIsAdmin(true);
			} else {
				setIsLoggedIn(false);
				setIsAdmin(false);
			}
		};
		checkUser();
		const {
			data: { subscription },
		} = SupabaseConn.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setIsLoggedIn(true);
				checkUser();
			} else {
				setIsLoggedIn(false);
				setIsAdmin(false);
				setPendingTasksCount(0);
			}
		});
		return () => subscription.unsubscribe();
	}, []);

	// Fetch pending tasks count on auth state changes
	useEffect(() => {
		if (isLoggedIn && isAdmin) {
			const fetchPendingCount = async () => {
				try {
					const todayStr = new Date().toISOString().split("T")[0];
					const { count } = await SupabaseConn.from("tasks")
						.select("*", { count: "exact", head: true })
						.neq("status", "done")
						.neq("status", "cancelled")
						.eq("due_date", todayStr);
					setPendingTasksCount(count || 0);
				} catch (err) {
					console.error("Error fetching tasks count:", err);
				}
			};
			fetchPendingCount();
		} else {
			setPendingTasksCount(0);
		}
	}, [isLoggedIn, isAdmin]);

	const toggleSubMenu = (
		e: React.MouseEvent,
		label: string,
		hasSubItems: boolean,
	) => {
		if (hasSubItems) {
			if (!hasHover) {
				e.preventDefault();
				setExpandedItem(expandedItem === label ? null : label);
			}
		}
	};

	const visibleItems = NAV_ITEMS.filter((item) => {
		if (item.toggle && !ENV_GLOBAL[item.toggle]) return false;
		if (item.adminOnly && !isAdmin) return false;
		if (item.hideIfLoggedIn && isLoggedIn) return false;
		return true;
	});

	return (
		<motion.nav
			ref={navRef}
			className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none"
			aria-label="Main Navigation"
		>
			<div className="bg-white/90 backdrop-blur-2xl flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full shadow-[0_16px_48px_-12px_rgba(15,23,42,0.15)] border border-slate-200/90 ring-1 ring-slate-900/5 relative pointer-events-auto">
				{/* Glow effect backdrop */}
				<div className="absolute inset-0 rounded-full bg-slate-900/5 blur-xl opacity-50 -z-10 pointer-events-none" />

				<div className="flex items-center gap-0.5 sm:gap-1">
					{visibleItems.map((item) => {
						const Icon = item.icon;
						const isActive =
							pathname === item.href ||
							item.subItems?.some((sub) => pathname === sub.href);
						const isExpanded = expandedItem === item.label;
						const hasSubItems = item.subItems && item.subItems.length > 0;

						return (
							<div
								key={item.label}
								className="relative flex-shrink-0"
								onMouseEnter={
									hasHover && hasSubItems
										? () => setExpandedItem(item.label)
										: undefined
								}
								onMouseLeave={
									hasHover && hasSubItems
										? () => setExpandedItem(null)
										: undefined
								}
							>
								{/* Submenu Pop-over */}
								<AnimatePresence>
									{hasSubItems && isExpanded && (
										<motion.div
											variants={containerVariants}
											initial={reduceMotion ? false : "hidden"}
											animate="visible"
											exit="exit"
											className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-48 sm:w-52 bg-white/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 p-1.5 z-50 origin-bottom ring-1 ring-slate-900/5"
											role="menu"
										>
											{item.subItems?.map((sub) => {
												const SubIcon = sub.icon;
												const isSubActive = pathname === sub.href;

												return (
													<motion.div key={sub.label} variants={itemVariants}>
														<Link
															href={sub.href || "#"}
															onClick={(e) => {
																if (!sub.href || sub.href === "#") {
																	e.preventDefault();
																}
																sub.onClick?.();
																setExpandedItem(null);
															}}
															className={`flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 !no-underline ${
																isSubActive
																	? "bg-slate-900 !text-white shadow-sm"
																	: "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80"
															}`}
															role="menuitem"
														>
															<SubIcon
																className={`w-4 h-4 ${
																	isSubActive ? "!text-white" : "text-slate-500"
																}`}
															/>
															<span
																className={
																	isSubActive ? "!text-white" : "text-slate-700"
																}
															>
																{sub.label}
															</span>
															{isSubActive && (
																<div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
															)}
														</Link>
													</motion.div>
												);
											})}
										</motion.div>
									)}
								</AnimatePresence>

								<Link
									href={item.href}
									aria-current={isActive ? "page" : undefined}
									onClick={(e) =>
										toggleSubMenu(e, item.label, hasSubItems ?? false)
									}
									className={`group relative flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 !no-underline ${
										isActive
											? "!text-white"
											: "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 active:scale-95"
									}`}
								>
									{/* Active pill background */}
									{isActive && (
										<motion.div
											layoutId="nav-active-pill"
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 30,
											}}
											className="absolute inset-0 bg-slate-900 rounded-full shadow-md shadow-slate-900/20 z-0"
										/>
									)}

									<div
										className={`relative z-10 flex items-center gap-1.5 ${
											isActive
												? "!text-white"
												: "text-slate-600 group-hover:text-slate-950"
										}`}
									>
										<Icon className="w-4 h-4 shrink-0 !text-current" />
										{item.label === "Admin" && pendingTasksCount > 0 && (
											<span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold !text-white ring-2 ring-white shadow-xs animate-pulse">
												{pendingTasksCount}
											</span>
										)}
										<span className="text-xs sm:text-sm font-semibold whitespace-nowrap !text-current">
											{item.label}
										</span>
										{hasSubItems && (
											<motion.div
												animate={{ rotate: isExpanded ? 180 : 0 }}
												className="opacity-70 !text-current"
											>
												<ChevronUp className="w-3 h-3" strokeWidth={2.5} />
											</motion.div>
										)}
									</div>
								</Link>
							</div>
						);
					})}
				</div>
			</div>
		</motion.nav>
	);
}
