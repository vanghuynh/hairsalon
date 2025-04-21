import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, addHours, parseISO } from 'date-fns';
import { Booking } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTimeSlots() {
  const slots = [];
  const startTime = new Date();
  startTime.setHours(8, 0, 0); // 8:00 AM
  const endTime = new Date();
  endTime.setHours(22, 0, 0); // 10:00 PM

  while (startTime < endTime) {
    slots.push(format(startTime, 'HH:mm'));
    startTime.setHours(startTime.getHours() + 1);
  }

  return slots;
}

export function isTimeSlotAvailable(
  date: Date,
  timeSlot: string,
  existingBookings: Booking[]
) {
  const selectedDateTime = parseISO(
    `${format(date, 'yyyy-MM-dd')}T${timeSlot}`
  );
  const endDateTime = addHours(selectedDateTime, 1);

  return !existingBookings.some((booking) => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    return (
      (selectedDateTime >= bookingStart && selectedDateTime < bookingEnd) ||
      (endDateTime > bookingStart && endDateTime <= bookingEnd)
    );
  });
}
