-- ============================================================
-- SamriddhiAI — Full Supabase PostgreSQL Migration Script
-- ============================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This initializes all tables, PostGIS, indexes, RLS, and seed data.
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. USERS TABLE (Mobile-first authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(10) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    category VARCHAR(10) DEFAULT 'SC',         -- SC / ST / OBC / GEN
    gender CHAR(1) DEFAULT 'M',                -- M / F / O
    annual_income NUMERIC(12,2),
    kyc_status VARCHAR(20) DEFAULT 'pending',  -- pending / verified / rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast mobile lookups during OTP verification
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile_number);


-- ============================================================
-- 3. GOVERNMENT SCHEMES TABLE (Eligibility Matrix)
-- ============================================================
CREATE TABLE IF NOT EXISTS government_schemes (
    scheme_id VARCHAR(50) PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    scheme_name_hindi VARCHAR(255),
    interest_rate DECIMAL(4,2) NOT NULL,
    max_limit_inr NUMERIC(12,2) NOT NULL,
    target_sector VARCHAR(100),
    moratorium_months INT DEFAULT 6,

    -- Statutory Eligibility Columns
    max_family_income NUMERIC(12,2) DEFAULT 500000.00,
    eligible_categories VARCHAR[] DEFAULT '{"SC"}',
    women_special_rebate DECIMAL(4,2) DEFAULT 0.00,
    minimum_age INT DEFAULT 18,

    -- Metadata
    source_url VARCHAR(255),
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);


