-- Case steps schema enhancement
-- Adds: stepOrder, completedAt, notes, and proper JSON type for data
-- Migration: 20260324_case_steps_enhanced

BEGIN;

-- Add new columns (nullable first for safe migration)
ALTER TABLE "CaseStep" ADD COLUMN IF NOT EXISTS "stepOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CaseStep" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;
ALTER TABLE "CaseStep" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Convert data from String to Json
ALTER TABLE "CaseStep" ALTER COLUMN "data" TYPE JSON USING CASE 
  WHEN "data" = '{}' OR "data" = '' THEN '{}'::json
  ELSE "data"::json
END;

-- Populate stepOrder from dashboard-steps order mapping
UPDATE "CaseStep" SET "stepOrder" = 
  CASE "stepSlug"
    WHEN 'personal-info' THEN 1
    WHEN 'spouse-info' THEN 2
    WHEN 'marriage-details' THEN 3
    WHEN 'immigration-info' THEN 4
    WHEN 'documents' THEN 5
    WHEN 'review' THEN 6
    ELSE 0
  END;

COMMIT;
