"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
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
	ArrowUpRight,
} from "lucide-react";
import {
	motion,
	AnimatePresence,
	useReducedMotion,
	type Variants,
} from "framer-motion";

/**
 * Path active matcher: matches exact path or nested sub-path (excluding root '/')
 */
function isPathActive(currentPath: string, targetPath?: string): boolean {
	if (!targetPath) return false;
	if (targetPath === "/") return currentPath === "/";
	return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

/**
 * Navigation Item Types
 */
type SubNavItem = {
	href?: string;
	label: string;
	icon: React.ElementType;
	onClick?: () => void;
	description?: string;
};

type NavItem = {
	href: string;
	label: string;
	icon: React.ElementType;
	subItems?: SubNavItem[];
	adminOnly?: boolean;
	hideIfLoggedIn?: boolean;
	toggle?: keyof typeof ENV_GLOBAL;
	accentColor?: string;
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
		accentColor: "indigo",
		subItems: [
			{
				label: "Portfolio",
				href: "/portfolio",
				icon: LayoutGrid,
				description: "Projects & case studies",
			},
			{
				label: "Experience",
				href: "/work-experience",
				icon: Layers,
				description: "Career timeline",
			},
			{
				label: "Contact",
				href: "/contact",
				icon: Mail,
				description: "Get in touch",
			},
		],
	},
	{
		label: "Insights",
		href: "/insights",
		icon: BookOpen,
		accentColor: "emerald",
		subItems: [
			{
				label: "Overview",
				href: "/insights",
				icon: Compass,
				description: "Intelligence hub",
			},
			{
				label: "Blog Posts",
				href: "/blog",
				icon: BookOpen,
				description: "Articles & essays",
			},
			{
				label: "Investments",
				href: "/investment",
				icon: TrendingUp,
				description: "Market intelligence",
			},
			{
				label: "Liverpool FC",
				href: "/liverpool",
				icon: Trophy,
				description: "Matchday hub",
			},
			{
				label: "Utils",
				href: "/utils",
				icon: Toolbox,
				description: "Developer toolkit",
			},
		],
	},
	{
		label: "Adventures",
		href: "/adventures",
		icon: Mountain,
		accentColor: "amber",
		subItems: [
			{
				label: "Explore",
				href: "/adventures",
				icon: MapIcon,
				description: "All adventures",
			},
			{
				label: "Running",
				href: "/adventures/running",
				icon: Mountain,
				description: "Strava activity log",
			},
			{
				label: "Travel",
				href: "/adventures/travel",
				icon: MapIcon,
				description: "Destinations & bucket list",
			},
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
		accentColor: "rose",
		subItems: [
			{
				label: "Dashboard",
				href: "/admin",
				icon: LayoutDashboard,
				description: "Control center",
			},
			{
				label: "Manage Blog",
				href: "/admin/blog",
				icon: BookOpen,
				description: "Publishing console",
			},
			{
				label: "Manage Tasks",
				href: "/tasks",
				icon: CheckSquare,
				description: "Task agenda",
			},
			{
				label: "Manage Stocks",
				href: "/utils/stock-explorer/admin",
				icon: Database,
				description: "IDX stock registry",
			},
			{
				label: "Quick Reminders",
				href: "/admin/reminders",
				icon: Bell,
				description: "Ephemeral notes",
			},
			{ label: "Logout", icon: LogOut, onClick: () => logout() },
		],
	},
];

// Motion Variants

const submenuVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 10,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 460,
			damping: 30,
			staggerChildren: 0.035,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 0,
		y: 8,
		scale: 0.96,
		transition: {
			duration: 0.14,
			ease: "easeInOut",
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 5 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 340,
			damping: 26,
		},
	},
};

// Accent color maps

type AccentMap = {
	squircle: string;
	activeRow: string;
	activeIcon: string;
};

const ACCENT_MAP: Record<string, AccentMap> = {
	indigo: {
		squircle: "bg-indigo-50 border-indigo-200/70 text-indigo-600",
		activeRow: "bg-indigo-600 text-white shadow-sm",
		activeIcon: "bg-indigo-500/25 text-white",
	},
	emerald: {
		squircle: "bg-emerald-50 border-emerald-200/70 text-emerald-600",
		activeRow: "bg-emerald-700 text-white shadow-sm",
		activeIcon: "bg-emerald-600/25 text-white",
	},
	amber: {
		squircle: "bg-amber-50 border-amber-200/70 text-amber-600",
		activeRow: "bg-amber-600 text-white shadow-sm",
		activeIcon: "bg-amber-500/25 text-white",
	},
	rose: {
		squircle: "bg-rose-50 border-rose-200/70 text-rose-600",
		activeRow: "bg-rose-600 text-white shadow-sm",
		activeIcon: "bg-rose-500/25 text-white",
	},
	slate: {
		squircle: "bg-slate-100 border-slate-200/70 text-slate-600",
		activeRow: "bg-slate-900 text-white shadow-sm",
		activeIcon: "bg-white/15 text-white",
	},
};

