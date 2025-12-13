"use client"; // REQUIRED: This directive marks it as a Client Component

import { useEffect, useState } from "react";
// You will need to install this package: npm install dompurify
import DOMPurify from "dompurify";

type ContentRendererProps = {
  content: string;
};

/**
 * Renders HTML content securely using DOMPurify.
 * This component MUST be a Client Component because DOMPurify
 * requires access to the browser's 'window' and 'document' objects.
 */
export default function ContentRenderer({ content }: ContentRendererProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState("");

  useEffect(() => {
    // This code only runs in the browser environment, preventing SSR errors.
    const cleanHtml = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
    });
    setSanitizedHtml(cleanHtml);
  }, [content]); // Re-sanitize if the content prop changes

  if (!sanitizedHtml) {
    // Optional: Render a loading state until hydration is complete
    return (
      <div className="prose prose-lg mt-8 animate-pulse bg-gray-100 h-96 rounded"></div>
    );
  }

  return (
    <div
      className="prose prose-lg mt-8"
      // Use the safely sanitized HTML for rendering
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}