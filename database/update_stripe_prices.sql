-- Update subscription plans with real Stripe price IDs
-- Replace 'your_actual_pro_price_id' and 'your_actual_agency_price_id' with the real ones from Stripe

UPDATE subscription_plans 
SET stripe_price_id = 'your_actual_pro_price_id'
WHERE name = 'Pro';

UPDATE subscription_plans 
SET stripe_price_id = 'your_actual_agency_price_id'
WHERE name = 'Agency';

-- Verify the update
SELECT * FROM subscription_plans;