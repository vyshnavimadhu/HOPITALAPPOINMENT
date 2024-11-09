-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_trackerId_fkey";

-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "trackerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "Tracker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
