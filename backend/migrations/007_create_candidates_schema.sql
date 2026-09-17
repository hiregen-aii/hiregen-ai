-- Migration 007: Candidate Pool & Job Seeker Schema
-- Enables tracking, scraping, and managing active job seekers and candidates in India

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    normalized_email TEXT GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
    phone VARCHAR(50),
    headline VARCHAR(255) NOT NULL,
    current_company VARCHAR(255),
    location VARCHAR(100) NOT NULL DEFAULT 'Bangalore, India',
    skills TEXT[] NOT NULL DEFAULT '{}',
    experience_years INT NOT NULL DEFAULT 3,
    preferred_role VARCHAR(255),
    expected_salary VARCHAR(100) DEFAULT '₹20 - 35 LPA',
    notice_period VARCHAR(50) DEFAULT 'Immediate / 15 Days',
    hiring_type VARCHAR(50) DEFAULT 'FULL_TIME',
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    source VARCHAR(100) NOT NULL DEFAULT 'India Tech Radar',
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    fit_score NUMERIC(5,2) NOT NULL DEFAULT 88.00,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT candidates_email_unique UNIQUE (normalized_email)
);

CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates (status);
CREATE INDEX IF NOT EXISTS idx_candidates_location ON candidates (location);
CREATE INDEX IF NOT EXISTS idx_candidates_experience ON candidates (experience_years);
CREATE INDEX IF NOT EXISTS idx_candidates_fit_score ON candidates (fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN (skills);
