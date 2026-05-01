import type { Metadata } from "next";
import { SITE, SEO } from "./constants";

type MetadataProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: "website" | "article";
};

/**
 * Enhanced Metadata Generator for Next.js 16
 * Optimizes for SEO, OpenGraph, and Twitter previews.
 */
export function createMetadata({
  title,
  description = SITE.description,
  path = "",
  image,
  noIndex = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
  type = "website",
}: MetadataProps = {}): Metadata {
  const url = `${SITE.url}${path}`;
  
  // Ensure we have an absolute URL for the image
  const ogImage = image 
    ? image.startsWith("http") ? image : `${SITE.url}${image}`
    : `${SITE.url}/profile.jpg`;

  const finalKeywords = [
    ...(keywords || []),
    "software engineer",
    "fintech",
    "jakarta",
    "typescript",
    "next.js",
    "polma tambunan",
    "intentional running"
  ].join(", ");

  return {
    metadataBase: new URL(SITE.url),
    title: {
      template: SEO.titleTemplate,
      default: SITE.name,
    },
    description,
    keywords: finalKeywords,
    authors: [{ name: author || SITE.author }],
    creator: SITE.author,
    
    alternates: {
      canonical: url,
    },

    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },

    openGraph: {
      title: title ? `${title} | ${SITE.name}` : SITE.name,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || SITE.name,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${SITE.name}` : SITE.name,
      description,
      images: [ogImage],
      creator: SEO.twitterHandle,
      site: SEO.twitterHandle,
    },

    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },

    manifest: "/site.webmanifest",
    
    // Additional SEO tags
    category: "technology",
    other: {
      "facebook-domain-verification": "optional-code",
    }
  };
}

/**
 * Specific helper for Blog Posts
 */
export function createBlogMetadata({
  title,
  description,
  slug,
  image,
  publishedTime,
  modifiedTime,
  author,
  tags,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}): Metadata {
  return createMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    image,
    publishedTime,
    modifiedTime,
    author,
    keywords: tags,
    type: "article",
  });
}

/**
 * Generate JSON-LD for Search Engine Rich Snippets
 */
export function generateBlogPostJsonLd({
  title,
  description,
  slug,
  image,
  publishedTime,
  modifiedTime,
  author,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: image || `${SITE.url}/profile.jpg`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Person",
      name: author || SITE.author,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/profile.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/blog/${slug}`,
    },
  };
}
