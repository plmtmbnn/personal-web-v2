"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
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
    href: "/work-experience", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ), 
    label: "Experience" 
  },
  { 
    href: "/portfolio", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ), 
    label: "Portfolio" 
  },
  { 
    href: "/adventures", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ), 
    label: "Adventures" 
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

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4">
      <div className="glass-strong flex items-center gap-1 px-3 py-3 rounded-full shadow-2xl border border-white/20 backdrop-blur-xl">
        {/* Glow effect background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 via-black-500/20 to-cyan-500/20 blur-xl opacity-50"></div>
        
        <div className="relative flex items-center gap-1">
          {navItems.map(({ href, icon, label }) => {
            const isActive = pathname === href;
            const isHovered = hoveredItem === href;

            return (
              <Link
                key={href}
                href={href}
                title={label}
                onMouseEnter={() => setHoveredItem(href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  group relative flex items-center gap-2 px-4 py-2.5 rounded-full
                  transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "bg-gradient-to-r from-accent to-black-600 text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {/* Active item glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-accent blur-md opacity-50 animate-pulse"></div>
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
                        ? "max-w-[100px] opacity-100"
                        : "max-w-0 opacity-0"
                    }
                    hidden sm:block
                  `}
                >
                  {label}
                </span>

                {/* Tooltip for mobile */}
                <div className={`
                  absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5
                  glass-strong rounded-lg text-xs font-medium whitespace-nowrap
                  transition-all duration-200
                  ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                  sm:hidden
                `}>
                  {label}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/10 rotate-45"></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom glow reflection */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-accent/20 via-black-500/20 to-cyan-500/20 blur-2xl opacity-40 rounded-full"></div>
    </nav>
  );
}