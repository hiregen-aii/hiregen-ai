
CREATE TABLE email_events (

    -- Unique identifier for each email event
    event_id UUID PRIMARY KEY,

    -- Lead identifier from Team 2
    -- TODO: Add FOREIGN KEY after Team 2 schema is finalized
    lead_id UUID NOT NULL,

    -- Type of email event
    event_type VARCHAR(30) NOT NULL CHECK (
        event_type IN (
            'SENT','DELIVERED','OPENED','CLICKED','REPLIED','BOUNCED',
            'COMPLAINT','DEFERRED','REJECTED'
        )
    ),

    -- Email service provider
    email_provider VARCHAR(30) NOT NULL,

    -- Message ID returned by the email provider
    provider_message_id VARCHAR(255),

    -- Additional event information
    event_details TEXT,

    -- Time when the event occurred
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);


