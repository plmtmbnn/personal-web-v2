"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SubNavItem = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  subItems?: SubNavItem[];
};

const navItems: NavItem[] = [
  { 
    href: "/", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ), 
    label: "Home" 
  },
  { 
    href: "/work", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ), 
    label: "Work",
    subItems: [
      { href: "/work-experience", label: "Experience" },
      { href: "/portfolio", label: "Portfolio" }
    ]
  },
  { 
    href: "/adventures", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ), 
    label: "Adventures",
    subItems: [
      { href: "/adventures/running", label: "Running" },
      { href: "/adventures/travel", label: "Travel" }
    ]
  },
  { 
    href: "/blog", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ), 
    label: "Blog" 
  },
  { 
    href: "/contact", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ), 
    label: "Contact" 
  },
];

export default function EnhancedNavbar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleSubMenu = (e: React.MouseEvent, href: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      e.preventDefault();
      setExpandedItem(expandedItem === href ? null : href);
    }
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4">
      <div className="glass-strong flex items-center gap-1 px-3 py-3 rounded-full shadow-2xl border border-white/20 backdrop-blur-xl relative">
        {/* Glow effect background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 via-purple-500/10 to-cyan-500/10 blur-xl opacity-50 -z-10"></div>
        
        <div className="flex items-center gap-1">
          {navItems.map(({ href, icon, label, subItems }) => {
            const isActive = pathname === href;
            const isHovered = hoveredItem === href;
            const isExpanded = expandedItem === href;
            const hasSubItems = subItems && subItems.length > 0;

            return (
              <div key={href} className="relative">
                {/* Submenu (Collapse Up) - Clean & Non-transparent */}
                {hasSubItems && isExpanded && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-48 bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 animate-fade-in p-1.5">
                    {subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setExpandedItem(null)}
                          className={`
                            flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                            ${
                              isSubActive
                                ? "bg-slate-50 text-indigo-600"
                                : "text-muted-foreground hover:text-foreground hover:bg-slate-50/80"
                            }
                          `}
                        >
                          <span>{sub.label}</span>
                          {isSubActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <Link
                  href={href}
                  title={label}
                  onMouseEnter={() => setHoveredItem(href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={(e) => toggleSubMenu(e, href, hasSubItems ?? false)}
                  className={`
                    group relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full
                    transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-indigo-600 shadow-sm border border-indigo-100/50"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {/* Active item glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-indigo-400/10 blur-lg animate-pulse"></div>
                  )}
                  
                  {/* Hover background */}
                  {!isActive && isHovered && (
                    <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"></div>
                  )}

                  {/* Icon */}
                  <div className={`relative z-10 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                    {icon}
                  </div>

                  {/* Label - shows on active or hover */}
                  <span 
                    className={`
                      relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden
                      transition-all duration-300 ease-out
                      ${
                        isActive || isHovered
                          ? "max-w-[100px] opacity-100 ml-1"
                          : "max-w-0 opacity-0"
                      }
                      hidden sm:block
                    `}
                  >
                    {label}
                  </span>

                  {/* Submenu Indicator */}
                  {hasSubItems && (
                    <div className={`relative z-10 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-3 h-3 ml-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom glow reflection */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-accent/20 via-purple-500/10 to-cyan-500/10 blur-2xl opacity-30 rounded-full -z-10"></div>
    </nav>
  );
}