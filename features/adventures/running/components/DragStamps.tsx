import { motion, type MotionValue } from "framer-motion";
import { ThumbsUp, RotateCcw } from "lucide-react";

interface DragStampsProps {
	nextOpacity: MotionValue<number>;
	prevOpacity: MotionValue<number>;
}

export function DragStamps({ nextOpacity, prevOpacity }: DragStampsProps) {
	return (
		<>
			<motion.div
				style={{ opacity: nextOpacity }}
				className="absolute top-8 left-6 z-30 pointer-events-none border-2 border-emerald-500 text-emerald-600 bg-white/95 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest -rotate-12 shadow-sm flex items-center gap-1.5 backdrop-blur-sm"
			>
				<ThumbsUp className="w-4 h-4" /> Next
			</motion.div>
			<motion.div
				style={{ opacity: prevOpacity }}
				className="absolute top-8 right-6 z-30 pointer-events-none border-2 border-amber-500 text-amber-600 bg-white/95 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest rotate-12 shadow-sm flex items-center gap-1.5 backdrop-blur-sm"
			>
				<RotateCcw className="w-4 h-4" /> Prev
			</motion.div>
		</>
	);
}