function getAccent(accentColor?: string): AccentMap {
	return ACCENT_MAP[accentColor ?? "slate"] ?? ACCENT_MAP.slate;
}

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

	const closeSubMenu = useCallback(() => {
		setExpandedItem(null);
	}, []);

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
		closeSubMenu();
	}, [pathname, closeSubMenu]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				closeSubMenu();
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeSubMenu();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [closeSubMenu]);

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

	const handleItemClick = (
		e: React.MouseEvent,
		navItem: NavItem,
		hasSubItems: boolean,
	) => {
		if (hasSubItems) {
			if (!hasHover) {
				e.preventDefault();
				setExpandedItem((prev) =>
					prev === navItem.label ? null : navItem.label,
				);
			} else {
				closeSubMenu();
			}
		} else {
			closeSubMenu();
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
		<>
			{/* Mobile Dismissal Backdrop */}
			<AnimatePresence>
				{expandedItem && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 z-40 bg-slate-900/10 sm:hidden pointer-events-auto"
						onClick={closeSubMenu}
						aria-hidden="true"
					/>
				)}
			</AnimatePresence>

			<motion.nav
				ref={navRef}
				className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none"
				aria-label="Main Navigation"
			>
				<div
					className="bg-white flex items-center p-1.5 rounded-[1.375rem] border border-slate-200/80 relative pointer-events-auto select-none gap-px"
					style={{
						boxShadow:
							"0 8px 32px -4px rgba(15,23,42,0.12), 0 2px 8px -2px rgba(15,23,42,0.06), 0 0 0 0.5px rgba(15,23,42,0.04)",
					}}
				>
					{visibleItems.map((navItem, index) => {
						const Icon = navItem.icon;
						const subItems = navItem.subItems?.filter(
							(sub) => isGoogleAuthEnabled || sub.label !== "Logout",
						);
						const isActive =
							isPathActive(pathname, navItem.href) ||
							subItems?.some((sub) => isPathActive(pathname, sub.href));
						const isExpanded = expandedItem === navItem.label;
						const hasSubItems = Boolean(subItems && subItems.length > 0);
						const accent = getAccent(navItem.accentColor);

						const prevItem = visibleItems[index - 1];
						const showDivider = navItem.adminOnly && index > 0 && prevItem;

						const isLeft = index <= 1;
						const isRight = index >= visibleItems.length - 2;
						const alignClass = isLeft
							? "left-0 sm:left-1/2 sm:-translate-x-1/2 origin-bottom-left sm:origin-bottom"
							: isRight
								? "right-0 sm:left-1/2 sm:-translate-x-1/2 origin-bottom-right sm:origin-bottom"
								: "left-1/2 -translate-x-1/2 origin-bottom";

						return (
							<div key={navItem.label} className="flex items-center">
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
										hasHover && hasSubItems ? () => closeSubMenu() : undefined
									}
								>
									{/* Submenu Pop-over */}
									<AnimatePresence>
										{hasSubItems && isExpanded && subItems && (
											<motion.div
												variants={submenuVariants}
												initial={reduceMotion ? false : "hidden"}
												animate="visible"
												exit="exit"
												className={`absolute bottom-[calc(100%+14px)] ${alignClass} w-52 sm:w-56 bg-white rounded-2xl overflow-hidden border border-slate-200/70 z-50`}
												style={{
													boxShadow:
														"0 16px 48px -8px rgba(15,23,42,0.18), 0 4px 16px -4px rgba(15,23,42,0.08)",
												}}
												role="menu"
												aria-label={`${navItem.label} Submenu`}
											>
												{/* Submenu header */}
												<div className="px-3 pt-3 pb-2.5">
													<div className="flex items-center gap-2.5">
														<div
															className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${accent.squircle}`}
														>
															<Icon className="w-3.5 h-3.5" />
														</div>
														<div className="min-w-0">
															<p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-800 leading-none">
																{navItem.label}
															</p>
															<p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-none">
																{subItems.length} destinations
															</p>
														</div>
													</div>
												</div>

												<div className="mx-2.5 border-t border-slate-100 mb-1.5" />

												<div className="px-1.5 pb-1.5 space-y-0.5">
													{subItems.map((sub) => {
														const SubIcon = sub.icon;
														const isSubActive = isPathActive(
															pathname,
															sub.href,
														);
														const badgeCount = getSubItemBadge(sub.label);

														const content = (
															<>
																<div
																	className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
																		isSubActive
																			? accent.activeIcon
																			: "bg-slate-100 text-slate-500"
																	}`}
																>
																	<SubIcon className="w-3.5 h-3.5" />
																</div>
																<div className="min-w-0 flex-1">
																	<span
																		className={`block text-xs font-semibold leading-tight truncate ${
																			isSubActive
																				? "text-white"
																				: "text-slate-800"
																		}`}
																	>
																		{sub.label}
																	</span>
																	{sub.description && (
																		<span
																			className={`block text-[10px] leading-tight truncate mt-0.5 ${
																				isSubActive
																					? "text-white/70"
																					: "text-slate-400"
																			}`}
																		>
																			{sub.description}
																		</span>
																	)}
																</div>
																{badgeCount !== null && (
																	<span
																		className={`shrink-0 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black ${
																			isSubActive
																				? "bg-white/20 text-white"
																				: "bg-rose-50 text-rose-600 border border-rose-200/80"
																		}`}
																	>
																		{badgeCount}
																	</span>
																)}
																{isSubActive &&
																	badgeCount === null &&
																	sub.href && (
																		<ArrowUpRight className="w-3 h-3 shrink-0 opacity-60" />
																	)}
															</>
														);

														const rowClass = `flex w-full text-left items-center gap-2 px-2 py-2 rounded-[0.625rem] transition-[background-color,color] duration-150 !no-underline select-none touch-manipulation active:scale-[0.98] ${
															isSubActive
																? accent.activeRow
																: "text-slate-700 hover:bg-slate-100/70"
														}`;

														return (
															<motion.div
																key={sub.label}
																variants={itemVariants}
															>
																{sub.href ? (
																	<Link
																		href={sub.href}
																		onClick={() => {
																			sub.onClick?.();
																			closeSubMenu();
																		}}
																		className={rowClass}
																		role="menuitem"
																	>
																		{content}
																	</Link>
																) : (
																	<button
																		type="button"
																		onClick={() => {
																			sub.onClick?.();
																			closeSubMenu();
																		}}
																		className={rowClass}
																		role="menuitem"
																	>
																		{content}
																	</button>
																)}
															</motion.div>
														);
													})}
												</div>
											</motion.div>
										)}
									</AnimatePresence>

									{/* Nav button */}
									<Link
										href={navItem.href}
										aria-current={isActive ? "page" : undefined}
										aria-label={navItem.label}
										aria-haspopup={hasSubItems ? "true" : undefined}
										aria-expanded={hasSubItems ? isExpanded : undefined}
										onClick={(e) => handleItemClick(e, navItem, hasSubItems)}
										className="group relative flex flex-col items-center justify-center py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-[0.875rem] transition-colors duration-150 !no-underline select-none min-w-[52px] sm:min-w-[60px] touch-manipulation active:scale-95"
									>
										{/* Hover background for inactive items */}
										{!isActive && (
											<span className="absolute inset-0 rounded-[0.875rem] bg-slate-100/0 group-hover:bg-slate-100/70 transition-colors duration-150 pointer-events-none" />
										)}

										{/* Icon container */}
										<div className="relative flex items-center justify-center w-8 h-8 rounded-[0.6875rem]">
											{isActive && (
												<motion.div
													layoutId="nav-active-icon"
													transition={{
														type: "spring",
														stiffness: 420,
														damping: 32,
													}}
													className="absolute inset-0 bg-slate-900 rounded-[0.6875rem] z-0"
												/>
											)}
											<Icon
												className={`relative z-10 w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] shrink-0 transition-colors duration-150 ${
													isActive
														? "!text-white"
														: "!text-slate-500 group-hover:!text-slate-800"
												}`}
											/>

											{/* Admin pending badge pip */}
											{navItem.label === "Admin" &&
												!isExpanded &&
												totalAdminBadge > 0 && (
													<motion.span
														key={totalAdminBadge}
														initial={{ scale: 0.6, opacity: 0 }}
														animate={{ scale: 1, opacity: 1 }}
														transition={{
															type: "spring",
															stiffness: 500,
															damping: 28,
														}}
														className="absolute -top-1.5 -right-1.5 z-20 flex h-[14px] min-w-[14px] px-1 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black !text-white ring-[1.5px] ring-white shadow-sm"
													>
														{totalAdminBadge}
													</motion.span>
												)}
										</div>

										{/* Label + chevron indicator */}
										<div className="mt-1 flex items-center justify-center gap-0.5 max-w-full">
											<span
												className={`text-[9px] sm:text-[10px] tracking-tight leading-none transition-colors duration-150 truncate ${
													isActive
														? "font-extrabold text-slate-900"
														: "font-semibold text-slate-400 group-hover:text-slate-700"
												}`}
											>
												{navItem.label}
											</span>
											{hasSubItems && (
												<motion.span
													animate={{ rotate: isExpanded ? 180 : 0 }}
													transition={{ duration: 0.2, ease: "easeInOut" }}
													className={`shrink-0 transition-colors duration-150 ${
														isActive
															? "text-slate-700"
															: "text-slate-300 group-hover:text-slate-500"
													}`}
												>
													<ChevronUp
														className="w-2.5 h-2.5"
														strokeWidth={2.5}
													/>
												</motion.span>
											)}
										</div>
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			</motion.nav>
		</>
	);
}
