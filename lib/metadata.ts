import type { Metadata } from "next";
import { SITE, SEO } from "./constants";

type MetadataProps = {
  title?: string;
  description?: string;
  path?: string;
};

export function createMetadata({
  title,
  description = SEO.defaultDescription,
  path = "",
}: MetadataProps = {}): Metadata {
  const fullTitle = title
    ? `${title} · ${SITE.name}`
    : SITE.name;

  const url = `${SITE.url}${path}`;

  return {
    title: fullTitle,
    description,

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
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
