-- F10 — schedules the daily-check Edge Function (supabase/functions/daily-check)
-- to run every day at 8:00 AM UTC. Run this AFTER the function is deployed
-- (see supabase/functions/daily-check/README.md for deploy steps) — pg_cron
-- will happily schedule a call to a function that doesn't exist yet, it'll
-- just fail silently until the function is live.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Replace PROJECT_URL and SERVICE_ROLE_KEY below with your actual values
-- (Settings -> API in the Supabase dashboard). The service role key is used
-- here only to authorize the *invocation* of the Edge Function — it's a
-- different concern from what the function's own internal Supabase client
-- uses to bypass RLS once it's running.
SELECT cron.schedule(
  'daily-check',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'PROJECT_URL/functions/v1/daily-check',
    headers := jsonb_build_object(
      'Authorization', 'Bearer SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    )
  );
  $$
);

-- To check it's scheduled: SELECT * FROM cron.job;
-- To remove it later:      SELECT cron.unschedule('daily-check');
