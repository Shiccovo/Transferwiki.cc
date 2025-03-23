-- Helper functions for table and relationship creation
-- Run this in the Supabase SQL Editor first

-- Function to create a table if it doesn't exist
CREATE OR REPLACE FUNCTION create_table_if_not_exists(
  table_name text, 
  definition text
) RETURNS void AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = create_table_if_not_exists.table_name
  ) INTO table_exists;
  
  -- Create the table if it doesn't exist
  IF NOT table_exists THEN
    EXECUTE 'CREATE TABLE public."' || table_name || '" (' || definition || ')';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create a foreign key constraint if it doesn't exist
CREATE OR REPLACE FUNCTION create_foreign_key_if_not_exists(
  table_name text,
  column_name text,
  foreign_table text,
  foreign_column text,
  constraint_name text
) RETURNS void AS $$
DECLARE
  constraint_exists boolean;
BEGIN
  -- Check if constraint exists
  SELECT EXISTS (
    SELECT FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND constraint_name = create_foreign_key_if_not_exists.constraint_name
  ) INTO constraint_exists;
  
  -- Create the constraint if it doesn't exist
  IF NOT constraint_exists THEN
    EXECUTE 'ALTER TABLE public."' || table_name || 
            '" ADD CONSTRAINT "' || constraint_name || 
            '" FOREIGN KEY ("' || column_name || 
            '") REFERENCES public."' || foreign_table || 
            '"("' || foreign_column || '")';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create a database function if it doesn't exist
CREATE OR REPLACE FUNCTION create_function_if_not_exists(
  function_name text,
  definition text
) RETURNS void AS $$
BEGIN
  -- Execute the function definition directly
  -- PostgreSQL will replace the function if it exists
  EXECUTE definition;
END;
$$ LANGUAGE plpgsql;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";