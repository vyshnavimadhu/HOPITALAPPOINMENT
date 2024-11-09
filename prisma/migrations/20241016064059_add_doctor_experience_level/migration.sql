/*
  Warnings:

  - Added the required column `experience` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('JUNIOR', 'SENIOR', 'ASSISTANT');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "experience" "ExperienceLevel" NOT NULL;
