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
		y: 8,
		scale: 0.96,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 480,
			damping: 32,
			staggerChildren: 0.03,
			delayChildren: 0.015,
		},
	},
	exit: {
		opacity: 0,
		y: 6,
		scale: 0.97,
		transition: {
			duration: 0.12,
			ease: "easeInOut",
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
			stiffness: 360,
			damping: 28,
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
				className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none"
				aria-label="Main Navigation"
			>
				{/* Bar shell */}
				<div
					className="bg-white/95 backdrop-blur-md flex items-center p-1 rounded-2xl border border-slate-200/70 relative pointer-events-auto select-none gap-px"
					style={{
						boxShadow:
							"0 4px 24px -4px rgba(15,23,42,0.10), 0 1px 6px -1px rgba(15,23,42,0.06), 0 0 0 0.5px rgba(15,23,42,0.04)",
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
									<div className="w-px h-5 bg-slate-200/80 mx-0.5 shrink-0" />
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
												className={`absolute bottom-[calc(100%+10px)] ${alignClass} w-48 bg-white rounded-xl overflow-hidden border border-slate-200/70 z-50`}
												style={{
													boxShadow:
														"0 12px 40px -6px rgba(15,23,42,0.14), 0 3px 12px -3px rgba(15,23,42,0.07)",
												}}
												role="menu"
												aria-label={`${navItem.label} Submenu`}
											>
												{/* Submenu header */}
												<div className="px-2.5 pt-2.5 pb-2">
													<div className="flex items-center gap-2">
														<div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center shrink-0 text-slate-600">
															<Icon className="w-3 h-3" />
														</div>
														<div className="min-w-0">
															<p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-800 leading-none">
																{navItem.label}
															</p>
															<p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-none">
																{subItems.length} destinations
															</p>
														</div>
													</div>
												</div>

												<div className="mx-2 border-t border-slate-100 mb-1" />

												<div className="px-1 pb-1 space-y-px">
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
																	className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
																		isSubActive
																			? "bg-white/20 text-white"
																			: "bg-slate-100 text-slate-500"
																	}`}
																>
																	<SubIcon className="w-3 h-3" />
																</div>
																<div className="min-w-0 flex-1">
																	<span
																		className={`block text-[11px] font-semibold leading-tight truncate ${
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
																					? "text-white/60"
																					: "text-slate-400"
																			}`}
																		>
																			{sub.description}
																		</span>
																	)}
																</div>
																{badgeCount !== null && (
																	<span
																		className={`shrink-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black ${
																			isSubActive
																				? "bg-white/20 text-white"
																				: "bg-slate-900 text-white"
																		}`}
																	>
																		{badgeCount}
																	</span>
																)}
																{isSubActive &&
																	badgeCount === null &&
																	sub.href && (
																		<ArrowUpRight className="w-3 h-3 shrink-0 opacity-50" />
																	)}
															</>
														);

														const rowClass = `flex w-full text-left items-center gap-2 px-1.5 py-1.5 rounded-lg transition-[background-color,color] duration-150 !no-underline select-none touch-manipulation active:scale-[0.98] ${
															isSubActive
																? "bg-slate-900 text-white shadow-sm"
																: "text-slate-700 hover:bg-slate-50"
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
										className="group relative flex flex-col items-center justify-center py-1 sm:py-1.5 px-2 sm:px-2.5 rounded-[0.8rem] transition-colors duration-150 !no-underline select-none min-w-[44px] sm:min-w-[52px] touch-manipulation active:scale-95"
									>
										{/* Hover background for inactive items */}
										{!isActive && (
											<span className="absolute inset-0 rounded-[0.8rem] bg-slate-100/0 group-hover:bg-slate-100/60 transition-colors duration-150 pointer-events-none" />
										)}

										{/* Icon container */}
										<div className="relative flex items-center justify-center w-7 h-7 rounded-[0.625rem]">
											{isActive && (
												<motion.div
													layoutId="nav-active-icon"
													transition={{
														type: "spring",
														stiffness: 440,
														damping: 34,
													}}
													className="absolute inset-0 bg-slate-900 rounded-[0.625rem] z-0"
												/>
											)}
											<Icon
												className={`relative z-10 w-[15px] h-[15px] sm:w-[16px] sm:h-[16px] shrink-0 transition-colors duration-150 ${
													isActive
														? "!text-white"
														: "!text-slate-400 group-hover:!text-slate-700"
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
														className="absolute -top-1 -right-1 z-20 flex h-[12px] min-w-[12px] px-0.5 items-center justify-center rounded-full bg-rose-500 text-[7px] font-black !text-white ring-[1.5px] ring-white"
													>
														{totalAdminBadge}
													</motion.span>
												)}
										</div>

										{/* Label + chevron indicator */}
										<div className="mt-0.5 flex items-center justify-center gap-0.5 max-w-full">
											<span
												className={`text-[9px] tracking-tight leading-none transition-colors duration-150 truncate ${
													isActive
														? "font-bold text-slate-900"
														: "font-medium text-slate-400 group-hover:text-slate-600"
												}`}
											>
												{navItem.label}
											</span>
											{hasSubItems && (
												<motion.span
													animate={{ rotate: isExpanded ? 180 : 0 }}
													transition={{ duration: 0.18, ease: "easeInOut" }}
													className={`shrink-0 transition-colors duration-150 ${
														isActive
															? "text-slate-600"
															: "text-slate-300 group-hover:text-slate-500"
													}`}
												>
													<ChevronUp className="w-2 h-2" strokeWidth={2.5} />
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
