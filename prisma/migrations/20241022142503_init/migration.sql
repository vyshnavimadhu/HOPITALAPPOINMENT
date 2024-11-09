/*
  Warnings:

  - You are about to drop the column `attendScale` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `trackerId` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the `Tracker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_trackerId_fkey";

-- DropIndex
DROP INDEX "Doctor_trackerId_key";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "attendScale",
DROP COLUMN "trackerId";

-- DropTable
DROP TABLE "Tracker";

-- CreateTable
CREATE TABLE "AvailableSlots" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "slotsno" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailableSlots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AvailableSlots" ADD CONSTRAINT "AvailableSlots_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
