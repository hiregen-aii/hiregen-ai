-- ==========================================================
-- Module: 4.3 Communication Service
-- File: 02_create_meetings.sql
-- Description:
-- Stores meeting details scheduled with leads.
-- Team 2 integration (lead_id foreign key) will be added later.
-- ==========================================================

CREATE TABLE meetings (

    -- Unique identifier for each meeting
    meeting_id UUID PRIMARY KEY,

    -- Lead identifier from Team 2
    -- TODO: Add FOREIGN KEY after Team 2 schema is finalized
    lead_id UUID NOT NULL,

    -- Meeting title or subject
    meeting_title VARCHAR(150) NOT NULL,

    -- Scheduled meeting date
    meeting_date DATE NOT NULL,

    -- Scheduled meeting time
    meeting_time TIME NOT NULL,

    -- Meeting mode (Online / Offline)
    meeting_mode VARCHAR(20) NOT NULL CHECK (
        meeting_mode IN ('ONLINE', 'OFFLINE')
    ),

    -- Meeting link (Google Meet, Zoom, etc.)
    meeting_link VARCHAR(255),

    -- Meeting location (for offline meetings)
    meeting_location VARCHAR(255),

    -- Current meeting status
    status VARCHAR(20) NOT NULL CHECK (
        status IN (
            'SCHEDULED','COMPLETED','CANCELLED','RESCHEDULED'
        )
    ),

    -- Additional notes
    notes TEXT,

    -- Record creation timestamp
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);

-- ==========================================================
-- TODO
-- ==========================================================
-- 1. Add FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
--    after Team 2 schema is finalized.
--
-- 2. Validate meeting integration with CRM/Calendar service.
--
-- 3. Add indexes after table creation.
-- ==========================================================

| Column             | Purpose                                |
| ------------------ | -------------------------------------- |
| `meeting_id`       | Unique meeting ID                      |
| `lead_id`          | References the lead (Team 2)           |
| `meeting_title`    | Purpose of the meeting                 |
| `meeting_date`     | Date of the meeting                    |
| `meeting_time`     | Time of the meeting                    |
| `meeting_mode`     | ONLINE or OFFLINE                      |
| `meeting_link`     | Link for online meetings               |
| `meeting_location` | Physical location for offline meetings |
| `status`           | Current meeting status                 |
| `notes`            | Additional remarks                     |
| `created_at`       | Record creation timestamp              |
