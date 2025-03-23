-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Page Table
CREATE TABLE IF NOT EXISTS "Page" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdById" UUID REFERENCES "User"(id),
  "lastEditedById" UUID REFERENCES "User"(id),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- PageEdit Table
CREATE TABLE IF NOT EXISTS "PageEdit" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "pageId" UUID REFERENCES "Page"(id) NOT NULL,
  "userId" UUID REFERENCES "User"(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  summary TEXT,
  version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Comment Table
CREATE TABLE IF NOT EXISTS "Comment" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES "User"(id) NOT NULL,
  "pagePath" TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ForumCategory Table
CREATE TABLE IF NOT EXISTS "ForumCategory" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ForumTopic Table
CREATE TABLE IF NOT EXISTS "ForumTopic" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "userId" UUID REFERENCES "User"(id) NOT NULL,
  "categoryId" UUID REFERENCES "ForumCategory"(id) NOT NULL,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  "isLocked" BOOLEAN NOT NULL DEFAULT false,
  "lastReplyAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ForumReply Table
CREATE TABLE IF NOT EXISTS "ForumReply" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  "userId" UUID REFERENCES "User"(id) NOT NULL,
  "topicId" UUID REFERENCES "ForumTopic"(id) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Functions
CREATE OR REPLACE FUNCTION increment_page_view(page_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE "Page"
  SET "viewCount" = "viewCount" + 1
  WHERE slug = page_slug;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_topic_view(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE "ForumTopic"
  SET "viewCount" = "viewCount" + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;