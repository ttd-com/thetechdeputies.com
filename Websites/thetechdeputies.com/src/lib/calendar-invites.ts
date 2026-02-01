import * as ics from 'ics';
import { format } from 'date-fns';

export interface CalendarInviteOptions {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  organizerName: string;
  organizerEmail: string;
}

/**
 * Generates an .ics file content as a string for a calendar event.
 */
export async function generateCalendarInvite(options: CalendarInviteOptions): Promise<string> {
  const { title, description, startTime, endTime, organizerName, organizerEmail } = options;

  const event: ics.EventAttributes = {
    start: [
      startTime.getFullYear(),
      startTime.getMonth() + 1,
      startTime.getDate(),
      startTime.getHours(),
      startTime.getMinutes(),
    ],
    end: [
      endTime.getFullYear(),
      endTime.getMonth() + 1,
      endTime.getDate(),
      endTime.getHours(),
      endTime.getMinutes(),
    ],
    title,
    description: description || '',
    organizer: { name: organizerName, email: organizerEmail },
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
  };

  return new Promise((resolve, reject) => {
    ics.createEvent(event, (error, value) => {
      if (error) {
        reject(error);
      }
      resolve(value);
    });
  });
}