-- ============================================================
-- 4. CHANNEL PARTNERS TABLE (Banks with PostGIS Geometry)
-- ============================================================
CREATE TABLE IF NOT EXISTS channel_partners (
    branch_code VARCHAR(20) PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    ifsc_code VARCHAR(11) UNIQUE NOT NULL,
    partner_type VARCHAR(50) NOT NULL,         -- SCA / PSB / RRB / NBFC-MFI
    npa_percentage DECIMAL(5,2) NOT NULL,
    active_quota_inr NUMERIC(15,2) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    nodal_officer_name VARCHAR(255),
    nodal_officer_phone VARCHAR(15),

    -- PostGIS Geometry column for spatial queries (SRID 4326 = WGS84 lat/lng)
    location_geom GEOMETRY(Point, 4326),

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GiST spatial index for lightning-fast ST_DWithin / ST_Distance queries
CREATE INDEX IF NOT EXISTS idx_channel_partners_geom
    ON channel_partners USING GIST (location_geom);

-- Index for NPA filtering during routing
CREATE INDEX IF NOT EXISTS idx_channel_partners_npa
    ON channel_partners (npa_percentage);


-- ============================================================
-- 5. APPLICATION DOSSIERS TABLE (Tracking submitted applications)
-- ============================================================
CREATE TABLE IF NOT EXISTS application_dossiers (
    dossier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id VARCHAR(30) UNIQUE NOT NULL,      -- e.g., SAM-2026-SC-7184
    user_id UUID REFERENCES users(id),
    scheme_id VARCHAR(50) REFERENCES government_schemes(scheme_id),
    branch_code VARCHAR(20) REFERENCES channel_partners(branch_code),
    project_cost NUMERIC(12,2),
    loan_amount NUMERIC(12,2),
    promoter_equity NUMERIC(12,2),
    status VARCHAR(20) DEFAULT 'generated',     -- generated / submitted / approved / rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) — Protect user data
-- ============================================================

-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own record (matched by mobile from JWT)
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (mobile_number = current_setting('request.jwt.claim.sub', true));

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (mobile_number = current_setting('request.jwt.claim.sub', true));

-- Allow the service role (backend) full access
CREATE POLICY "Service role has full access"
    ON users FOR ALL
    USING (current_setting('role', true) = 'service_role');


-- ============================================================
-- 7. SEED DATA — NSFDC Concessional Schemes
-- ============================================================
INSERT INTO government_schemes (scheme_id, scheme_name, scheme_name_hindi, interest_rate, max_limit_inr, target_sector, moratorium_months, max_family_income, eligible_categories, women_special_rebate, source_url) VALUES
('NSFDC-MFS',    'Micro Finance Scheme',                'माइक्रो फाइनेंस योजना',          6.50, 140000,   'Micro Business',    6,  500000, '{"SC"}', 1.00, 'https://nsfdc.nic.in'),
('NSFDC-MSY',    'Mahila Samriddhi Yojana',             'महिला समृद्धि योजना',             5.00, 140000,   'Women Enterprise',  6,  500000, '{"SC"}', 0.00, 'https://nsfdc.nic.in'),
('NSFDC-MKY',    'Mahila Kisan Yojana',                 'महिला किसान योजना',                5.00, 200000,   'Dairy & Cattle',    6,  500000, '{"SC"}', 0.00, 'https://nsfdc.nic.in'),
('NSFDC-TLS-S',  'Term Loan Scheme (Small)',            'सावधि ऋण योजना (लघु)',            6.50, 500000,   'Small Business',    6,  500000, '{"SC"}', 0.50, 'https://nsfdc.nic.in'),
('NSFDC-TLS-G',  'Term Loan Scheme (General)',          'सावधि ऋण योजना (सामान्य)',        8.00, 5000000,  'General Business',  12, 500000, '{"SC"}', 0.50, 'https://nsfdc.nic.in'),
('NSFDC-GBS',    'Green Business Scheme',               'हरित व्यवसाय योजना',              6.50, 3000000,  'EV & Solar',        9,  500000, '{"SC"}', 0.00, 'https://nsfdc.nic.in'),
('NSFDC-ELS-IN', 'Educational Loan Scheme (Inland)',    'शैक्षिक ऋण योजना (देश के भीतर)',  6.50, 2000000,  'Education',         12, 500000, '{"SC"}', 0.50, 'https://nsfdc.nic.in')
ON CONFLICT (scheme_id) DO UPDATE SET
    interest_rate = EXCLUDED.interest_rate,
    max_limit_inr = EXCLUDED.max_limit_inr,
    last_synced = CURRENT_TIMESTAMP;


-- ============================================================
-- 8. SEED DATA — Sample Channel Partners (Banks)
-- ============================================================
INSERT INTO channel_partners (branch_code, bank_name, branch_name, ifsc_code, partner_type, npa_percentage, active_quota_inr, state, district, location_geom) VALUES
('SBI-DL-001',   'State Bank of India',        'Janakpuri Branch',       'SBIN0001234', 'PSB',      1.80, 5000000,  'Delhi',           'West Delhi',      ST_SetSRID(ST_MakePoint(77.0688, 28.6139), 4326)),
('PNB-UP-002',   'Punjab National Bank',       'Lucknow Main',           'PUNB0123400', 'PSB',      2.50, 3000000,  'Uttar Pradesh',   'Lucknow',         ST_SetSRID(ST_MakePoint(80.9462, 26.8467), 4326)),
('TAHD-TN-001',  'TAHDCO',                     'Chennai HQ',             'TAHD0000001', 'SCA',      1.20, 8000000,  'Tamil Nadu',      'Chennai',         ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)),
('BOB-MH-001',   'Bank of Baroda',             'Pune Camp Branch',       'BARB0PUNECA', 'PSB',      3.10, 2500000,  'Maharashtra',     'Pune',            ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326)),
('ARY-UP-001',   'Aryavart Bank',              'Varanasi Branch',        'ARYU0000012', 'RRB',      2.80, 1500000,  'Uttar Pradesh',   'Varanasi',        ST_SetSRID(ST_MakePoint(82.9913, 25.3176), 4326)),
('CAN-KA-001',   'Canara Bank',                'Bangalore MG Road',     'CNRB0000234', 'PSB',      2.10, 4000000,  'Karnataka',       'Bangalore Urban', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)),
('DSCF-DL-001',  'DSCFDC',                     'Delhi SC Finance Corp',  'DSCF0000001', 'SCA',      0.90, 10000000, 'Delhi',           'Central Delhi',   ST_SetSRID(ST_MakePoint(77.2090, 28.6328), 4326)),
('SAT-RJ-001',   'Satin Creditcare',           'Jaipur Micro Branch',    'SATN0000056', 'NBFC-MFI', 4.50, 800000,   'Rajasthan',       'Jaipur',          ST_SetSRID(ST_MakePoint(75.7873, 26.9124), 4326))
ON CONFLICT (branch_code) DO UPDATE SET
    npa_percentage = EXCLUDED.npa_percentage,
    active_quota_inr = EXCLUDED.active_quota_inr,
    last_updated = CURRENT_TIMESTAMP;
