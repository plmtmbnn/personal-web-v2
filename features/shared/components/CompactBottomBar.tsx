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
  Map,
  Layers,
  Sparkles,
  Toolbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
 * Optimized for mobile real estate by grouping related functions.
 */
const NAV_ITEMS: NavItem[] = [
  { 
    label: "Home", 
    href: "/", 
    icon: Home 
  },
  { 
    label: "Work", 
    href: "/portfolio", 
    icon: Briefcase,
    subItems: [
      { label: "Portfolio", href: "/portfolio", icon: Sparkles },
      { label: "Experience", href: "/work-experience", icon: Layers }
    ]
  },
  { 
    label: "Insights", 
    href: "/blog", 
    icon: BookOpen,
    subItems: [
      { label: "Blog Posts", href: "/blog", icon: BookOpen },
      { label: "Investments", href: "/investment", icon: TrendingUp }
    ]
  },
  { 
    label: "Adventures", 
    href: "/adventures", 
    icon: Mountain,
    subItems: [
      { label: "Explore", href: "/adventures", icon: Map },
      { label: "Running", href: "/adventures/running", icon: Mountain },
      { label: "Travel", href: "/adventures/travel", icon: Map },
      { label: "Utils", href: "/adventures/utils", icon: Toolbox }
      
    ]
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail
  },
  {
    label: "Login",
    href: "/login",
    icon: LogIn,
    hideIfLoggedIn: true
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
      { label: "Logout", icon: LogOut, onClick: () => logout() },
    ]
  },
];

export default function CompactBottomBar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const containerScale = expandedItem ? 1.02 : 1;

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
    setIsMounted(true);
    const checkUser = async () => {
      const { data: { user } } = await SupabaseConn.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await SupabaseConn.from('profiles').select('is_admin').eq('id', user.id).single();
        if (profile?.is_admin) setIsAdmin(true);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    checkUser();
    const { data: { subscription } } = SupabaseConn.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        checkUser();
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleSubMenu = (e: React.MouseEvent, label: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      e.preventDefault();
      setExpandedItem(expandedItem === label ? null : label);
    }
  };

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.toggle && ENV_GLOBAL[item.toggle] === "false") return false;
    if (item.adminOnly && !isAdmin) return false;
    if (item.hideIfLoggedIn && isLoggedIn) return false;
    return true;
  });

  if (!isMounted) return null;

  return (
    <motion.nav 
      ref={navRef} 
      animate={{ scale: containerScale }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center" 
      aria-label="Main Navigation"
    >
      <div className="glass-strong flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-white/20 backdrop-blur-xl relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/10 via-purple-500/5 to-cyan-500/10 blur-xl opacity-50 -z-10 pointer-events-none" />
        
        <div className="flex items-center gap-0.5 sm:gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.subItems?.some(sub => pathname === sub.href));
              const isHovered = hoveredItem === item.label;
              const isExpanded = expandedItem === item.label;
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <motion.div 
                  layout
                  key={item.label} 
                  className="relative flex-shrink-0"
                >
                  {/* Submenu Pop-over */}
                  <AnimatePresence>
                    {hasSubItems && isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-48 sm:w-52 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100 p-1.5 z-50 origin-bottom"
                        style={{ perspective: "1000px" }}
                        role="menu"
                      >
                        {item.subItems?.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = pathname === sub.href;
                          
                          return (
                            <Link 
                              key={sub.label} 
                              href={sub.href || "#"} 
                              onClick={() => { sub.onClick?.(); setExpandedItem(null); }}
                              className={`
                                flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200
                                ${isSubActive ? "bg-slate-50 text-indigo-600 font-bold" : "text-muted-foreground hover:text-foreground hover:bg-slate-50/80"}
                              `}
                              role="menuitem"
                            >
                              <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-indigo-600' : 'opacity-70'}`} />
                              <span>{sub.label}</span>
                              {isSubActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => toggleSubMenu(e, item.label, hasSubItems ?? false)}
                    className={`
                      group relative flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full
                      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                      ${isActive ? "bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 text-indigo-600 shadow-sm border border-indigo-100/50" : "text-muted-foreground hover:text-foreground active:scale-95"}
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active-glow"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className="absolute inset-0 rounded-full bg-indigo-400/5 blur-md -z-10"
                      />
                    )}
                    
                    <motion.div 
                      animate={{ scale: isHovered ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="relative z-10"
                    >
                      <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
                    </motion.div>

                    <span className={`relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-out ${isActive || isHovered ? "max-w-[80px] opacity-100 ml-1" : "max-w-0 opacity-0"} hidden sm:block`}>
                      {item.label}
                    </span>

                    {hasSubItems && (
                      <motion.div 
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="relative z-10 ml-0.5 opacity-40 hidden sm:block"
                      >
                        <ChevronUp className="w-3 h-3" strokeWidth={3} />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
