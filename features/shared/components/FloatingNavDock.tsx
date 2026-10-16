"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { SupabaseConn } from "@/lib/core/supabase";
import { logout, getAuthStatusAction } from "@/features/auth/actions";
import { getReminderCount } from "@/features/reminders/actions";
import { getPendingTasksCount } from "@/features/tasks/actions/tasks";
import { getUndoneMovementSnacksCount } from "@/features/movement/actions";
import {
	loadMovementState,
	calculateUndoneCount,
} from "@/features/movement/lib/storage";
import { ENV_GLOBAL } from "@/lib/core/env";
import {
	Home,
	BookOpen,
	LayoutDashboard,
	CheckSquare,
	LogOut,
	LogIn,
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
	Activity,
	Loader2,
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
export function isPathActive(
	currentPath: string,
	targetPath?: string,
): boolean {
	if (!targetPath) return false;
	if (targetPath === "/") return currentPath === "/";
	return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

/**
 * Resolves the single most specific active sub-item href within a submenu.
 * Prevents root routes like '/adventures' from simultaneously highlighting
 * when a child sub-route like '/adventures/running' is active.
 */
export function getActiveSubHref(
	currentPath: string,
	subItems?: SubNavItem[],
): string | undefined {
	if (!subItems || subItems.length === 0) return undefined;
	const matches = subItems.filter(
		(sub) => sub.href && isPathActive(currentPath, sub.href),
	);
	if (matches.length === 0) return undefined;
	matches.sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0));
	return matches[0].href;
}

/**
 * Resolves the single most specific active top-level nav item label.
 * Prevents multiple top-level buttons from highlighting simultaneously.
 */
export function getActiveNavLabel(
	currentPath: string,
	visibleItems: NavItem[],
): string | null {
	let bestLabel: string | null = null;
	let longestMatch = -1;

	for (const item of visibleItems) {
		let maxMatch = -1;
		if (isPathActive(currentPath, item.href)) {
			maxMatch = Math.max(maxMatch, item.href.length);
		}
		if (item.subItems) {
			for (const sub of item.subItems) {
				if (sub.href && isPathActive(currentPath, sub.href)) {
					maxMatch = Math.max(maxMatch, sub.href.length);
				}
			}
		}
		if (maxMatch > longestMatch) {
			longestMatch = maxMatch;
			bestLabel = item.label;
		}
	}

	return bestLabel;
}

export function getSubmenuSubtitle(label: string, count: number): string {
	switch (label) {
		case "Adventures":
			return `${count} destinations`;
		case "Work":
			return `${count} sections`;
		case "Admin":
			return `${count} controls`;
		default:
			return `${count} modules`;
	}
}

/**
 * Navigation Item Types
 */
export type SubNavItem = {
	href?: string;
	label: string;
	icon: React.ElementType;
	onClick?: () => void;
	description?: string;
	isLogout?: boolean;
};

