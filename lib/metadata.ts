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
};

export function createMetadata({
  title,
  description = SEO.defaultDescription,
  path = "",
  image,
  noIndex = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
}: MetadataProps = {}): Metadata {
  const fullTitle = title ? `${title} · ${SITE.name}` : SITE.name;
  const url = `${SITE.url}${path}`;
  const ogImage = image || `${SITE.url}/profile.jpg`; // Default OG image

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(", "),
    authors: author ? [{ name: author }] : [{ name: SITE.author }],

    metadataBase: new URL(SITE.url),
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
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: SITE.twitter,
    },
  };
}

// Helper for blog posts with article-specific metadata
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
  const fullTitle = `${title} · ${SITE.name}`;
  const url = `${SITE.url}/blog/${slug}`;
  const ogImage = image || `${SITE.url}/profile.jpg`;

  return {
    title: fullTitle,
    description,
    keywords: tags?.join(", "),
    authors: author ? [{ name: author }] : [{ name: SITE.author }],

    metadataBase: new URL(SITE.url),
    alternates: {
      canonical: url,
    },

    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "article",
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      authors: [author || SITE.author],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: SITE.twitter,
    },
  };
}

// Helper for generating JSON-LD structured data
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
      "@type": "Person",
      name: SITE.author,
      url: SITE.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/blog/${slug}`,
    },
  };
}