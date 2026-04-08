import { ExternalLink } from "lucide-react";
import { Task } from "@/lib/types/tasks";

/**
 * Regex to detect URLs starting with http://, https://, or www.
 */
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

/**
 * Utility to render text with clickable links.
 */
export function renderTextWithLinks(text: string) {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return parts.map((part, i) => {
    if (part.match(URL_REGEX)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="text-accent underline hover:text-accent/80 break-all inline-flex items-center gap-1 group/link"
        >
          {part}
          <ExternalLink className="w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity" />
        </a>
      );
    }
    return part;
  });
}

/**
 * Calculate completion percentage for a list of tasks.
 */
export function calculateProgress(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedCount = tasks.filter(task => task.is_completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}
