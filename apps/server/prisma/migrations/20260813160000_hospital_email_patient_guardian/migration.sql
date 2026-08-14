-- AlterTable
ALTER TABLE "hospitals" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPhone" TEXT;
