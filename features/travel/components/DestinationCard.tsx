import { MapPin, Calendar, CheckCircle2, Compass } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Destination } from "../types";

const DestinationCard = ({
	destination,
	index,
}: {
	destination: Destination;
	index: number;
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			whileHover={{ y: -5 }}
			className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
		>
			<div className="aspect-[16/10] relative overflow-hidden">
				<Image
					src={destination.imageUrl}
					alt={destination.name}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div className="absolute top-4 left-4">
					{destination.isVisited ? (
						<span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-100 backdrop-blur-md">
							<CheckCircle2 size={12} />
							Visited
						</span>
					) : (
						<span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-slate-200 backdrop-blur-md">
							<Compass size={12} />
							Wishlist
						</span>
					)}
				</div>
			</div>

			<div className="p-6 space-y-3">
				<div className="flex justify-between items-start">
					<div>
						<h3 className="text-xl font-black text-slate-900">
							{destination.name}
						</h3>
						<div className="flex items-center gap-1 text-slate-500 text-xs font-bold mt-1">
							<MapPin size={12} />
							{destination.location}, {destination.country}
						</div>
					</div>
					{destination.isVisited && destination.visitedDate && (
						<div className="flex items-center gap-1 text-emerald-600/70 text-[10px] font-black uppercase">
							<Calendar size={12} />
							{new Date(destination.visitedDate).toLocaleDateString("en-US", {
								month: "short",
								year: "numeric",
								timeZone: "UTC",
							})}
						</div>
					)}
				</div>
				<p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
					{destination.description}
				</p>
			</div>
		</motion.div>
	);
};

export default DestinationCard;
