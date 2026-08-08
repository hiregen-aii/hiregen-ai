-- ==========================================================
-- Module: 4.3 Communication Service
-- File: 03_indexes.sql
-- Description:
-- Creates indexes to improve query performance.
-- ==========================================================

-- ==========================================================
-- Indexes for email_events
-- ==========================================================

-- Search email events by lead
CREATE INDEX idx_email_events_lead_id
ON email_events (lead_id);

-- Search email events by event type
CREATE INDEX idx_email_events_event_type
ON email_events (event_type);

-- Retrieve recent email events
CREATE INDEX idx_email_events_created_at
ON email_events (created_at);

-- Search by provider message ID
CREATE INDEX idx_email_events_provider_message_id
ON email_events (provider_message_id);

-- ==========================================================
-- Indexes for meetings
-- ==========================================================

-- Search meetings by lead
CREATE INDEX idx_meetings_lead_id
ON meetings (lead_id);

-- Search meetings by date
CREATE INDEX idx_meetings_meeting_date
ON meetings (meeting_date);

-- Search meetings by status
CREATE INDEX idx_meetings_status
ON meetings (status);

-- Retrieve meetings by creation time
CREATE INDEX idx_meetings_created_at
ON meetings (created_at);

