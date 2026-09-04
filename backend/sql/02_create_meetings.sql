

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

