-- Migration: Webhook idempotency
-- Prevents duplicate webhook processing by tracking event IDs

CREATE TABLE IF NOT EXISTS public.webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for cleanup of old events
CREATE INDEX idx_webhook_events_processed_at ON public.webhook_events (processed_at);

-- Allow service role full access (webhooks use service role key)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhook events"
  ON public.webhook_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant usage to service role
GRANT ALL ON public.webhook_events TO service_role;

COMMENT ON TABLE public.webhook_events IS 'Tracks processed webhook event IDs for idempotency. Events older than 7 days can be safely pruned.';
