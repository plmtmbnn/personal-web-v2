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
		scale: 0.96,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 420,
			damping: 28,
			staggerChildren: 0.03,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 0,
		y: 6,
		scale: 0.96,
		transition: {
			duration: 0.15,
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
			stiffness: 320,
			damping: 24,
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

	// Dismiss submenu handler
	const closeSubMenu = useCallback(() => {
		setExpandedItem(null);
	}, []);

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

	// Auto-close submenu when route changes
	useEffect(() => {
		closeSubMenu();
	}, [pathname, closeSubMenu]);

	// Close on click outside or escape key
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

	const handleItemClick = (
		e: React.MouseEvent,
		navItem: NavItem,
		hasSubItems: boolean,
	) => {
		if (hasSubItems) {
			if (!hasHover) {
				// On mobile / touch screens, tap toggles the sub-menu drawer
				e.preventDefault();
				setExpandedItem((prev) =>
					prev === navItem.label ? null : navItem.label,
				);
			} else {
				// On desktop, clicking closes popover and navigates to default href
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
			{/* Mobile Dismissal Backdrop: prevents accidental click-throughs and guarantees instant 1-tap dismiss on mobile */}
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
				className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 px-2.5 sm:px-4 flex justify-center pointer-events-none"
				aria-label="Main Navigation"
			>
				<div className="bg-white flex items-center p-1 sm:p-1.5 rounded-2xl shadow-xl border border-slate-200/80 relative pointer-events-auto select-none">
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

						// Divider before admin section
						const prevItem = visibleItems[index - 1];
						const showDivider = navItem.adminOnly && index > 0 && prevItem;

						// Smart alignment to guarantee submenus NEVER clip viewport edges on handheld devices
						const isLeft = index <= 1;
						const isRight = index >= visibleItems.length - 2;
						const alignClass = isLeft
							? "left-0 sm:left-1/2 sm:-translate-x-1/2 origin-bottom-left sm:origin-bottom"
							: isRight
								? "right-0 sm:left-1/2 sm:-translate-x-1/2 origin-bottom-right sm:origin-bottom"
								: "left-1/2 -translate-x-1/2 origin-bottom";

						return (
							<div key={navItem.label} className="flex items-center">
								{/* Section divider — public nav / admin */}
								{showDivider && (
									<div className="w-px h-8 bg-slate-100 mx-0.5 sm:mx-1 shrink-0" />
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
												variants={containerVariants}
												initial={reduceMotion ? false : "hidden"}
												animate="visible"
												exit="exit"
												className={`absolute bottom-[calc(100%+12px)] ${alignClass} w-48 sm:w-52 bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 p-1.5 z-50`}
												role="menu"
												aria-label={`${navItem.label} Submenu`}
											>
												{/* Section header */}
												<div className="flex items-center justify-between px-3 pt-2 pb-1.5 border-b border-slate-100 mb-1">
													<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 select-none">
														{navItem.label}
													</p>
													<span className="text-[9px] font-bold text-slate-400">
														{subItems.length} links
													</span>
												</div>

												<div className="space-y-0.5">
													{subItems.map((sub) => {
														const SubIcon = sub.icon;
														const isSubActive = isPathActive(
															pathname,
															sub.href,
														);
														const badgeCount = getSubItemBadge(sub.label);

														const commonClasses = `flex w-full text-left items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl transition-[background-color,color] duration-150 !no-underline select-none touch-manipulation active:scale-[0.98] ${
															isSubActive
																? "bg-slate-900 !text-white shadow-xs font-bold"
																: "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80"
														}`;

														const content = (
															<>
																<div
																	className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
																		isSubActive
																			? "bg-white/15 text-white"
																			: "bg-slate-100 text-slate-600"
																	}`}
																>
																	<SubIcon
																		className={`w-3.5 h-3.5 ${
																			isSubActive
																				? "!text-white"
																				: "text-slate-600"
																		}`}
																	/>
																</div>
																<span
																	className={`truncate ${
																		isSubActive
																			? "!text-white"
																			: "text-slate-800"
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
																			closeSubMenu();
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
												</div>
											</motion.div>
										)}
									</AnimatePresence>

									<Link
										href={navItem.href}
										aria-current={isActive ? "page" : undefined}
										aria-label={navItem.label}
										aria-haspopup={hasSubItems ? "true" : undefined}
										aria-expanded={hasSubItems ? isExpanded : undefined}
										onClick={(e) => handleItemClick(e, navItem, hasSubItems)}
										className="group relative flex flex-col items-center justify-center py-1 sm:py-1.5 px-2 sm:px-2.5 rounded-xl transition-all duration-150 !no-underline select-none min-w-[50px] sm:min-w-[58px] touch-manipulation active:scale-95"
									>
										{/* Icon container with active squircle */}
										<div className="relative flex items-center justify-center w-8 h-8 rounded-xl">
											{isActive && (
												<motion.div
													layoutId="nav-active-icon"
													transition={{
														type: "spring",
														stiffness: 400,
														damping: 30,
													}}
													className="absolute inset-0 bg-slate-900 rounded-xl z-0"
												/>
											)}
											<Icon
												className={`relative z-10 w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] shrink-0 transition-colors duration-150 ${
													isActive
														? "!text-white"
														: "!text-slate-600 group-hover:!text-slate-900"
												}`}
											/>

											{/* Admin pending badge pip */}
											{navItem.label === "Admin" &&
												!isExpanded &&
												totalAdminBadge > 0 && (
													<span className="absolute -top-1 -right-1 z-20 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black !text-white ring-2 ring-white shadow-xs">
														{totalAdminBadge}
													</span>
												)}
										</div>

										{/* Persistent label + inline submenu indicator */}
										<div className="mt-0.5 sm:mt-1 flex items-center justify-center gap-0.5 max-w-full">
											<span
												className={`text-[9px] sm:text-[10px] tracking-tight leading-none transition-colors duration-150 truncate ${
													isActive
														? "font-extrabold text-slate-900"
														: "font-semibold text-slate-500 group-hover:text-slate-800"
												}`}
											>
												{navItem.label}
											</span>
											{hasSubItems && (
												<motion.span
													animate={{ rotate: isExpanded ? 180 : 0 }}
													transition={{ duration: 0.18 }}
													className={`shrink-0 transition-colors duration-150 ${
														isActive
															? "text-slate-900"
															: "text-slate-400 group-hover:text-slate-600"
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
