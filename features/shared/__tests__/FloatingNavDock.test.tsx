import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

// Mock environment variables before importing FloatingNavDock
vi.mock("@/lib/core/env", () => ({
	get ENV_GLOBAL() {
		return {
			NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: true,
			NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
			NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
		};
	},
}));

// Mock Supabase client
vi.mock("@/lib/core/supabase", () => ({
	SupabaseConn: {
		auth: {
			getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } },
			}),
		},
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				neq: vi.fn().mockReturnThis(),
				lte: vi.fn().mockResolvedValue({ count: 0, error: null }),
			}),
		}),
	},
}));

// Mock Server Actions
vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn().mockResolvedValue(false),
	getAuthStatusAction: vi
		.fn()
		.mockResolvedValue({ isAdmin: false, isLoggedIn: false }),
	logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/reminders/actions", () => ({
	getReminderCount: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/features/tasks/actions/tasks", () => ({
	getPendingTasksCount: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/features/movement/actions", () => ({
	getUndoneMovementSnacksCount: vi.fn().mockResolvedValue(0),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
	usePathname: vi.fn().mockReturnValue("/"),
}));

// Mock framer-motion to render plain DOM without animation issues in JSDOM
vi.mock("framer-motion", async () => {
	const actual =
		await vi.importActual<typeof import("framer-motion")>("framer-motion");
	return {
		...actual,
		useReducedMotion: () => false,
		AnimatePresence: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
		motion: {
			nav: ({ children, ...props }: React.ComponentPropsWithoutRef<"nav">) => (
				<nav {...props}>{children}</nav>
			),
			div: ({
				children,
				layoutId: _layoutId,
				...props
			}: React.ComponentPropsWithoutRef<"div"> & { layoutId?: string }) => (
				<div {...props}>{children}</div>
			),
			span: ({
				children,
				layoutId: _layoutId,
				...props
			}: React.ComponentPropsWithoutRef<"span"> & { layoutId?: string }) => (
				<span {...props}>{children}</span>
			),
		},
	};
});

import FloatingNavDock, {
	isPathActive,
	getActiveSubHref,
	getActiveNavLabel,
	getSubmenuSubtitle,
	NAV_ITEMS,
} from "../components/FloatingNavDock";
import { getAuthStatusAction } from "@/features/auth/actions";

describe("FloatingNavDock Helper Functions", () => {
	describe("isPathActive()", () => {
		it("matches root path exact only", () => {
			expect(isPathActive("/", "/")).toBe(true);
			expect(isPathActive("/portfolio", "/")).toBe(false);
			expect(isPathActive("/blog", "/")).toBe(false);
		});

		it("matches exact target path", () => {
			expect(isPathActive("/portfolio", "/portfolio")).toBe(true);
			expect(isPathActive("/admin", "/admin")).toBe(true);
		});

		it("matches nested sub-path routes", () => {
			expect(isPathActive("/adventures/running", "/adventures")).toBe(true);
			expect(isPathActive("/blog/engineering-notes", "/blog")).toBe(true);
			expect(isPathActive("/utils/stock-explorer/admin", "/utils")).toBe(true);
		});

		it("returns false for non-matching paths", () => {
			expect(isPathActive("/contact", "/portfolio")).toBe(false);
			expect(isPathActive("/tasks", "/admin/blog")).toBe(false);
			expect(isPathActive("/undefined", undefined)).toBe(false);
		});
	});

	describe("getActiveSubHref()", () => {
		const sampleSubItems = [
			{ label: "Explore", href: "/adventures", icon: () => null },
			{ label: "Running", href: "/adventures/running", icon: () => null },
			{ label: "Travel", href: "/adventures/travel", icon: () => null },
		];

		it("resolves the specific child route rather than the parent root", () => {
			expect(getActiveSubHref("/adventures/running", sampleSubItems)).toBe(
				"/adventures/running",
			);
		});

		it("resolves the general route when on parent path", () => {
			expect(getActiveSubHref("/adventures", sampleSubItems)).toBe(
				"/adventures",
			);
		});

		it("returns undefined when no sub-item matches the current path", () => {
			expect(getActiveSubHref("/portfolio", sampleSubItems)).toBeUndefined();
		});

		it("returns undefined for empty subItems", () => {
			expect(getActiveSubHref("/adventures", [])).toBeUndefined();
			expect(getActiveSubHref("/adventures", undefined)).toBeUndefined();
		});
	});

	describe("getActiveNavLabel()", () => {
		it("resolves Home for root / path", () => {
			expect(getActiveNavLabel("/", NAV_ITEMS)).toBe("Home");
		});

		it("resolves Work for /portfolio and child routes like /work-experience or /contact", () => {
			expect(getActiveNavLabel("/portfolio", NAV_ITEMS)).toBe("Work");
			expect(getActiveNavLabel("/work-experience", NAV_ITEMS)).toBe("Work");
			expect(getActiveNavLabel("/contact", NAV_ITEMS)).toBe("Work");
		});

		it("resolves Insights for /insights, /blog, /investment, /liverpool, and /utils", () => {
			expect(getActiveNavLabel("/insights", NAV_ITEMS)).toBe("Insights");
			expect(getActiveNavLabel("/blog", NAV_ITEMS)).toBe("Insights");
			expect(getActiveNavLabel("/investment", NAV_ITEMS)).toBe("Insights");
			expect(getActiveNavLabel("/liverpool", NAV_ITEMS)).toBe("Insights");
			expect(getActiveNavLabel("/utils", NAV_ITEMS)).toBe("Insights");
		});

		it("resolves Admin for /admin, /tasks, and admin utilities", () => {
			expect(getActiveNavLabel("/admin", NAV_ITEMS)).toBe("Admin");
			expect(getActiveNavLabel("/tasks", NAV_ITEMS)).toBe("Admin");
			expect(getActiveNavLabel("/admin/reminders", NAV_ITEMS)).toBe("Admin");
			expect(getActiveNavLabel("/admin/movement", NAV_ITEMS)).toBe("Admin");
		});

		it("returns null for routes not matching any nav item", () => {
			expect(getActiveNavLabel("/unauthorized", NAV_ITEMS)).toBeNull();
			expect(getActiveNavLabel("/404-not-found", NAV_ITEMS)).toBeNull();
		});
	});

	describe("getSubmenuSubtitle()", () => {
		it("formats subtitles according to domain context", () => {
			expect(getSubmenuSubtitle("Adventures", 3)).toBe("3 destinations");
			expect(getSubmenuSubtitle("Work", 3)).toBe("3 sections");
			expect(getSubmenuSubtitle("Admin", 7)).toBe("7 controls");
			expect(getSubmenuSubtitle("Insights", 5)).toBe("5 modules");
		});
	});
});

