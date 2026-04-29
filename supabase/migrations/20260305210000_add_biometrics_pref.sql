-- Add requireBiometricsForSensitiveDocs column to user_profiles.
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS "requireBiometricsForSensitiveDocs" BOOLEAN NOT NULL DEFAULT true;
