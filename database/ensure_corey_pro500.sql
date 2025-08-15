-- Ensure corey.osmond99@gmail.com is always pro_500 member
-- This migration ensures the specified account maintains pro_500 status

-- First, check if the user exists and create/update as needed
INSERT INTO profiles (
    id,
    email, 
    first_name, 
    last_name,
    subscription_plan,
    subscription_status,
    slogans_remaining,
    updated_at,
    created_at
) 
VALUES (
    '12345678-1234-5678-9012-123456789000'::uuid, -- Fixed UUID for consistency
    'corey.osmond99@gmail.com',
    'Corey',
    'Osmond', 
    'pro_500',
    'active',
    500,
    NOW(),
    NOW()
) 
ON CONFLICT (email) 
DO UPDATE SET 
    subscription_plan = 'pro_500',
    subscription_status = 'active',
    slogans_remaining = GREATEST(profiles.slogans_remaining, 500),
    updated_at = NOW();

-- Create a function to automatically restore pro_500 status if it ever changes
CREATE OR REPLACE FUNCTION ensure_corey_pro500()
RETURNS TRIGGER AS $$
BEGIN
    -- If someone tries to change corey.osmond99@gmail.com away from pro_500, restore it
    IF NEW.email = 'corey.osmond99@gmail.com' AND NEW.subscription_plan != 'pro_500' THEN
        NEW.subscription_plan := 'pro_500';
        NEW.subscription_status := 'active';
        NEW.slogans_remaining := GREATEST(NEW.slogans_remaining, 500);
        
        -- Log the attempt
        RAISE NOTICE 'Automatically restored pro_500 status for corey.osmond99@gmail.com';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to protect the account
DROP TRIGGER IF EXISTS protect_corey_pro500 ON profiles;
CREATE TRIGGER protect_corey_pro500
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_corey_pro500();

-- Verify the setup
SELECT 
    email, 
    subscription_plan, 
    subscription_status, 
    slogans_remaining,
    updated_at 
FROM profiles 
WHERE email = 'corey.osmond99@gmail.com';

-- Success message
SELECT 'Corey Osmond account secured with permanent pro_500 status' as status;