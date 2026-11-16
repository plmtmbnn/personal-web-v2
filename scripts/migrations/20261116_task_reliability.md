# Task reliability rollout

Apply `20261116_task_reliability.sql` once, before deploying the Tasks changes.
The migration is additive and transactional. It stamps completed recurring tasks
as handled without generating historical successors. It does not remove existing
tasks or deduplicate historical rows.

Before applying:

- Verify the deployed `tasks` and `task_dependencies` columns against
  `features/tasks/__tests__/database.fixture.sql`. The fixture reflects the app's
  existing contract, including UUID task IDs, date scheduling columns, and
  `timestamptz` completion timestamps. It is not a production schema export.
- Verify `SUPABASE_SERVICE_ROLE_KEY` exists in the hosting environment. Keep it
  server-only. The migration revokes anonymous and authenticated role writes;
  all application mutations require the existing admin session check and use the
  server client. Missing credentials will cause writes to fail closed.
- Deploy the app immediately after the migration, or pause task editing during
  the rollout. The previous app uses anonymous credentials for task writes.
- Take a database backup through the usual deployment process.

Run the isolated database checks on Windows with installed PostgreSQL:

```powershell
./scripts/test-task-database.ps1
```

The script starts a temporary database on loopback, runs the fixture, migration,
rollback assertions, permission checks, and two concurrent completions, then stops
the database. It never connects to the deployed Supabase database. Use `-PgBin`
or `-Port` when local PostgreSQL paths or ports differ.

Check completion and reopening of a recurring task, drag order after refresh,
dependency links, and a visible-only overdue preview after deployment. Undo is
kept across task view changes. Leaving the page flushes pending removals on a
best-effort basis; closing the browser cannot guarantee that a request completes.

For an app rollback, keep writes paused until a compatible app is restored.
Do not restore anonymous write privileges merely to make the previous app work.
