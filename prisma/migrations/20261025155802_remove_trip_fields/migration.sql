/*
  Warnings:

  - You are about to drop the column `destination` on the `BookingRequest` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `BookingRequest` table. All the data in the column will be lost.
  - You are about to drop the column `passengerCount` on the `BookingRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pickupAt` on the `BookingRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `BookingRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BookingRequest" DROP COLUMN "destination",
DROP COLUMN "notes",
DROP COLUMN "passengerCount",
DROP COLUMN "pickupAt",
DROP COLUMN "pickupLocation";
