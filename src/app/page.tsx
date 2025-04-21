'use client';

import { useEffect, useState } from 'react';
import { BookingForm } from '@/components/forms/booking-form';
import { Service, Booking, BookingFormData } from '@/types';

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, bookingsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/bookings'),
        ]);

        if (!servicesRes.ok || !bookingsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const servicesData = await servicesRes.json();
        const bookingsData = await bookingsRes.json();

        setServices(servicesData);
        setBookings(bookingsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: BookingFormData) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const newBooking = await response.json();
      setBookings((prev) => [...prev, newBooking]);

      // Reset form or show success message
      alert('Đặt lịch thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-red-500'>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <main className='min-h-screen p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-center'>
          Đặt lịch làm tóc
        </h1>
        <div className='bg-white p-6 rounded-lg shadow-lg'>
          <BookingForm
            services={services}
            existingBookings={bookings}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
