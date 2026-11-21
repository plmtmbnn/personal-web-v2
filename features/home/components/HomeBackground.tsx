export default function HomeBackground() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-slate-50 select-none"
		>
			<div className="absolute inset-0 bg-[url('/home/home-bg-mobile-view.webp')] bg-cover bg-center lg:bg-[url('/home/home-bg-desktop-view.webp')]" />
			<div className="absolute inset-0 bg-white/80" />
		</div>
	);
}
