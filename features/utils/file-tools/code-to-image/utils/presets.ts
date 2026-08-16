import type { BackdropDefinition, BackdropId, CodePreset } from "../types";

export const BACKDROPS: Record<BackdropId, BackdropDefinition> = {
	"cosmic-sunset": {
		id: "cosmic-sunset",
		name: "Cosmic Sunset",
		gradientCss:
			"linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)",
		colors: ["#f093fb", "#f5576c", "#4facfe"],
	},
	aurora: {
		id: "aurora",
		name: "Northern Aurora",
		gradientCss: "linear-gradient(135deg, #0575e6 0%, #00f260 100%)",
		colors: ["#0575e6", "#00f260"],
	},
	"neon-violet": {
		id: "neon-violet",
		name: "Neon Violet",
		gradientCss:
			"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f72585 100%)",
		colors: ["#667eea", "#764ba2", "#f72585"],
	},
	"ocean-blue": {
		id: "ocean-blue",
		name: "Deep Ocean",
		gradientCss: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
		colors: ["#2b5876", "#4e4376"],
	},
	cyberpunk: {
		id: "cyberpunk",
		name: "Cyberpunk Glow",
		gradientCss: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
		colors: ["#ff0844", "#ffb199"],
	},
	"sunset-peach": {
		id: "sunset-peach",
		name: "Sunset Peach",
		gradientCss: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
		colors: ["#fa709a", "#fee140"],
	},
	"slate-dark": {
		id: "slate-dark",
		name: "Solid Slate",
		gradientCss: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
		colors: ["#1e293b", "#0f172a"],
	},
	"pure-dark": {
		id: "pure-dark",
		name: "OLED Black",
		gradientCss: "linear-gradient(135deg, #000000 0%, #09090b 100%)",
		colors: ["#000000", "#09090b"],
	},
	transparent: {
		id: "transparent",
		name: "Transparent",
		gradientCss: "transparent",
		colors: ["transparent"],
	},
};

export const CODE_PRESETS: CodePreset[] = [
	{
		id: "typescript-fetch",
		title: "TypeScript Async Fetcher",
		category: "TypeScript",
		language: "typescript",
		filename: "api-client.ts",
		code: `// High-performance API client with exponential backoff
export async function fetchWithRetry<T>(
  url: string,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return (await res.json()) as T;
  } catch (err) {
    if (retries <= 1) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return fetchWithRetry<T>(url, retries - 1, delayMs * 2);
  }
}`,
	},
	{
		id: "react-hook",
		title: "React Custom Hook",
		category: "React",
		language: "typescript",
		filename: "useDebounce.ts",
		code: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}`,
	},
	{
		id: "python-api",
		title: "Python FastAPI Route",
		category: "Python",
		language: "python",
		filename: "main.py",
		code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Intelligence API")

class PredictionRequest(BaseModel):
    features: list[float]
    threshold: float = 0.85

@app.post("/predict")
async def predict_score(req: PredictionRequest):
    if not req.features:
        raise HTTPException(status_code=400, detail="Empty feature vector")
    confidence = sum(req.features) / len(req.features)
    return {"passed": confidence >= req.threshold, "score": round(confidence, 4)}`,
	},
	{
		id: "sql-analytics",
		title: "SQL Window Function",
		category: "SQL",
		language: "sql",
		filename: "analytics.sql",
		code: `-- Compute 7-day rolling revenue average per user
SELECT 
  user_id,
  order_date,
  daily_revenue,
  AVG(daily_revenue) OVER (
    PARTITION BY user_id 
    ORDER BY order_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7d_avg
FROM daily_sales
WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY user_id, order_date DESC;`,
	},
	{
		id: "shell-script",
		title: "Bash CI/CD Deployment",
		category: "Shell",
		language: "shell",
		filename: "deploy.sh",
		code: `#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Launching Production Deployment Pipeline..."
git checkout main
pnpm install --frozen-lockfile
pnpm run check
pnpm run build

echo "✨ Deploying artifact to edge clusters..."
docker build -t app:latest .
docker push registry.io/org/app:latest
echo "✅ Deployment Successful!"`,
	},
	{
		id: "developer-quote",
		title: "Engineering Philosophy",
		category: "Quote",
		language: "markdown",
		filename: "philosophy.md",
		code: `> "Simplicity is prerequisite for reliability."
> — Edsger W. Dijkstra

1. Write code that explains itself.
2. Optimize for readability first, performance second.
3. Every line of code is a liability, not an asset.`,
	},
];
