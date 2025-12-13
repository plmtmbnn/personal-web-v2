export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="container max-w-4xl">
				<div className="glass-card text-center animate-fade-in">
					{/* Animated 404 */}
					<div className="relative mb-8">
						<h1 className="text-[10rem] md:text-[15rem] font-bold gradient-text leading-none animate-float">
							404
						</h1>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-accent/20 blur-3xl animate-pulse"></div>
						</div>
					</div>

					{/* Message */}
					<div className="space-y-4 mb-8">
						<h2 className="text-3xl md:text-4xl font-bold text-foreground">
							Page Not Found
						</h2>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<a href="/" className="btn-primary inline-block">
							Go Back Home
						</a>
					</div>
				</div>

				{/* Floating Elements */}
				<div className="fixed top-20 left-10 w-20 h-20 rounded-full glass blur-sm animate-float opacity-50"></div>
				<div
					className="fixed bottom-20 right-10 w-32 h-32 rounded-full glass blur-sm animate-float opacity-50"
					style={{ animationDelay: "2s" }}
				></div>
				<div
					className="fixed top-1/2 right-1/4 w-16 h-16 rounded-full glass blur-sm animate-float opacity-50"
					style={{ animationDelay: "4s" }}
				></div>
			</div>
		</div>
	);
}
