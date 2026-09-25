-- ============================================================================
-- SamriddhiAI: Production Database Initialization Script (init.sql)
-- Target: PostgreSQL 14+ / Supabase with PostGIS Spatial Extension
-- Algorithmic Scheme Matching & Channel Finance Routing for SC Entrepreneurs
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Drop existing tables if recreating
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS application_dossiers CASCADE;
DROP TABLE IF EXISTS channel_partners CASCADE;
DROP TABLE IF EXISTS government_schemes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- TABLE: users
-- Tracks registered citizens and KYC verification state
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    category VARCHAR(20) DEFAULT 'SC',
    annual_income NUMERIC(12, 2),
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    aadhaar_hash VARCHAR(64), -- Secure SHA-256 hash only, NEVER plain Aadhaar
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);

-- ----------------------------------------------------------------------------
-- TABLE: government_schemes
-- Concessional schemes by NSFDC / NBCFDC / Ministry of Social Justice
-- ----------------------------------------------------------------------------
CREATE TABLE government_schemes (
    scheme_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ministry VARCHAR(255) DEFAULT 'Ministry of Social Justice and Empowerment (MoSJE)',
    nodal_agency VARCHAR(100) DEFAULT 'NSFDC',
    interest_rate NUMERIC(4, 2) NOT NULL, -- Base interest rate per annum (%)
    women_special_rebate NUMERIC(4, 2) NOT NULL DEFAULT 1.00, -- e.g. 1.0% discount for women
    max_income NUMERIC(12, 2) NOT NULL, -- Statutory family income ceiling
    max_limit_inr NUMERIC(12, 2) NOT NULL, -- Maximum loan limit in INR
    eligible_categories TEXT[] NOT NULL DEFAULT '{"SC"}',
    moratorium_months INT NOT NULL DEFAULT 6,
    promoter_equity_pct NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    subsidy_percentage NUMERIC(4, 2) DEFAULT 0.00,
    sector_focus TEXT[] DEFAULT '{"general"}',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schemes_income_limit ON government_schemes(max_income, max_limit_inr);

-- ----------------------------------------------------------------------------
-- TABLE: channel_partners
-- Bank branches with PostGIS spatial location, live NPA, and lending quotas
-- ----------------------------------------------------------------------------
CREATE TABLE channel_partners (
    branch_code VARCHAR(50) PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    ifsc VARCHAR(20) UNIQUE NOT NULL,
    npa_percentage NUMERIC(4, 2) NOT NULL, -- Branch NPA ratio (must be <= 5.0% for routing)
    active_quota_inr NUMERIC(14, 2) NOT NULL, -- Current sanctioned lending headroom
    location_geom GEOMETRY(Point, 4326) NOT NULL, -- EPSG:4326 (WGS 84 Lon/Lat)
    address TEXT NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    contact_phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crucial: GIST Spatial Index for sub-millisecond ST_DWithin and ST_Distance searches
CREATE INDEX idx_channel_partners_geom ON channel_partners USING GIST (location_geom);
CREATE INDEX idx_channel_partners_npa ON channel_partners(npa_percentage);
CREATE INDEX idx_channel_partners_quota ON channel_partners(active_quota_inr);

-- ----------------------------------------------------------------------------
-- TABLE: application_dossiers
-- Routed citizen loan applications with cryptographic verification tokens
-- ----------------------------------------------------------------------------
CREATE TABLE application_dossiers (
    routing_token VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    applicant_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL,
    aadhaar_redacted VARCHAR(50) NOT NULL DEFAULT '[Aadhaar Redacted]',
    income_verified BOOLEAN NOT NULL DEFAULT TRUE,
    annual_income NUMERIC(12, 2) NOT NULL,
    scheme_id VARCHAR(50) NOT NULL REFERENCES government_schemes(scheme_id),
    loan_amount NUMERIC(12, 2) NOT NULL,
    promoter_equity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    interest_rate NUMERIC(4, 2) NOT NULL,
    moratorium_months INT NOT NULL DEFAULT 6,
    allocated_branch_code VARCHAR(50) NOT NULL REFERENCES channel_partners(branch_code),
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review', -- pending_review | approved | flagged_for_review | disbursed
    officer_remarks TEXT,
    processed_by VARCHAR(100),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dossier_token ON application_dossiers(routing_token);
CREATE INDEX idx_dossier_branch ON application_dossiers(allocated_branch_code);
CREATE INDEX idx_dossier_status ON application_dossiers(status);

-- ----------------------------------------------------------------------------
-- TABLE: audit_logs
-- Append-only immutable log ensuring algorithmic transparency & GIGW compliance
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(100) NOT NULL, -- SCHEME_FILTER | GEO_ROUTING | EKYC_VERIFICATION | WHATSAPP_QUERY | DISBURSAL_APPROVAL
    routing_token VARCHAR(50),
    ai_payload_json JSONB NOT NULL,
    user_mobile VARCHAR(20),
    officer_id VARCHAR(50),
    ip_address VARCHAR(50)
);

-- Immutability: Prevent UPDATE or DELETE on audit logs
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_token ON audit_logs(routing_token);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- SEED DATA: Statutory Government Schemes (NSFDC / MoSJE)
-- ============================================================================

INSERT INTO government_schemes (
    scheme_id, name, interest_rate, women_special_rebate, max_income, 
    max_limit_inr, eligible_categories, moratorium_months, promoter_equity_pct, 
    subsidy_percentage, sector_focus, description
) VALUES
(
    'NSFDC-MSY',
    'Mahila Samriddhi Yojana (MSY)',
    4.00,
    1.00,
    300000.00,
    140000.00,
    '{"SC"}',
    6,
    5.00,
    0.00,
    '{"tailoring", "dairy", "retail", "small_trade"}',
    'Micro-credit scheme exclusively for women entrepreneurs belonging to Scheduled Castes with concessional 4% interest rate.'
),
(
    'NSFDC-MFS',
    'Micro Finance Scheme (MFS)',
    6.50,
    1.00,
    300000.00,
    140000.00,
    '{"SC"}',
    6,
    10.00,
    0.00,
    '{"tailoring", "handicrafts", "grocery", "mechanic", "artisan"}',
    'Direct micro-lending to target group beneficiaries through State Channelising Agencies (SCAs) and Regional Rural Banks.'
),
(
    'NSFDC-TLS-S',
    'Term Loan Scheme - Small Scale (TLS)',
    6.50,
    0.50,
    500000.00,
    500000.00,
    '{"SC"}',
    6,
    10.00,
    0.00,
    '{"retail", "dairy", "manufacturing", "transport", "services"}',
    'Assistance for self-employment ventures costing up to Rs. 5.00 Lakhs for individual Scheduled Caste beneficiaries.'
),
(
    'NSFDC-GBS',
    'Green Business Scheme (GBS)',
    6.50,
    0.50,
    500000.00,
    3000000.00,
    '{"SC"}',
    9,
    10.00,
    15.00,
    '{"solar", "e-rickshaw", "biomass", "waste_management", "clean_energy"}',
    'Financial support to promote green and clean energy enterprises by Scheduled Castes including E-Rickshaws and Solar installations.'
),
(
    'NSFDC-ELS-IN',
    'Educational Loan Scheme - Inland (ELS)',
    6.00,
    0.50,
    500000.00,
    2000000.00,
    '{"SC"}',
    12,
    5.00,
    0.00,
    '{"education", "technical_courses", "engineering", "medical"}',
    'Extends educational loans up to Rs. 20.00 Lakhs for professional and technical courses in India.'
)
ON CONFLICT (scheme_id) DO NOTHING;

-- ============================================================================
-- SEED DATA: Channel Partner Bank Branches with Real Coordinates
-- ============================================================================

INSERT INTO channel_partners (
    branch_code, bank_name, branch_name, ifsc, npa_percentage, 
    active_quota_inr, location_geom, address, district, state, contact_phone
) VALUES
-- Delhi NCR Cluster
(
    'SBI-DEL-01234',
    'State Bank of India',
    'Janakpuri District Centre',
    'SBIN0001234',
    1.80,
    25000000.00,
    ST_SetSRID(ST_MakePoint(77.0827, 28.6297), 4326),
    'Plot 4, Community Centre, Janakpuri, New Delhi - 110058',
    'West Delhi',
    'Delhi',
    '+91-11-25501234'
),
(
    'PNB-DEL-04561',
    'Punjab National Bank',
    'Connaught Place Main',
    'PUNB0045610',
    2.40,
    40000000.00,
    ST_SetSRID(ST_MakePoint(77.2197, 28.6315), 4326),
    '7, Harsha Bhawan, E-Block, Connaught Place, New Delhi - 110001',
    'Central Delhi',
    'Delhi',
    '+91-11-23314561'
),
(
    'BOB-DEL-09921',
    'Bank of Baroda',
    'Okhla Industrial Area',
    'BARB0OKHIND',
    3.10,
    18000000.00,
    ST_SetSRID(ST_MakePoint(77.2731, 28.5284), 4326),
    'Phase II, Okhla Industrial Area, New Delhi - 110020',
    'South East Delhi',
    'Delhi',
    '+91-11-26389921'
),

-- Uttar Pradesh Cluster (Lucknow / Kanpur)
(
    'PNB-LKO-01234',
    'Punjab National Bank',
    'Hazratganj Main Branch',
    'PUNB0123400',
    2.50,
    30000000.00,
    ST_SetSRID(ST_MakePoint(80.9462, 26.8467), 4326),
    '1, Vidhan Sabha Marg, Hazratganj, Lucknow, UP - 226001',
    'Lucknow',
    'Uttar Pradesh',
    '+91-522-2621234'
),
(
    'SBI-LKO-05678',
    'State Bank of India',
    'Gomti Nagar Branch',
    'SBIN0005678',
    1.40,
    50000000.00,
    ST_SetSRID(ST_MakePoint(80.9992, 26.8532), 4326),
    'Vibhav Khand, Gomti Nagar, Lucknow, UP - 226010',
    'Lucknow',
    'Uttar Pradesh',
    '+91-522-2305678'
),
(
    'UBI-KNP-07712',
    'Union Bank of India',
    'Mall Road Main Branch',
    'UBIN0530771',
    4.20,
    15000000.00,
    ST_SetSRID(ST_MakePoint(80.3524, 26.4725), 4326),
    '14/113, Civil Lines, Mall Road, Kanpur, UP - 208001',
    'Kanpur Nagar',
    'Uttar Pradesh',
    '+91-512-2310771'
),

-- High NPA Branch (Test Case for Filter Exclusion > 5.0%)
(
    'CAN-DEF-99999',
    'Canara Bank',
    'Distressed Loan Recovery Branch',
    'CNRB0099999',
    8.90, -- EXCLUDED: NPA exceeds 5.0%
    5000000.00,
    ST_SetSRID(ST_MakePoint(77.2100, 28.6200), 4326),
    'Ring Road, New Delhi',
    'Central Delhi',
    'Delhi',
    '+91-11-23399999'
),

-- Low Quota Branch (Test Case for Insufficient Quota)
(
    'CBI-LOW-11111',
    'Central Bank of India',
    'Micro Outreach Desk',
    'CBIN0211111',
    2.10,
    50000.00, -- EXCLUDED for loans > 50,000 INR
    ST_SetSRID(ST_MakePoint(77.2150, 28.6250), 4326),
    'Barakhamba Road, New Delhi',
    'Central Delhi',
    'Delhi',
    '+91-11-23411111'
)
ON CONFLICT (branch_code) DO NOTHING;

-- Seed a demo pre-approved dossier for Banker Dashboard QR scan testing
INSERT INTO application_dossiers (
    routing_token, applicant_name, mobile, category, aadhaar_redacted, 
    income_verified, annual_income, scheme_id, loan_amount, promoter_equity, 
    interest_rate, moratorium_months, allocated_branch_code, status
) VALUES
(
    'SAM-2026-SC-7184',
    'Ravi Shankar Kumar',
    '9876543210',
    'SC',
    '[Aadhaar Redacted]',
    TRUE,
    240000.00,
    'NSFDC-MFS',
    126000.00,
    14000.00,
    6.50,
    6,
    'SBI-DEL-01234',
    'pending_review'
),
(
    'SAM-2026-SC-4291',
    'Sunita Devi',
    '9123456789',
    'SC',
    '[Aadhaar Redacted]',
    TRUE,
    180000.00,
    'NSFDC-MSY',
    126000.00,
    14000.00,
    4.00,
    6,
    'PNB-LKO-01234',
    'pending_review'
)
ON CONFLICT (routing_token) DO NOTHING;
