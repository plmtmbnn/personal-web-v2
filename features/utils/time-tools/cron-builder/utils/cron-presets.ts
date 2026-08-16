import type { CronPreset, PlatformExport } from "../types";

export const CRON_PRESETS: CronPreset[] = [
	{
		label: "Every Minute",
		cron: "* * * * *",
		description: "Triggers continuously at the start of every minute.",
		category: "Frequent",
	},
	{
		label: "Every 5 Minutes",
		cron: "*/5 * * * *",
		description: "High-frequency polling or heartbeat sync.",
		category: "Frequent",
	},
	{
		label: "Every 15 Minutes",
		cron: "*/15 * * * *",
		description: "Standard caching and metric aggregation interval.",
		category: "Frequent",
	},
	{
		label: "Every 30 Minutes",
		cron: "*/30 * * * *",
		description: "Half-hour scheduled maintenance or reporting.",
		category: "Frequent",
	},
	{
		label: "Hourly (Minute 0)",
		cron: "0 * * * *",
		description: "Runs at the top of every hour.",
		category: "Frequent",
	},
	{
		label: "Daily at Midnight",
		cron: "0 0 * * *",
		description: "Runs every day at 00:00 (Midnight).",
		category: "Daily",
	},
	{
		label: "Daily at 09:00 AM",
		cron: "0 9 * * *",
		description: "Runs every morning at 09:00 AM.",
		category: "Daily",
	},
	{
		label: "Weekdays at 09:00 AM",
		cron: "0 9 * * 1-5",
		description: "Runs Monday through Friday morning at 09:00 AM.",
		category: "Daily",
	},
	{
		label: "Twice Daily (09:00 & 18:00)",
		cron: "0 9,18 * * *",
		description: "Morning and evening shift synchronization.",
		category: "Daily",
	},
	{
		label: "Weekly on Sunday (Midnight)",
		cron: "0 0 * * 0",
		description: "Weekly cleanup and summary report generation.",
		category: "Weekly",
	},
	{
		label: "Weekly on Monday (08:00 AM)",
		cron: "0 8 * * 1",
		description: "Kickoff weekly sprints and notification digests.",
		category: "Weekly",
	},
	{
		label: "Monthly on the 1st (Midnight)",
		cron: "0 0 1 * *",
		description: "Monthly ledger, billing, and snapshot operations.",
		category: "Monthly",
	},
	{
		label: "Monthly on the 15th (12:00 PM)",
		cron: "0 12 15 * *",
		description: "Mid-month review and payroll processing.",
		category: "Monthly",
	},
	{
		label: "Quarterly on 1st (Midnight)",
		cron: "0 0 1 1,4,7,10 *",
		description: "Runs Jan 1, Apr 1, Jul 1, Oct 1 at midnight.",
		category: "DevOps",
	},
	{
		label: "Annual Jan 1st (Midnight)",
		cron: "0 0 1 1 *",
		description: "Annual archival and rollover routine.",
		category: "DevOps",
	},
];

export function getPlatformExports(cron: string): PlatformExport[] {
	return [
		{
			id: "github-actions",
			name: "GitHub Actions",
			badge: "CI/CD",
			filename: ".github/workflows/scheduled-task.yml",
			language: "yaml",
			snippet: `name: Scheduled Automation
on:
  schedule:
    # Triggered automatically via cron
    - cron: '${cron}'
  workflow_dispatch:

jobs:
  run-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Operational Script
        run: npm run execute-job`,
		},
		{
			id: "vercel",
			name: "Vercel Cron",
			badge: "Serverless",
			filename: "vercel.json",
			language: "json",
			snippet: JSON.stringify(
				{
					crons: [
						{
							path: "/api/tasks/cron",
							schedule: cron,
						},
					],
				},
				null,
				2,
			),
		},
		{
			id: "kubernetes",
			name: "Kubernetes CronJob",
			badge: "Cloud Native",
			filename: "cronjob.yaml",
			language: "yaml",
			snippet: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: automated-job
spec:
  schedule: "${cron}"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: worker
              image: my-app:latest
              command: ["npm", "run", "start"]`,
		},
		{
			id: "crontab",
			name: "Linux Crontab",
			badge: "Unix/Linux",
			filename: "/etc/crontab",
			language: "bash",
			snippet: `# Min  Hr  Dom  Mon  Dow   User    Command\n${cron}  root    /usr/local/bin/backup-sync.sh >> /var/log/sync.log 2>&1`,
		},
		{
			id: "node-cron",
			name: "Node.js (node-cron)",
			badge: "TypeScript",
			filename: "scheduler.ts",
			language: "typescript",
			snippet: `import cron from "node-cron";

// Scheduled task running on: ${cron}
cron.schedule("${cron}", async () => {
  console.log("⏰ Executing scheduled mission at:", new Date().toISOString());
  await performMaintenanceTask();
});`,
		},
	];
}
