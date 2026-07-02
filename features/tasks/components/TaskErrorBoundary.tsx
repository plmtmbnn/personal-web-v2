"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
	children: ReactNode;
	fallbackTitle?: string;
	fallbackMessage?: string;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary for Task components
 * Prevents full page crashes when task operations fail
 */
export default class TaskErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("TaskErrorBoundary caught an error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		// Optionally trigger a page refresh or re-fetch
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex items-center justify-center min-h-[400px] p-8">
					<div className="max-w-md w-full bg-white border-2 border-rose-200 rounded-2xl p-8 text-center">
						<div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<AlertTriangle className="w-8 h-8 text-rose-600" />
						</div>
						<h2 className="text-xl font-black text-slate-900 mb-2">
							{this.props.fallbackTitle || "Something went wrong"}
						</h2>
						<p className="text-sm text-slate-600 mb-6">
							{this.props.fallbackMessage ||
								"An error occurred while loading tasks. Please try refreshing the page."}
						</p>
						{this.state.error && (
							<details className="text-left mb-6">
								<summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 mb-2">
									Technical Details
								</summary>
								<pre className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 overflow-auto max-h-32">
									{this.state.error.message}
								</pre>
							</details>
						)}
						<button
							onClick={this.handleReset}
							className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all mx-auto"
						>
							<RefreshCw className="w-4 h-4" />
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
