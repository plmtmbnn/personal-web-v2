import type { SampleComparison } from "../types";

export const TEXT_COMPARE_SAMPLES: SampleComparison[] = [
	{
		id: "copywriting-revision",
		title: "Product Launch Copy",
		category: "Editorial & Copy",
		description:
			"Compare an initial rough draft with a punchy, polished marketing announcement.",
		textA: `Introducing HyperScale Engine v1.0.
We built this tool because traditional database systems are slow and hard to configure.
With HyperScale, you can query your data faster and without any downtime.

Key Features:
- Fast query processing
- High availability with 99.9% uptime
- Support for PostgreSQL and MySQL
- Standard pricing starts at $49/month

Try it out today by downloading our CLI tool. Contact support if you have questions.`,
		textB: `Introducing HyperScale Engine 2.0 — Real-Time Analytics at Cloud Scale.
We engineered HyperScale to eliminate database bottlenecks and simplify distributed infrastructure.
With HyperScale, deploy sub-millisecond queries effortlessly with zero downtime.

Core Capabilities:
- Ultra-fast vectorized query engine
- Enterprise-grade 99.99% high availability SLA
- Native bi-directional support for PostgreSQL, MySQL, and ClickHouse
- Flexible pricing starting with a generous free tier

Get started in 60 seconds via our cloud console or CLI. Join our developer Discord for instant support.`,
	},
	{
		id: "terms-of-service",
		title: "Terms & Privacy Clause",
		category: "Legal & Compliance",
		description:
			"Review updated retention periods, compliance mandates, and jurisdiction terms.",
		textA: `1. DATA COLLECTION AND STORAGE
We collect user emails, IP addresses, and usage logs to provide our service.
All telemetry is stored indefinitely on US-based cloud servers.
Users may request data deletion by contacting privacy@example.com within 30 days.

2. SERVICE AVAILABILITY
The platform is provided on an "as is" basis without warranty of any kind.
We reserve the right to modify or terminate features at our discretion.

3. JURISDICTION
These terms are governed by the laws of California, United States.`,
		textB: `1. DATA COLLECTION AND RETENTION
We collect account emails, anonymized IP telemetry, and session logs to deliver our services.
All collected data is retained for a maximum of 180 days on encrypted ISO-27001 compliant cloud servers.
Users may permanently delete their account and personal data instantly from the Security Settings portal.

2. SERVICE AVAILABILITY & SLA
The platform is provided under standard commercial availability guidelines.
We provide a minimum 14-day notice prior to deprecating major public APIs.

3. GOVERNING LAW AND DISPUTES
These terms are governed by the laws of Delaware, United States, without regard to conflict of law principles.`,
	},
	{
		id: "list-comparison",
		title: "Subscriber & ID List",
		category: "Lists & Data",
		description:
			"Compare two lists of items/emails to pinpoint new subscribers and churned users.",
		textA: `alex.dev@gmail.com
sarah.connor@cyberdyne.io
marcus.aurelius@rome.org
elena.rostova@techcorp.com
david.beckham@united.co.uk
jordan.bell@investor.io
lucas.moura@spurs.com
rachel.green@ralphlauren.com`,
		textB: `alex.dev@gmail.com
sarah.connor@cyberdyne.io
marcus.aurelius@rome.org
elena.rostova@techcorp.com
david.beckham@united.co.uk
jordan.bell@investor.io
hannah.abbott@hogwarts.edu
lucas.moura@spurs.com
nathan.drake@uncharted.org`,
	},
	{
		id: "release-notes",
		title: "Software Release Notes",
		category: "Changelog",
		description:
			"Check changes between release drafts, breaking fixes, and new features.",
		textA: `## Version 2.4.0
Release Date: August 10, 2026

### What's New
- Added Dark Mode toggle in navbar
- Integrated CSV export for task lists
- Basic performance improvements in list rendering

### Bug Fixes
- Fixed login redirect loop on Firefox
- Resolved occasional memory leak on timer unmount`,
		textB: `## Version 2.5.0
Release Date: August 22, 2026

### What's New
- Added Text Compare Studio utility with granular similarity metrics
- Added Dark Mode toggle with automatic system theme synchronization
- Integrated CSV & JSON export for task agendas and analytics
- Overhauled list rendering with 60FPS virtualized scrolling

### Bug Fixes & Security
- Patched CSRF validation on public contact submissions
- Fixed login redirect loop on Firefox and Safari Mobile
- Resolved memory leak on high-precision timer unmount`,
	},
];