describe("FloatingNavDock Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it("renders main navigation dock with accessible labels", () => {
		render(<FloatingNavDock />);

		const nav = screen.getByRole("navigation", { name: "Main Navigation" });
		expect(nav).toBeDefined();

		// Check accessible link labels
		expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
		expect(screen.getByRole("link", { name: "Work" })).toBeDefined();
		expect(screen.getByRole("link", { name: "Insights" })).toBeDefined();
		expect(screen.getByRole("link", { name: "Adventures" })).toBeDefined();
	});

	it("enforces Icon-Only Dock Standard (zero text labels on main buttons)", () => {
		render(<FloatingNavDock />);

		const homeLink = screen.getByRole("link", { name: "Home" });
		const workLink = screen.getByRole("link", { name: "Work" });

		// Links should not have visible text nodes inside them (icon only)
		expect(homeLink.textContent?.trim()).toBe("");
		expect(workLink.textContent?.trim()).toBe("");

		// But must have title and aria-label for accessibility
		expect(homeLink.getAttribute("aria-label")).toBe("Home");
		expect(homeLink.getAttribute("title")).toBe("Home");
		expect(workLink.getAttribute("aria-label")).toBe("Work");
		expect(workLink.getAttribute("title")).toBe("Work");
	});

	it("declares WAI-ARIA menu popup attributes on items with submenus", () => {
		render(<FloatingNavDock />);

		const workLink = screen.getByRole("link", { name: "Work" });
		expect(workLink.getAttribute("aria-haspopup")).toBe("menu");
		expect(workLink.getAttribute("aria-controls")).toBe("submenu-work");

		const homeLink = screen.getByRole("link", { name: "Home" });
		expect(homeLink.getAttribute("aria-haspopup")).toBeNull();
	});

	it("re-syncs auth immediately upon receiving auth:state:updated custom event", async () => {
		vi.mocked(getAuthStatusAction).mockResolvedValueOnce({
			isAdmin: false,
			isLoggedIn: false,
		});

		render(<FloatingNavDock />);
		expect(getAuthStatusAction).toHaveBeenCalledTimes(1);

		// Now simulate successful login event dispatch
		vi.mocked(getAuthStatusAction).mockResolvedValueOnce({
			isAdmin: true,
			isLoggedIn: true,
		});

		await act(async () => {
			window.dispatchEvent(
				new CustomEvent("auth:state:updated", {
					detail: { authenticated: true },
				}),
			);
		});

		expect(getAuthStatusAction).toHaveBeenCalledTimes(2);
	});

	it("updates movement snacks badge immediately upon receiving movement:state:updated with detail", async () => {
		vi.mocked(getAuthStatusAction).mockResolvedValue({
			isAdmin: true,
			isLoggedIn: true,
		});

		render(<FloatingNavDock />);

		// Allow initial auth sync to resolve so Admin item is visible
		await act(async () => {});

		await act(async () => {
			window.dispatchEvent(
				new CustomEvent("movement:state:updated", {
					detail: { undoneCount: 4 },
				}),
			);
		});

		// Verify the badge renders 4
		expect(screen.getByText("4")).toBeDefined();
	});
});
