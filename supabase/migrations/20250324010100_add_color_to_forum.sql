-- Add color column to ForumCategory if it doesn't exist
ALTER TABLE "ForumCategory" ADD COLUMN IF NOT EXISTS "color" TEXT;