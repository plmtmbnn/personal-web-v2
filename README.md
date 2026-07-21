This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Improvements (Phase 1-4)

### Performance & Optimization
- **Lazy Loading**: Heavy libraries (`recharts`, `chart.js`, `react-force-graph-2d`) loaded dynamically (`ssr: false`).
- **Bundle Split**: Webpack `splitChunks` configured (`vendor`, `common`) for faster caching.
- **Image Optimization**: AVIF/WebP formats, responsive device sizes, CSP protection.
- **Directory Reorganization**: `features/utils/` split into logical subdirectories (`file-tools/`, `data-tools/`, `stock-tools/`, `time-tools/`, `web-tools/`, `text-tools/`).

### Code Quality
- **Custom Hooks**: `useTags()` for centralized tag state management.
- **Reusable Components**: `components/ui/Button.tsx` with variant/size support.
- **Centralized Constants**: `lib/constants/index.ts` for all feature constants.

### Security
- **Middleware**: CSP headers (`Content-Security-Policy`), XSS protection, clickjacking prevention (`X-Frame-Options`), referrer policy, permissions policy.
- **Input Sanitization**: `lib/utils/sanitize.ts` with `DOMPurify` for user content.
- **Zod Validation**: Added to `/api/utils/stock-data/` route.

### Testing
- Basic vitest tests for `useTags` hook and task constants (`formatEstimatedTime`).

## Getting Started

First, run the development server:

```bash
pnpm run dev
# or
pnpm dev:debug
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Key Scripts

```bash
# Development
pnpm run dev              # Turbo compiler + telemetry disabled
pnpm run dev:debug        # With Node.js debugger

# Build
pnpm run build            # Production build
pnpm run build:analyze    # Build with bundle size analysis
pnpm run build:profile    # Build with profiling

# Testing
pnpm test                 # Run vitest tests
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Architecture Notes

- **Feature-Module Pattern**: `features/` for domain logic, `services/` for infrastructure, `lib/` for global utilities.
- **Security**: `middleware.ts` handles global CSP/security headers. `checkAdmin()` protects restricted routes.
- **Performance**: Dynamic imports, filesystem cache, bundle analysis, optimized image pipeline.
