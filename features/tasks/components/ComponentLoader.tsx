"use client";

/**
 * ComponentLoader
 * A skeleton UI to prevent Layout Shift (CLS) during lazy loading.
 * Matches the project's "glass" aesthetic.
 */
export default function ComponentLoader({ height = "150px" }: { height?: string }) {
	return (
		<div 
			style={{ height }}
			className="w-full glass rounded-[2rem] border border-border/50 relative overflow-hidden animate-pulse"
		>
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
			
			<div className="p-6 space-y-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-background-secondary rounded-xl" />
					<div className="h-4 w-32 bg-background-secondary rounded-lg" />
				</div>
				<div className="space-y-2">
					<div className="h-3 w-full bg-background-secondary rounded-lg" />
					<div className="h-3 w-3/4 bg-background-secondary rounded-lg" />
				</div>
			</div>
		</div>
	);
}
