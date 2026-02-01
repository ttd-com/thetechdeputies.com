/*
  Warnings:

  - The `status` column on the `user_subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `user_subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `tier` on the `plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `course_inclusion` on the `plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `support_tier` on the `plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('basic', 'standard', 'premium');

-- CreateEnum
CREATE TYPE "CourseInclusion" AS ENUM ('none', 'partial', 'full');

-- CreateEnum
CREATE TYPE "SupportTier" AS ENUM ('email', 'priority', 'premium_24_7');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'cancelled', 'expired', 'past_due');

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "tier",
ADD COLUMN     "tier" "PlanTier" NOT NULL,
DROP COLUMN "course_inclusion",
ADD COLUMN     "course_inclusion" "CourseInclusion" NOT NULL,
DROP COLUMN "support_tier",
ADD COLUMN     "support_tier" "SupportTier" NOT NULL;

-- AlterTable
ALTER TABLE "user_subscriptions" DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripe_subscription_id_key" ON "user_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_user_id_status_key" ON "user_subscriptions"("user_id", "status");
