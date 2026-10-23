-- AlterTable
ALTER TABLE "VinoCepa" ADD COLUMN "porcentaje" INTEGER
CHECK ("porcentaje" IS NULL OR "porcentaje" BETWEEN 1 AND 100);
