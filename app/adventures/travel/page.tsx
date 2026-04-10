"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	FaInstagram,
	FaMapMarkerAlt,
	FaCompass,
	FaExternalLinkAlt,
} from "react-icons/fa";
import Image from "next/image";

/**
 * Travel Post Data - Curated from Instagram
 */
const travelPosts = [
	{
		id: 1,
		location: "Mount Fuji, Japan",
		image:
			"https://images.unsplash.com/photo-1719301630275-7bb0a987d51b?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		link: "https://www.instagram.com/me.a.mag/", // Replace with your real links
		caption: "The serene peak of Fuji-san during the cherry blossom season.",
	},
	{
		id: 2,
		location: "Nusa Penida, Bali",
		image:
			"https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop",
		link: "https://www.instagram.com/me.a.mag/",
		caption: "Crystal clear waters and the iconic T-Rex cliff.",
	},
	{
		id: 3,
		location: "Bangkok, Thailand",
		image:
			"https://images.unsplash.com/photo-1582468546235-9bf31e5bc4a1?q=80&w=930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		link: "https://www.instagram.com/me.a.mag/",
		caption: "Neon nights and the pulse of Myeong-dong.",
	},
	{
		id: 4,
		location: "Liverpool, England",
		image:
			"https://images.unsplash.com/photo-1654886580603-7c9a6e4bdc25?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		link: "https://www.instagram.com/me.a.mag/",
		caption: "Architectural marvels under the equatorial sun.",
	},
	{
		id: 5,
		location: "Ubud, Bali",
		image:
			"https://images.unsplash.com/photo-1559628233-eb1b1a45564b?q=80&w=2070&auto=format&fit=crop",
		link: "https://www.instagram.com/me.a.mag/",
		caption: "Finding peace among the terraced rice paddies.",
	},
	{
		id: 6,
		location: "Tokyo, Japan",
		image:
			"https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		link: "https://www.instagram.com/me.a.mag/",
		caption: "Ancient traditions in the heart of Gion.",
	},
];

export default function TravelPage() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Dynamic Background Ambience */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
				<div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-12">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-4"
					>
						<div className="flex items-center gap-3 text-accent mb-2">
							<FaCompass className="w-6 h-6 animate-spin-slow" />
							<span className="text-[10px] font-black uppercase tracking-[0.4em]">
								Adventure Log
							</span>
						</div>
						<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground">
							Travel <span className="gradient-text">Journal</span>
						</h1>
						<p className="text-muted-foreground text-lg max-w-lg font-medium leading-relaxed">
							Capturing moments from around the globe. A visual record of places
							that shaped my perspective.
						</p>
					</motion.div>

					<motion.a
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						href="https://www.instagram.com/me.a.mag/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm hover:bg-white/10 transition-all shadow-xl backdrop-blur-md group"
					>
						<FaInstagram className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
						<span>Follow the Journey</span>
					</motion.a>
				</div>

				{/* Aesthetic Instagram-style Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{travelPosts.map((post, index) => (
						<motion.div
							key={post.id}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.6 }}
							className="group relative"
						>
							{/* Polaroid Card Effect */}
							<div className="relative overflow-hidden rounded-[2.5rem] bg-white/5 border-2 border-white/5 shadow-2xl transition-all duration-500 group-hover:border-accent/30 group-hover:-translate-y-2 backdrop-blur-xl">
								{/* Image Container */}
								<div className="aspect-[4/5] overflow-hidden relative">
									<Image
										src={post.image}
										alt={post.location}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
									/>

									{/* Overlay on Hover */}
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
										<a
											href={post.link}
											target="_blank"
											rel="noopener noreferrer"
											className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-transform"
										>
											<FaExternalLinkAlt className="w-5 h-5" />
										</a>
									</div>

									{/* Location Badge */}
									<div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
										<FaMapMarkerAlt className="w-3 h-3 text-accent" />
										<span className="text-[10px] font-black uppercase tracking-widest text-white">
											{post.location}
										</span>
									</div>
								</div>

								{/* Content Area */}
								<div className="p-8 space-y-3">
									<p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
										"{post.caption}"
									</p>
									<div className="pt-4 border-t border-white/5 flex items-center justify-between">
										<span className="text-[10px] font-black uppercase tracking-widest text-accent/60">
											View on Instagram
										</span>
										<FaInstagram className="w-4 h-4 text-white/20 group-hover:text-rose-400 transition-colors" />
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</main>
	);
}
