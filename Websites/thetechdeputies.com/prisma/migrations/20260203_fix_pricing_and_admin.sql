-- Update subscription plan pricing to match code defaults
-- Basic: $49/month, Standard: $89/month, Premium: $149/month

UPDATE "plans"
SET "price_in_cents" = 4900
WHERE "name" = 'basic' AND "price_in_cents" != 4900;

UPDATE "plans"
SET "price_in_cents" = 8900
WHERE "name" = 'standard' AND "price_in_cents" != 8900;

UPDATE "plans"
SET "price_in_cents" = 14900
WHERE "name" = 'premium' AND "price_in_cents" != 14900;

-- Make test user an admin for testing admin features
UPDATE "users"
SET "role" = 'admin'
WHERE "email" = 'test@sn0n.com' AND "role" != 'admin';
