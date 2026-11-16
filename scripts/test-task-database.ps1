param([string]$PgBin = 'C:\Program Files\PostgreSQL\15\bin', [int]$Port = 55439)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$cluster = Join-Path ([IO.Path]::GetTempPath()) ('tasks-test-' + [guid]::NewGuid())
$psql = Join-Path $PgBin 'psql.exe'
function Invoke-TestSql([string]$Sql) {
    & $psql -h 127.0.0.1 -p $Port -U postgres -v ON_ERROR_STOP=1 -c $Sql
    if ($LASTEXITCODE -ne 0) { throw 'Task SQL check failed' }
}
& (Join-Path $PgBin 'initdb.exe') -D $cluster -U postgres -A trust --no-locale -E UTF8
if ($LASTEXITCODE -ne 0) { throw 'Could not initialize isolated PostgreSQL' }
$started = $false
try {
    & (Join-Path $PgBin 'pg_ctl.exe') -D $cluster -l "$cluster.log" -o "-h 127.0.0.1 -p $Port" -w start
    if ($LASTEXITCODE -ne 0) { throw 'Could not start isolated PostgreSQL' }
    $started = $true
    & $psql -h 127.0.0.1 -p $Port -U postgres -v ON_ERROR_STOP=1 `
        -f (Join-Path $repoRoot 'features/tasks/__tests__/database.fixture.sql') `
        -f (Join-Path $repoRoot 'scripts/migrations/20261116_task_reliability.sql') `
        -f (Join-Path $repoRoot 'features/tasks/__tests__/database.assertions.sql')
    if ($LASTEXITCODE -ne 0) { throw 'Task migration assertions failed' }
    Invoke-TestSql "INSERT INTO tasks(id,title,due_date,recurrence) VALUES ('00000000-0000-4000-8000-000000000003','Concurrent',current_date,'daily');"
    $completion = @'
BEGIN;
SET ROLE service_role;
SELECT task_apply('[{"id":"00000000-0000-4000-8000-000000000003","status":"done"}]');
SELECT pg_sleep(0.5);
COMMIT;
'@
    $jobs = 1..2 | ForEach-Object {
        Start-Job -ScriptBlock {
            param($Executable, $TestPort, $Sql)
            & $Executable -h 127.0.0.1 -p $TestPort -U postgres -v ON_ERROR_STOP=1 -c $Sql
            if ($LASTEXITCODE -ne 0) { throw 'Concurrent completion failed' }
        } -ArgumentList $psql, $Port, $completion
    }
    $jobs | Wait-Job | Receive-Job -ErrorAction Stop
    Invoke-TestSql @'
DO $$ BEGIN
  ASSERT (SELECT count(*)=1 FROM tasks WHERE recurrence_origin_id='00000000-0000-4000-8000-000000000003');
  ASSERT (SELECT status='done' FROM tasks WHERE id='00000000-0000-4000-8000-000000000003');
END $$;
'@
    Write-Output 'Task migration, rollback, permissions, and concurrent completion checks passed.'
} finally {
    if ($started) { & (Join-Path $PgBin 'pg_ctl.exe') -D $cluster -m fast -w stop }
    Write-Output "Isolated test data and log retained at $cluster"
}
