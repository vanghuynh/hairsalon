import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { generateTimeSlots, isTimeSlotAvailable } from '@/lib/utils';
import { BookingFormData, Service, Booking } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  date: z.date({
    required_error: 'Vui lòng chọn ngày',
  }),
  timeSlot: z.string({
    required_error: 'Vui lòng chọn giờ',
  }),
  serviceId: z.string({
    required_error: 'Vui lòng chọn dịch vụ',
  }),
});

interface BookingFormProps {
  services: Service[];
  existingBookings: Booking[];
  onSubmit: (data: BookingFormData) => void;
}

export function BookingForm({
  services,
  existingBookings,
  onSubmit,
}: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const timeSlots = generateTimeSlots();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const availableTimeSlots = selectedDate
    ? timeSlots.filter((slot) =>
        isTimeSlotAvailable(selectedDate, slot, existingBookings)
      )
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input placeholder='Nhập tên của bạn' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder='Nhập số điện thoại' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Ngày</FormLabel>
              <Calendar
                mode='single'
                selected={field.value}
                onSelect={(date) => {
                  field.onChange(date);
                  setSelectedDate(date);
                }}
                disabled={(date) =>
                  date < new Date() || date < new Date('1900-01-01')
                }
                initialFocus
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='timeSlot'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giờ</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!selectedDate || availableTimeSlots.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn giờ' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTimeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='serviceId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dịch vụ</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn dịch vụ' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.price.toLocaleString('vi-VN')}đ
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full'>
          Đặt lịch
        </Button>
      </form>
    </Form>
  );
}
