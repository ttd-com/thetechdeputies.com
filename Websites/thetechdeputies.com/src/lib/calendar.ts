import { addHours, format, isAfter, isBefore, setHours, setMinutes, startOfDay } from 'date-fns';

export interface CalendarSlot {
  startTime: Date;
  endTime: Date;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export const CALENDAR_CONFIG = {
  startHour: 10, // 10 AM
  endHour: 16,   // 4 PM
  slotDurationHours: 1,
  defaultCapacity: 2,
};

/**
 * Generates regular 1-hour slots between 10 AM and 4 PM for a given date.
 */
export function generateDaySlots(date: Date): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const day = startOfDay(date);
  
  let currentSlotStart = setMinutes(setHours(day, CALENDAR_CONFIG.startHour), 0);
  const dayEnd = setMinutes(setHours(day, CALENDAR_CONFIG.endHour), 0);

  while (isBefore(currentSlotStart, dayEnd)) {
    const currentSlotEnd = addHours(currentSlotStart, CALENDAR_CONFIG.slotDurationHours);
    
    slots.push({
      startTime: currentSlotStart,
      endTime: currentSlotEnd,
      capacity: CALENDAR_CONFIG.defaultCapacity,
      bookedCount: 0,
      isAvailable: true,
    });

    currentSlotStart = currentSlotEnd;
  }

  return slots;
}

/**
 * Checks if a specific date/time is within the valid booking window.
 */
export function isValidSlotTime(date: Date): boolean {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  
  return (
    hour >= CALENDAR_CONFIG.startHour && 
    hour < CALENDAR_CONFIG.endHour && 
    minutes === 0
  );
}

/**
 * Formats a slot for display (e.g., "10:00 AM - 11:00 AM")
 */
export function formatSlotRange(startTime: Date, endTime: Date): string {
  return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
}

/**
 * Formats a date for the calendar header (e.g., "Monday, February 2, 2026")
 */
export function formatCalendarDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}
