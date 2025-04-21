import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingFormData } from '@/types';

export async function POST(request: Request) {
  try {
    const data: BookingFormData = await request.json();
    const { name, phone, date, timeSlot, serviceId } = data;

    // Parse date and time
    const [hours, minutes] = timeSlot.split(':');
    const bookingDate = new Date(date);
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate end time (1 hour after start time)
    const endTime = new Date(bookingDate);
    endTime.setHours(endTime.getHours() + 1);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        date: bookingDate,
        startTime: bookingDate,
        endTime: endTime,
        status: 'PENDING',
        user: {
          create: {
            name,
            phone,
            email: `${phone}@example.com`, // Temporary email
          },
        },
        service: {
          connect: {
            id: serviceId,
          },
        },
      },
      include: {
        user: true,
        service: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        service: true,
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
