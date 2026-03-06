-- Add requireBiometricsForSensitiveDocs column to UserProfile
ALTER TABLE "UserProfile"
ADD COLUMN IF NOT EXISTS "requireBiometricsForSensitiveDocs" BOOLEAN NOT NULL DEFAULT true;
