-- Add statutory eligibility columns to the schemes table
ALTER TABLE government_schemes
ADD COLUMN max_family_income NUMERIC(12,2) DEFAULT 500000.00,
ADD COLUMN eligible_categories VARCHAR[] DEFAULT '{"SC", "ST", "OBC", "GEN"}',
ADD COLUMN women_special_rebate DECIMAL(4,2) DEFAULT 0.00,
ADD COLUMN minimum_age INT DEFAULT 18;

-- Update specific NSFDC schemes with strict constraints
UPDATE government_schemes 
SET max_family_income = 500000.00, eligible_categories = '{"SC"}' 
WHERE scheme_id IN ('NSFDC-MFS', 'NSFDC-GBS');

UPDATE government_schemes 
SET max_family_income = 500000.00, eligible_categories = '{"SC"}', women_special_rebate = 1.00 
WHERE scheme_id = 'NSFDC-MSY';
