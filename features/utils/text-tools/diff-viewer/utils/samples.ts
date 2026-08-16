import type { DiffSample } from "../types";

export const DIFF_SAMPLES: DiffSample[] = [
	{
		id: "typescript",
		title: "TypeScript Function Optimization",
		category: "Code",
		original: `// Legacy sequential user data fetcher
async function getUserProfile(userId: string) {
  const user = await db.users.findById(userId);
  const posts = await db.posts.findByUser(userId);
  const followers = await db.followers.count(userId);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    postCount: posts.length,
    followerCount: followers,
    cachedAt: new Date().toISOString()
  };
}`,
		modified: `// Optimized parallel user data fetcher with caching
async function getUserProfile(userId: string): Promise<UserProfile> {
  const [user, posts, followerCount] = await Promise.all([
    db.users.findById(userId),
    db.posts.findByUser(userId),
    db.followers.count(userId)
  ]);

  if (!user) {
    throw new NotFoundError(\`User with ID \${userId} was not found.\`);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "member",
    postCount: posts.length,
    followerCount,
    cachedAt: new Date().toISOString()
  };
}`,
	},
	{
		id: "json",
		title: "JSON Configuration Update",
		category: "Config",
		original: `{
  "name": "personal-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "lucide-react": "^0.300.0"
  }
}`,
		modified: `{
  "name": "personal-web-v2",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo --port 3000",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "check": "biome check ."
  },
  "dependencies": {
    "next": "16.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "framer-motion": "^13.1.0",
    "lucide-react": "^1.31.0"
  }
}`,
	},
	{
		id: "sql",
		title: "SQL Query Index & Join Refactor",
		category: "Database",
		original: `SELECT 
  orders.id,
  orders.total_amount,
  users.email,
  users.created_at
FROM orders
JOIN users ON orders.user_id = users.id
WHERE orders.status = 'PENDING'
ORDER BY orders.created_at DESC;`,
		modified: `SELECT 
  orders.id,
  orders.total_amount,
  orders.currency,
  users.email,
  users.created_at AS user_joined_at
FROM orders
INNER JOIN users ON orders.user_id = users.id
WHERE orders.status = 'PENDING'
  AND orders.created_at >= NOW() - INTERVAL '30 days'
ORDER BY orders.created_at DESC
LIMIT 100;`,
	},
	{
		id: "markdown",
		title: "Markdown Documentation Revision",
		category: "Docs",
		original: `# Project Setup Guide

Welcome to the project! Follow these steps to get started:

1. Clone the repo
2. Run npm install
3. Run npm run dev

For any questions, reach out on Slack.`,
		modified: `# Project Setup & Architecture Guide

Welcome to the high-performance repository! Follow these steps to initialize your local environment:

1. Clone the repository: \`git clone https://github.com/org/repo.git\`
2. Install dependencies: \`pnpm install\`
3. Copy environment variables: \`cp .env.example .env.local\`
4. Launch Turbopack dev server: \`pnpm run dev\`

### Operational Mandates
- Always run \`pnpm run check\` before creating a pull request.
- All client-side tools run in sandboxed memory.`,
	},
];
