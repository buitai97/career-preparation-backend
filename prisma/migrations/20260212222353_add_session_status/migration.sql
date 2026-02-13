-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "overallScore" DOUBLE PRECISION,
ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS';
