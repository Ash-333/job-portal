-- AlterEnum
-- Update the ExperienceLevel enum to include new values
-- First, check if the enum exists, if not create it with all values
DO $$ BEGIN
    -- Check if the enum exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExperienceLevel') THEN
        -- Create the enum with all values if it doesn't exist
        CREATE TYPE "ExperienceLevel" AS ENUM ('STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS');
    ELSE
        -- Add new values to existing enum
        ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'STUDENT';
        ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'INTERNSHIP_ONLY';
        ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'ZERO_TO_ONE_YEAR';
        ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'THREE_TO_FIVE_YEARS';
        ALTER TYPE "ExperienceLevel" ADD VALUE IF NOT EXISTS 'FIVE_PLUS_YEARS';
    END IF;
END $$;
