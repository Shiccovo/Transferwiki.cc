-- 添加 isEdited 字段到 ForumReply 表
ALTER TABLE "ForumReply" ADD COLUMN IF NOT EXISTS "isEdited" BOOLEAN DEFAULT FALSE;