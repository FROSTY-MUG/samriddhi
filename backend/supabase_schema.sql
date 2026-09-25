-- Enable PostGIS for geospatial bank routing
CREATE EXTENSION IF NOT EXISTS postgis;

-- Table for scraped government schemes
CREATE TABLE government_schemes (
    scheme_id VARCHAR(50) PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    interest_rate DECIMAL(4,2) NOT NULL,
    max_limit_inr NUMERIC(12,2) NOT NULL,
    target_sector VARCHAR(100),
    max_family_income NUMERIC(12,2) DEFAULT 300000.00, -- NSFDC standard limit
    eligible_categories VARCHAR[] DEFAULT '{"SC"}',
    source_url VARCHAR(255),
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Channel Partners (Banks)
CREATE TABLE channel_partners (
    branch_code VARCHAR(20) PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(11) UNIQUE NOT NULL,
    npa_percentage DECIMAL(5,2) NOT NULL,
    active_quota_inr NUMERIC(15,2) NOT NULL,
    location_geom GEOMETRY(Point, 4326) -- Longitude/Latitude for real-time routing
);

-- Index for instant geographic distance queries
CREATE INDEX idx_channel_partners_geom ON channel_partners USING GIST (location_geom);
