"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
	Search,
	Home,
	ClipboardList,
	BookOpen,
	TrendingUp,
	Mail,
	User,
	Briefcase,
	Timer,
	Calculator,
	Braces,
	ArrowRightLeft,
	FileSpreadsheet,
	Database,
	Files,
	Table as TableIcon,
	Link as LinkIcon,
	RotateCw,
	X,
	Network,
	Globe,
} from "lucide-react";
import { getNotes } from "@/features/brain/actions";

export default function CommandPalette() {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const router = useRouter();
	const [notes, setNotes] = useState<{ slug: string; title: string }[]>([]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	useEffect(() => {
		if (open) {
			getNotes()
				.then((data) => {
					setNotes(data.map((n) => ({ slug: n.slug, title: n.title })));
				})
				.catch((err) => console.error("Failed to load brain notes:", err));
		}
	}, [open]);

	const handleNavigate = (path: string) => {
		setOpen(false);
		router.push(path);
	};

	const copyCurrentUrl = () => {
		if (typeof window !== "undefined") {
			navigator.clipboard.writeText(window.location.href);
			setOpen(false);
			// Display basic visual confirmation (can be swapped with toast if wanted)
			alert("Current URL copied to clipboard!");
		}
	};

	return (
		<>
			{/* Command Menu Keyboard Shortcut Trigger */}
			<div className="fixed bottom-6 right-6 z-40 hidden md:block">
				<button
					onClick={() => setOpen(true)}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white/50 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-white/20 hover:text-white transition-all shadow-lg backdrop-blur-md pointer-events-auto cursor-pointer"
				>
					<span>Search</span>
					<kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[9px]">⌘K</kbd>
				</button>
			</div>

			<AnimatePresence>
				{open && (
					<div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 overflow-hidden">
						{/* Backdrop Blur Overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setOpen(false)}
							className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto"
						/>

						{/* Palette Container */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: -10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							transition={{ duration: 0.2 }}
							className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 pointer-events-auto"
						>
							<Command
								className="flex flex-col h-full overflow-hidden"
								label="Global Command Menu"
							>
								{/* Search Bar input */}
								<div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80">
									<Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
									<Command.Input
										value={search}
										onValueChange={setSearch}
										placeholder="Search pages, utilities, or actions..."
										className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none w-full border-none p-0 focus:ring-0"
									/>
									<button
										onClick={() => setOpen(false)}
										className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
									>
										<X className="w-4 h-4" />
									</button>
								</div>

								{/* Content Sections */}
								<Command.List className="max-h-[350px] overflow-y-auto p-3 space-y-4 no-scrollbar">
									<Command.Empty className="py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
										No matches found.
									</Command.Empty>

									{/* Action commands */}
									<Command.Group
										heading="Actions"
										className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-items]]:space-y-1"
									>
										<Command.Item
											onSelect={copyCurrentUrl}
											className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white cursor-pointer select-none text-xs font-bold transition-all outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white"
										>
											<LinkIcon className="w-4 h-4 text-slate-400" />
											<span>Copy Current URL</span>
										</Command.Item>
										<Command.Item
											onSelect={() => {
												setOpen(false);
												window.location.reload();
											}}
											className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white cursor-pointer select-none text-xs font-bold transition-all outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white"
										>
											<RotateCw className="w-4 h-4 text-slate-400" />
											<span>Force Reload Page</span>
										</Command.Item>
									</Command.Group>

									{/* Page Navigation links */}
									<Command.Group
										heading="Navigation"
										className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-items]]:space-y-1"
									>
										{[
											{ name: "Home Dashboard", path: "/", icon: Home },
											{
												name: "Second Brain Vault",
												path: "/brain",
												icon: Network,
											},
											{
												name: "Personal Tasks & Analytics",
												path: "/tasks",
												icon: ClipboardList,
											},
											{ name: "Blog SSG", path: "/blog", icon: BookOpen },
											{
												name: "Fear & Greed Index / Investments",
												path: "/investment",
												icon: TrendingUp,
											},
											{
												name: "Professional Showcase",
												path: "/portfolio",
												icon: User,
											},
											{
												name: "Career Timeline",
												path: "/work-experience",
												icon: Briefcase,
											},
											{ name: "Contact Page", path: "/contact", icon: Mail },
										].map((item) => (
											<Command.Item
												key={item.path}
												onSelect={() => handleNavigate(item.path)}
												className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white cursor-pointer select-none text-xs font-bold transition-all outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white"
											>
												<item.icon className="w-4 h-4 text-slate-400" />
												<span>{item.name}</span>
											</Command.Item>
										))}
									</Command.Group>

									{/* Second Brain Notes */}
									{notes.length > 0 && (
										<Command.Group
											heading="Second Brain Notes"
											className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-items]]:space-y-1"
										>
											{notes.map((note) => (
												<Command.Item
													key={note.slug}
													onSelect={() => handleNavigate(`/brain/${note.slug}`)}
													className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white cursor-pointer select-none text-xs font-bold transition-all outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white"
												>
													<Network className="w-4 h-4 text-slate-500" />
													<span>{note.title}</span>
												</Command.Item>
											))}
										</Command.Group>
									)}

									{/* Developer Utilities links */}
									<Command.Group
										heading="Developer Utilities"
										className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-items]]:space-y-1"
									>
										{[
											{ name: "Running Timer", slug: "timer", icon: Timer },
											{
												name: "Asset Averaging Calculator",
												slug: "stock-crypto-calculator",
												icon: Calculator,
											},
											{
												name: "JSON Formatter",
												slug: "json-formatter",
												icon: Braces,
											},
											{
												name: "Case Converter",
												slug: "case-converter",
												icon: ArrowRightLeft,
											},
											{
												name: "CSV to JSON Parser",
												slug: "csv-to-json",
												icon: FileSpreadsheet,
											},
											{
												name: "SQL Formatter & Beautifier",
												slug: "sql-formatter",
												icon: Database,
											},
											{
												name: "Schema Forge (JSON Converter)",
												slug: "json-converter-advanced",
												icon: Braces,
											},
											{
												name: "SEO Kebab File Renamer",
												slug: "file-renamer",
												icon: Files,
											},
											{
												name: "Stock Explorer (IDX Portal)",
												slug: "stock-explorer",
												icon: TableIcon,
											},
											{
												name: "Mock API Engine",
												slug: "mock-api",
												icon: Braces,
											},
											{
												name: "Web Archiver",
												slug: "web-archiver",
												icon: Globe,
											},
										].map((item) => (
											<Command.Item
												key={item.slug}
												onSelect={() => handleNavigate(`/utils/${item.slug}`)}
												className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white cursor-pointer select-none text-xs font-bold transition-all outline-none data-[selected=true]:bg-slate-800 data-[selected=true]:text-white"
											>
												<item.icon className="w-4 h-4 text-slate-400" />
												<span>{item.name}</span>
											</Command.Item>
										))}
									</Command.Group>
								</Command.List>

								{/* Control Hints footer */}
								<div className="flex items-center justify-between px-5 py-3 border-t border-slate-800/80 bg-slate-900/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
									<div className="flex items-center gap-2">
										<span>Use arrows</span>
										<kbd className="bg-slate-800 px-1 py-0.5 rounded text-[8px] text-slate-400">
											↑↓
										</kbd>
										<span>to navigate</span>
									</div>
									<div className="flex items-center gap-2">
										<span>Press</span>
										<kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] text-slate-400">
											Enter
										</kbd>
										<span>to select</span>
									</div>
								</div>
							</Command>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
