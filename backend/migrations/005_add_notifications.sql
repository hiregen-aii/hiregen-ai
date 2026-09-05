-- Notifications feature — see settings-notifications-architecture-plan.md
-- for the full design decision (polling over Socket.IO to start).

CREATE TYPE notification_type AS ENUM (
  'LEAD_STAGE_CHANGED',
  'APPROVAL_PENDING',
  'APPROVAL_DECIDED',
  'MEETING_BOOKED',
  'CAMPAIGN_STATUS_CHANGED'
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC);