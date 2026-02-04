-- AlterTable: Add session tracking and shared calendar support to Booking model
ALTER TABLE "bookings" ADD COLUMN "show_on_shared_calendar" BOOLEAN NOT NULL DEFAULT true;

-- This allows bookings to be displayed on a shared calendar view
-- The sessionBookedThisMonth is already in UserSubscription model for tracking
