// src/utils/dateHelpers.ts
import { Timestamp } from 'firebase/firestore';

/**
 * Calculates the next upcoming date for an event.
 * If the event is recurring, it finds the next anniversary/birthday.
 * If not, it returns the original date.
 *
 * @param eventDate The original Timestamp of the event from Firestore.
 * @param isRecurring A boolean flag indicating if the event repeats annually.
 * @returns A JavaScript Date object representing the target for the countdown.
 */
export const getNextEventDate = (eventDate: Timestamp, isRecurring: boolean): Date => {
  const originalDate = eventDate.toDate();

  // If the event is not recurring or is in the future, return the original date.
  if (!isRecurring || originalDate > new Date()) {
    return originalDate;
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  // Get the month and day from the original event date
  const month = originalDate.getMonth(); // 0-11
  const day = originalDate.getDate();

  // Create the event's date for the current year
  let nextDate = new Date(currentYear, month, day);

  // If this year's date has already passed, set it for next year
  if (nextDate < now) {
    nextDate.setFullYear(currentYear + 1);
  }

  return nextDate;
};