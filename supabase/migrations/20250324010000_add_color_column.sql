-- Add color column to ForumCategory table
ALTER TABLE "ForumCategory" ADD COLUMN IF NOT EXISTS "color" TEXT;