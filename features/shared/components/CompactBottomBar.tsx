"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { SupabaseConn } from "@/lib/core/supabase";
import { logout } from "@/features/auth/actions";
import { getReminderCount } from "@/features/reminders/actions";
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
	LayoutGrid,
	Compass,
	Toolbox,
	Database,
	Trophy,
	Bell,
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
			{ label: "Portfolio", href: "/portfolio", icon: LayoutGrid },
			{ label: "Experience", href: "/work-experience", icon: Layers },
			{ label: "Contact", href: "/contact", icon: Mail },
		],
	},
	{
		label: "Insights",
		href: "/insights",
		icon: BookOpen,
		subItems: [
			{ label: "Overview", href: "/insights", icon: Compass },
			{ label: "Blog Posts", href: "/blog", icon: BookOpen },
			{ label: "Investments", href: "/investment", icon: TrendingUp },
			{ label: "Liverpool FC", href: "/liverpool", icon: Trophy },
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
		toggle: "NEXT_PUBLIC_ENABLE_GOOGLE_AUTH",
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
			{
				label: "Quick Reminders",
				href: "/admin/reminders",
				icon: Bell,
			},
			{ label: "Logout", icon: LogOut, onClick: () => logout() },
		],
	},
];

// Motion Variants
const containerVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 8,
		scale: 0.97,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 28,
			staggerChildren: 0.03,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 0,
		y: 6,
		scale: 0.97,
		transition: {
			duration: 0.15,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 4 },
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
	const isGoogleAuthEnabled = ENV_GLOBAL.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH;
	const [expandedItem, setExpandedItem] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState(!isGoogleAuthEnabled);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [pendingTasksCount, setPendingTasksCount] = useState(0);
	const [pendingRemindersCount, setPendingRemindersCount] = useState(0);
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
		if (!isGoogleAuthEnabled) {
			setIsAdmin(true);
			return;
		}

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
				setPendingRemindersCount(0);
			}
		});
		return () => subscription.unsubscribe();
	}, [isGoogleAuthEnabled]);

	// Fetch pending tasks count on auth state changes
	useEffect(() => {
		if (!isGoogleAuthEnabled || (isLoggedIn && isAdmin)) {
			const fetchPendingCount = async () => {
				try {
					const todayStr = new Date().toISOString().split("T")[0];
					const { count } = await SupabaseConn.from("tasks")
						.select("*", { count: "exact", head: true })
						.neq("status", "done")
						.neq("status", "cancelled")
						.eq("due_date", todayStr);
					setPendingTasksCount(count || 0);

					// Fetch reminders count
					const rCount = await getReminderCount();
					setPendingRemindersCount(rCount);
				} catch (err) {
					console.error("Error fetching admin counts:", err);
				}
			};
			fetchPendingCount();
		} else {
			setPendingTasksCount(0);
			setPendingRemindersCount(0);
		}
	}, [isLoggedIn, isAdmin, isGoogleAuthEnabled]);

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
		if (item.adminOnly && !isAdmin && isGoogleAuthEnabled) return false;
		if (item.hideIfLoggedIn && (isLoggedIn || !isGoogleAuthEnabled))
			return false;
		return true;
	});

	const getSubItemBadge = (subLabel: string) => {
		if (subLabel === "Manage Tasks" && pendingTasksCount > 0) {
			return pendingTasksCount;
		}
		if (subLabel === "Quick Reminders" && pendingRemindersCount > 0) {
			return pendingRemindersCount;
		}
		return null;
	};

	const totalAdminBadge = pendingTasksCount + pendingRemindersCount;

	return (
		<motion.nav
			ref={navRef}
			className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none"
			aria-label="Main Navigation"
		>
			<div className="bg-white flex items-center p-1.5 sm:p-2 rounded-2xl shadow-xl border border-slate-200/80 relative pointer-events-auto">
				{visibleItems.map((navItem, index) => {
					const Icon = navItem.icon;
					const subItems = navItem.subItems?.filter(
						(sub) => isGoogleAuthEnabled || sub.label !== "Logout",
					);
					const isActive =
						pathname === navItem.href ||
						subItems?.some((sub) => pathname === sub.href);
					const isExpanded = expandedItem === navItem.label;
					const hasSubItems = subItems && subItems.length > 0;

					// Divider before admin section
					const prevItem = visibleItems[index - 1];
					const showDivider = navItem.adminOnly && index > 0 && prevItem;

					return (
						<div key={navItem.label} className="flex items-center">
							{/* Section divider — public nav / admin */}
							{showDivider && (
								<div className="w-px h-7 bg-slate-100 mx-1 shrink-0" />
							)}

							<div
								className="relative flex-shrink-0"
								onMouseEnter={
									hasHover && hasSubItems
										? () => setExpandedItem(navItem.label)
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
											className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-48 sm:w-52 bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 p-1.5 z-50 origin-bottom"
											role="menu"
										>
											{/* Section header */}
											<p className="px-3 pt-1.5 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 select-none">
												{navItem.label}
											</p>

											{subItems.map((sub) => {
												const SubIcon = sub.icon;
												const isSubActive = pathname === sub.href;
												const badgeCount = getSubItemBadge(sub.label);

												const commonClasses = `flex w-full text-left items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-[background-color,color] duration-150 !no-underline ${
													isSubActive
														? "bg-slate-900 !text-white shadow-xs"
														: "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80"
												}`;

												const content = (
													<>
														<SubIcon
															className={`w-4 h-4 shrink-0 ${
																isSubActive ? "!text-white" : "text-slate-500"
															}`}
														/>
														<span
															className={`truncate ${
																isSubActive ? "!text-white" : "text-slate-700"
															}`}
														>
															{sub.label}
														</span>
														{badgeCount !== null && (
															<span
																className={`ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black ${
																	isSubActive
																		? "bg-rose-500 text-white"
																		: "bg-rose-50 text-rose-600 border border-rose-200/80"
																}`}
															>
																{badgeCount}
															</span>
														)}
														{isSubActive && badgeCount === null && (
															<div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
														)}
													</>
												);

												return (
													<motion.div key={sub.label} variants={itemVariants}>
														{sub.href ? (
															<Link
																href={sub.href}
																onClick={() => {
																	sub.onClick?.();
																	setExpandedItem(null);
																}}
																className={commonClasses}
																role="menuitem"
															>
																{content}
															</Link>
														) : (
															<button
																type="button"
																onClick={() => {
																	sub.onClick?.();
																	setExpandedItem(null);
																}}
																className={commonClasses}
																role="menuitem"
															>
																{content}
															</button>
														)}
													</motion.div>
												);
											})}
										</motion.div>
									)}
								</AnimatePresence>

								<Link
									href={navItem.href}
									aria-current={isActive ? "page" : undefined}
									aria-label={navItem.label}
									onClick={(e) =>
										toggleSubMenu(e, navItem.label, hasSubItems ?? false)
									}
									className={`group relative flex items-center justify-center px-2 sm:px-2.5 py-2 rounded-xl transition-colors duration-200 !no-underline ${
										isActive
											? "text-slate-900"
											: "text-slate-500 hover:text-slate-800"
									}`}
								>
									{/* Icon container with active squircle */}
									<div className="relative flex items-center justify-center w-8 h-8">
										{isActive && (
											<motion.div
												layoutId="nav-active-icon"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
												className="absolute inset-0 bg-slate-900 rounded-xl z-0"
											/>
										)}
										<Icon
											className={`relative z-10 w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] shrink-0 transition-colors duration-200 ${
												isActive ? "!text-white" : "!text-current"
											}`}
										/>

										{/* Submenu affordance — tiny chevron at corner */}
										{hasSubItems && (
											<motion.span
												animate={{ rotate: isExpanded ? 180 : 0 }}
												transition={{ duration: 0.18 }}
												className={`absolute -bottom-0.5 -right-0.5 z-20 ${
													isActive ? "text-white/60" : "text-slate-400"
												}`}
											>
												<ChevronUp className="w-2 h-2" strokeWidth={3} />
											</motion.span>
										)}

										{/* Admin pending badge pip */}
										{navItem.label === "Admin" &&
											!isExpanded &&
											totalAdminBadge > 0 && (
												<span className="absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold !text-white ring-2 ring-white shadow-xs">
													{totalAdminBadge}
												</span>
											)}
									</div>
								</Link>
							</div>
						</div>
					);
				})}
			</div>
		</motion.nav>
	);
}
