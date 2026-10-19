DO $$
DECLARE
  v_jobid BIGINT;
BEGIN
  FOR v_jobid IN
    SELECT jobid FROM cron.job WHERE jobname IN ('cleanup-auth-tables', 'cleanup-analytics-logs')
  LOOP
    PERFORM cron.unschedule(v_jobid);
  END LOOP;
END
$$;

SELECT cron.schedule(
  'cleanup-auth-tables',
  '15 3 * * *',
  $job$
  DELETE FROM auth.refresh_tokens
   WHERE revoked
     AND updated_at < now() - interval '7 days';
  DELETE FROM auth.audit_log_entries
   WHERE created_at < now() - interval '90 days';
  $job$
);

SELECT cron.schedule_in_database(
  'cleanup-analytics-logs',
  '30 3 * * *',
  $job$
  DO $$
  DECLARE t TEXT;
  BEGIN
    FOR t IN
      SELECT tablename FROM pg_tables
       WHERE schemaname = '_analytics'
         AND tablename LIKE 'log_events_%'
    LOOP
      EXECUTE format(
        'DELETE FROM _analytics.%I WHERE "timestamp" < (now() AT TIME ZONE ''utc'') - interval ''7 days''',
        t
      );
    END LOOP;
  END
  $$;
  $job$,
  '_supabase'
);