export type NavItem = {
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
export const NAV_ITEMS: NavItem[] = [
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
			{
				label: "Movement Snacks",
				href: "/admin/movement",
				icon: Activity,
				description: "Desk movement breaks",
			},
			{
				label: "Logout",
				icon: LogOut,
				isLogout: true,
			},
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

export default function FloatingNavDock() {
	const pathname = usePathname();
	const isGoogleAuthEnabled = ENV_GLOBAL.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH;
	const [expandedItem, setExpandedItem] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState(!isGoogleAuthEnabled);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [pendingTasksCount, setPendingTasksCount] = useState(0);
	const [pendingRemindersCount, setPendingRemindersCount] = useState(0);
	const [pendingMovementCount, setPendingMovementCount] = useState(0);
	const [hasHover, setHasHover] = useState(false);
	const [isLoggingOut, startTransition] = useTransition();

	const navRef = useRef<HTMLElement>(null);
	const triggerRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
	const submenuRefs = useRef<{
		[key: string]: (HTMLAnchorElement | HTMLButtonElement | null)[];
	}>({});
	const isTouchDeviceRef = useRef(false);
	const isInitialAuthSyncRef = useRef(false);
	const reduceMotion = useReducedMotion();

	const closeSubMenu = useCallback(() => {
		setExpandedItem(null);
	}, []);

	// Hover media query listener
	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const mediaQuery = window.matchMedia("(hover: hover)");
		setHasHover(mediaQuery.matches);
		const listener = (e: MediaQueryListEvent) => {
			setHasHover(e.matches);
		};
		mediaQuery.addEventListener("change", listener);

		// Touch detection listener to support hybrid touchscreen laptops
		const onTouch = () => {
			isTouchDeviceRef.current = true;
		};
		const onMouse = () => {
			isTouchDeviceRef.current = false;
		};
		window.addEventListener("touchstart", onTouch, { passive: true });
		window.addEventListener("mousemove", onMouse, { passive: true });

		return () => {
			mediaQuery.removeEventListener("change", listener);
			window.removeEventListener("touchstart", onTouch);
			window.removeEventListener("mousemove", onMouse);
		};
	}, []);

	// Close submenu on route transitions
	useEffect(() => {
		closeSubMenu();
	}, [pathname, closeSubMenu]);

	// Handle outside clicks and global Escape key
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
		document.addEventListener("touchstart", handleClickOutside, {
			passive: true,
		});
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [closeSubMenu]);

	// Centralized Auth Synchronization with Single-Action Optimization & LocalStorage Hint
	const syncAuthState = useCallback(async () => {
		if (!isGoogleAuthEnabled) {
			setIsAdmin(true);
			setIsLoggedIn(true);
			return;
		}

		// Optimistic hint: if valid PIN session exists in localStorage, reveal early
		if (typeof window !== "undefined") {
			try {
				const sessionStr = localStorage.getItem("auth_pin_session");
				if (sessionStr) {
					const { authenticated, timestamp } = JSON.parse(sessionStr);
					if (authenticated && Date.now() - timestamp < 3600000 * 12) {
						setIsAdmin(true);
						setIsLoggedIn(true);
					}
				}
			} catch {
				// Silently fallback to server action check
			}
		}

		try {
			const status = await getAuthStatusAction();
			setIsAdmin(status.isAdmin);
			setIsLoggedIn(status.isLoggedIn);
		} catch {
			setIsAdmin(false);
			setIsLoggedIn(false);
		}
	}, [isGoogleAuthEnabled]);

	// Reactive Auth Listeners (Mount, Supabase changes, cross-component events, and tab focus)
	useEffect(() => {
		syncAuthState();

		const onAuthUpdate = () => {
			syncAuthState();
		};
		const onFocus = () => {
			syncAuthState();
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") {
				syncAuthState();
			}
		};

		window.addEventListener("auth:state:updated", onAuthUpdate);
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisibility);

		const {
			data: { subscription },
		} = SupabaseConn.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setIsLoggedIn(true);
				syncAuthState();
			} else {
				setIsLoggedIn(false);
				setIsAdmin(false);
				setPendingTasksCount(0);
				setPendingRemindersCount(0);
				setPendingMovementCount(0);
			}
		});

		return () => {
			window.removeEventListener("auth:state:updated", onAuthUpdate);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisibility);
			subscription.unsubscribe();
		};
	}, [syncAuthState]);

	// Re-sync auth immediately on route change (e.g. login -> admin navigation)
	useEffect(() => {
		if (isInitialAuthSyncRef.current) {
			syncAuthState();
		} else {
			isInitialAuthSyncRef.current = true;
		}
	}, [syncAuthState, pathname]);

	// Pending Admin Telemetry Badges (Tasks, Reminders, and Movement Snacks)
	const fetchPendingCounts = useCallback(async () => {
		if (!isGoogleAuthEnabled || (isLoggedIn && isAdmin)) {
			// Optimistic hint: if movement state exists in localStorage, display it immediately
			if (typeof window !== "undefined") {
				try {
					const local = loadMovementState();
					if (local?.logs) {
						setPendingMovementCount(calculateUndoneCount(local));
					}
				} catch {
					// Fall through to server fetch
				}
			}

			try {
				const [taskCount, reminderCount, movementCount] = await Promise.all([
					getPendingTasksCount(),
					getReminderCount(),
					getUndoneMovementSnacksCount(),
				]);
				setPendingTasksCount(taskCount);
				setPendingRemindersCount(reminderCount);
				setPendingMovementCount(movementCount);
			} catch (err) {
				console.error("Error fetching admin telemetry counts:", err);
			}
		} else {
			setPendingTasksCount(0);
			setPendingRemindersCount(0);
			setPendingMovementCount(0);
		}
	}, [isLoggedIn, isAdmin, isGoogleAuthEnabled]);

	// Re-fetch badges on route change or when tab regains focus or auth/movement updates
	useEffect(() => {
		fetchPendingCounts();

		const onFocus = () => {
			fetchPendingCounts();
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") {
				fetchPendingCounts();
			}
		};
		const onMovement = (event: Event) => {
			const customEvent = event as CustomEvent<{ undoneCount?: number }>;
			if (typeof customEvent.detail?.undoneCount === "number") {
				setPendingMovementCount(customEvent.detail.undoneCount);
				return;
			}
			fetchPendingCounts();
		};
		const onAuth = () => {
			fetchPendingCounts();
		};

		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisibility);
		window.addEventListener("movement:state:updated", onMovement);
		window.addEventListener("auth:state:updated", onAuth);
		return () => {
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisibility);
			window.removeEventListener("movement:state:updated", onMovement);
			window.removeEventListener("auth:state:updated", onAuth);
		};
	}, [fetchPendingCounts, pathname]);

	const handleLogout = useCallback(() => {
		startTransition(async () => {
			closeSubMenu();
			if (typeof window !== "undefined") {
				localStorage.removeItem("auth_pin_session");
				window.dispatchEvent(
					new CustomEvent("auth:state:updated", {
						detail: { authenticated: false },
					}),
				);
			}
			setIsAdmin(false);
			setIsLoggedIn(false);
			await logout();
		});
	}, [closeSubMenu]);

	const visibleItems = NAV_ITEMS.filter((item) => {
		if (item.toggle && !ENV_GLOBAL[item.toggle]) return false;
		if (item.adminOnly && !isAdmin && isGoogleAuthEnabled) return false;
		if (item.hideIfLoggedIn && (isLoggedIn || !isGoogleAuthEnabled))
			return false;
		return true;
	});

	const handleItemClick = (
		e: React.MouseEvent,
		navItem: NavItem,
		hasSubItems: boolean,
	) => {
		if (hasSubItems) {
			const isTouch = isTouchDeviceRef.current || !hasHover;
			if (isTouch) {
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

	// Keyboard navigation for top-level dock triggers
	const handleTriggerKeyDown = (
		e: React.KeyboardEvent,
		navItem: NavItem,
		hasSubItems: boolean,
		index: number,
	) => {
		if (
			hasSubItems &&
			(e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")
		) {
			e.preventDefault();
			setExpandedItem(navItem.label);
			setTimeout(() => {
				const firstSubItem = submenuRefs.current[navItem.label]?.[0];
				firstSubItem?.focus();
			}, 40);
			return;
		}

		if (e.key === "ArrowRight") {
			e.preventDefault();
			const nextIdx = (index + 1) % visibleItems.length;
			const nextItem = visibleItems[nextIdx];
			triggerRefs.current[nextItem.label]?.focus();
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			const prevIdx = (index - 1 + visibleItems.length) % visibleItems.length;
			const prevItem = visibleItems[prevIdx];
			triggerRefs.current[prevItem.label]?.focus();
		}
	};

	// Keyboard navigation within submenu rows
	const handleSubmenuKeyDown = (
		e: React.KeyboardEvent,
		parentLabel: string,
		subIndex: number,
		subItemsCount: number,
	) => {
		const items = submenuRefs.current[parentLabel] || [];

		if (e.key === "ArrowDown") {
			e.preventDefault();
			const nextIndex = (subIndex + 1) % subItemsCount;
			items[nextIndex]?.focus();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			const prevIndex = (subIndex - 1 + subItemsCount) % subItemsCount;
			items[prevIndex]?.focus();
		} else if (e.key === "Home") {
			e.preventDefault();
			items[0]?.focus();
		} else if (e.key === "End") {
			e.preventDefault();
			items[subItemsCount - 1]?.focus();
		} else if (e.key === "Escape") {
			e.preventDefault();
			closeSubMenu();
			triggerRefs.current[parentLabel]?.focus();
		}
	};

	const getSubItemBadge = (subLabel: string) => {
		if (subLabel === "Manage Tasks" && pendingTasksCount > 0) {
			return pendingTasksCount;
		}
		if (subLabel === "Quick Reminders" && pendingRemindersCount > 0) {
			return pendingRemindersCount;
		}
		if (subLabel === "Movement Snacks" && pendingMovementCount > 0) {
			return pendingMovementCount;
		}
		return null;
	};

	const totalAdminBadge =
		pendingTasksCount + pendingRemindersCount + pendingMovementCount;

	return (
		<>
			{/* Universal Touch Dismissal Backdrop (Active whenever submenu is open) */}
			<AnimatePresence>
				{expandedItem && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 z-40 bg-slate-900/5 sm:bg-transparent pointer-events-auto"
						onClick={closeSubMenu}
						aria-hidden="true"
					/>
				)}
			</AnimatePresence>

			<motion.nav
				ref={navRef}
				className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:bottom-4 left-0 right-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none"
				aria-label="Main Navigation"
			>
				{/* Bar shell */}
				<div
					className="bg-white/95 backdrop-blur-md flex items-center p-1 rounded-2xl border border-slate-200/70 relative pointer-events-auto select-none gap-0.5 sm:gap-1"
					style={{
						boxShadow:
							"0 4px 24px -4px rgba(15,23,42,0.10), 0 1px 6px -1px rgba(15,23,42,0.06), 0 0 0 0.5px rgba(15,23,42,0.04)",
					}}
				>
					{(() => {
						const activeNavLabel = getActiveNavLabel(pathname, visibleItems);

						return visibleItems.map((navItem, index) => {
							const Icon = navItem.icon;
							const subItems = navItem.subItems?.filter(
								(sub) => isGoogleAuthEnabled || !sub.isLogout,
							);
							const isActive = navItem.label === activeNavLabel;
							const isExpanded = expandedItem === navItem.label;
							const hasSubItems = Boolean(subItems && subItems.length > 0);

							const prevItem = visibleItems[index - 1];
							const showDivider = navItem.adminOnly && index > 0 && prevItem;

							const isLeft = index <= 1;
							const isRight = index >= visibleItems.length - 2;
							const alignClass = isLeft
								? "left-0 sm:left-1/2 sm:-translate-x-1/2 origin-bottom-left sm:origin-bottom"
								: isRight
									? "right-0 sm:right-0 sm:left-auto sm:translate-x-0 origin-bottom-right sm:origin-bottom-right"
									: "left-1/2 -translate-x-1/2 origin-bottom";

							const submenuId = `submenu-${navItem.label.toLowerCase()}`;

							return (
								<div key={navItem.label} className="flex items-center">
									{showDivider && (
										<div className="w-px h-5 bg-slate-200/80 mx-0.5 sm:mx-1 shrink-0" />
									)}

									<div
										className="relative flex-shrink-0"
										onMouseEnter={
											hasHover && !isTouchDeviceRef.current && hasSubItems
												? () => setExpandedItem(navItem.label)
												: undefined
										}
										onMouseLeave={
											hasHover && !isTouchDeviceRef.current && hasSubItems
												? () => closeSubMenu()
												: undefined
										}
									>
										{/* Submenu Pop-over */}
										<AnimatePresence>
											{hasSubItems && isExpanded && subItems && (
												<motion.div
													id={submenuId}
													variants={submenuVariants}
													initial={reduceMotion ? false : "hidden"}
													animate="visible"
													exit="exit"
													className={`absolute bottom-[calc(100%+10px)] ${alignClass} w-48 bg-white rounded-xl border border-slate-200/70 z-50 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain`}
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
																<p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-800 leading-none">
																	{navItem.label}
																</p>
																<p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-none">
																	{getSubmenuSubtitle(
																		navItem.label,
																		subItems.length,
																	)}
																</p>
															</div>
														</div>
													</div>

													<div className="mx-2 border-t border-slate-100 mb-1" />

													<div className="px-1 pb-1 space-y-px">
														{(() => {
															const activeSubHref = getActiveSubHref(
																pathname,
																subItems,
															);

															return subItems.map((sub, subIdx) => {
																const SubIcon = sub.icon;
																const isSubActive = sub.href
																	? sub.href === activeSubHref
																	: false;
																const badgeCount = getSubItemBadge(sub.label);

																const content = (
																	<>
																		<div
																			className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
																				isSubActive
																					? "bg-white/20 text-white"
																					: "bg-slate-100 text-slate-500 group-hover/sub:bg-slate-200/80 group-hover/sub:text-slate-700"
																			}`}
																		>
																			{sub.isLogout && isLoggingOut ? (
																				<Loader2 className="w-3 h-3 animate-spin text-slate-500" />
																			) : (
																				<SubIcon className="w-3 h-3" />
																			)}
																		</div>
																		<div className="min-w-0 flex-1">
																			<span
																				className={`block text-[11px] font-semibold leading-tight truncate transition-colors ${
																					isSubActive
																						? "text-white"
																						: "text-slate-800 group-hover/sub:text-slate-950"
																				}`}
																			>
																				{sub.label}
																			</span>
																			{sub.description && (
																				<span
																					className={`block text-[10px] leading-tight truncate mt-0.5 transition-colors ${
																						isSubActive
																							? "text-white/60"
																							: "text-slate-400 group-hover/sub:text-slate-600"
																					}`}
																				>
																					{sub.description}
																				</span>
																			)}
																		</div>
																		{badgeCount !== null && (
																			<span
																				className={`shrink-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold ${
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

																const rowClass = `group/sub flex w-full text-left items-center gap-2 px-1.5 py-1.5 rounded-lg transition-[background-color,color] duration-150 !no-underline select-none touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900/30 focus-visible:bg-slate-100/90 ${
																	isSubActive
																		? "bg-slate-900 text-white shadow-xs"
																		: "text-slate-700 hover:bg-slate-100/70"
																}`;

																return (
																	<motion.div
																		key={sub.label}
																		variants={itemVariants}
																	>
																		{sub.href ? (
																			<Link
																				ref={(el) => {
																					if (
																						!submenuRefs.current[navItem.label]
																					) {
																						submenuRefs.current[navItem.label] =
																							[];
																					}
																					submenuRefs.current[navItem.label][
																						subIdx
																					] = el;
																				}}
																				href={sub.href}
																				onClick={() => {
																					sub.onClick?.();
																					closeSubMenu();
																				}}
																				onKeyDown={(e) =>
																					handleSubmenuKeyDown(
																						e,
																						navItem.label,
																						subIdx,
																						subItems.length,
																					)
																				}
																				className={rowClass}
																				role="menuitem"
																			>
																				{content}
																			</Link>
																		) : (
																			<button
																				ref={(el) => {
																					if (
																						!submenuRefs.current[navItem.label]
																					) {
																						submenuRefs.current[navItem.label] =
																							[];
																					}
																					submenuRefs.current[navItem.label][
																						subIdx
																					] = el;
																				}}
																				type="button"
																				onClick={() => {
																					if (sub.isLogout) {
																						handleLogout();
																					} else {
																						sub.onClick?.();
																						closeSubMenu();
																					}
																				}}
																				onKeyDown={(e) =>
																					handleSubmenuKeyDown(
																						e,
																						navItem.label,
																						subIdx,
																						subItems.length,
																					)
																				}
																				disabled={sub.isLogout && isLoggingOut}
																				className={rowClass}
																				role="menuitem"
																			>
																				{content}
																			</button>
																		)}
																	</motion.div>
																);
															});
														})()}
													</div>
												</motion.div>
											)}
										</AnimatePresence>

										{/* Icon-Only Nav Button */}
										<Link
											ref={(el) => {
												triggerRefs.current[navItem.label] = el;
											}}
											href={navItem.href}
											aria-current={isActive ? "page" : undefined}
											aria-label={navItem.label}
											aria-haspopup={hasSubItems ? "menu" : undefined}
											aria-expanded={hasSubItems ? isExpanded : undefined}
											aria-controls={hasSubItems ? submenuId : undefined}
											onClick={(e) => handleItemClick(e, navItem, hasSubItems)}
											onKeyDown={(e) =>
												handleTriggerKeyDown(e, navItem, hasSubItems, index)
											}
											title={navItem.label}
											className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-150 !no-underline select-none touch-manipulation active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-1"
										>
											{/* Active sliding background */}
											{isActive && (
												<motion.div
													layoutId="nav-active-icon"
													transition={{
														type: "spring",
														stiffness: 440,
														damping: 34,
													}}
													className="absolute inset-0 bg-slate-900 rounded-xl z-0 shadow-xs"
												/>
											)}

											{/* Inactive Hover Background */}
											{!isActive && (
												<span className="absolute inset-0 rounded-xl bg-slate-100/0 group-hover:bg-slate-100/70 transition-colors duration-150 pointer-events-none" />
											)}

											{/* Icon */}
											<Icon
												className={`relative z-10 w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] shrink-0 transition-colors duration-150 ${
													isActive
														? "!text-white"
														: "!text-slate-400 group-hover:!text-slate-700"
												}`}
											/>

											{/* Submenu Indicator Dot */}
											{hasSubItems && (
												<span
													className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-colors duration-150 pointer-events-none z-10 ${
														isActive
															? "bg-white/70"
															: "bg-slate-300 group-hover:bg-slate-500"
													}`}
													aria-hidden="true"
												/>
											)}

											{/* Admin Pending Badge Pip */}
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
														className="absolute -top-1 -right-1 z-20 flex h-[14px] min-w-[14px] px-1 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold !text-white ring-[1.5px] ring-white"
													>
														{totalAdminBadge}
													</motion.span>
												)}
										</Link>
									</div>
								</div>
							);
						});
					})()}
				</div>
			</motion.nav>
		</>
	);
}
