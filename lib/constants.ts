/**
 * Global application constants
 * Keep all site-wide values here
 */

export const EXPERIENCE_YEAR = new Date().getFullYear() - 2018;

export const SITE = {
  name: "Polma Tambunan",
  tagline: "Thoughtful Engineering. Intentional Running.",
  description:
    `Software engineer with ${EXPERIENCE_YEAR}+ years of experience in fintech, building reliable systems and running 1000KM+ per year.`,
  url: "https://polmatambunan.com", // update when live
  locale: "en_US",
  author: "Polma Tambunan",
  twitter: "https://x.com/LFC"
};

export const AUTHOR = {
  name: "Polma Tambunan",
  role: "Software Engineer",
  email: "hello@polmatambunan.com",
};

export const SEO = {
  defaultTitle: SITE.name,
  titleTemplate: "%s · Polma Tambunan",
  defaultDescription: SITE.tagline,
  twitterHandle: "@polmatambunan", // optional
};

export const SOCIAL_LINKS = {
  github: "https://github.com/yourusername",
  linkedin: "https://linkedin.com/in/yourusername",
  twitter: "https://twitter.com/yourusername",
};

export const NAVIGATION = [
  { href: "/", label: "Home" },
  { href: "/work-experience", label: "Experience" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/adventures", label: "Adventures" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

