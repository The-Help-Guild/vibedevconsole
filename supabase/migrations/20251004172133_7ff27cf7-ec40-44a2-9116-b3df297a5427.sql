-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup-old-downloads edge function to run daily at 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-downloads-daily',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://xsgdymdyvqtfqqdkibed.supabase.co/functions/v1/cleanup-old-downloads',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZ2R5bWR5dnF0ZnFxZGtpYmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTU2MzMsImV4cCI6MjA3NTA5MTYzM30.p4MkKXXk-4RfUu9IzoMrmPRU_8AAOp6-3KFnJO3Tm6I"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Add comment documenting the cron job
COMMENT ON EXTENSION pg_cron IS 'Scheduled task: Daily cleanup of download logs older than 90 days at 2 AM UTC';
