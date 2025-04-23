import { Metadata } from 'next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { prisma } from '@/lib/prisma';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Quản lý lịch đặt | Hair Salon',
  description: 'Xem và quản lý lịch đặt của khách hàng',
};

// Hàm lấy dữ liệu lịch đặt theo ngày
async function getBookingsByDate(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await prisma.booking.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      user: true,
      service: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

// Hàm lấy dữ liệu lịch đặt theo tuần
async function getBookingsByWeek() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Chủ nhật
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Thứ bảy
  endOfWeek.setHours(23, 59, 59, 999);

  return await prisma.booking.findMany({
    where: {
      date: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    include: {
      user: true,
      service: true,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

// Hàm chuyển đổi trạng thái sang tiếng Việt
function getStatusText(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'COMPLETED':
      return 'Đã hoàn thành';
    default:
      return status;
  }
}

// Hàm lấy màu cho badge trạng thái
function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500';
    case 'CONFIRMED':
      return 'bg-blue-500';
    case 'CANCELLED':
      return 'bg-red-500';
    case 'COMPLETED':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

export default async function BookingsPage() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayBookings = await getBookingsByDate(today);
  const tomorrowBookings = await getBookingsByDate(tomorrow);
  const weekBookings = await getBookingsByWeek();

  // Nhóm lịch đặt theo ngày trong tuần
  const bookingsByDay = weekBookings.reduce((acc, booking) => {
    const dateKey = format(booking.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, typeof weekBookings>);

  // Sắp xếp các ngày trong tuần
  const weekDays = Object.keys(bookingsByDay).sort();

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Quản lý lịch đặt</h1>

      <Tabs defaultValue='today' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='today'>Hôm nay</TabsTrigger>
          <TabsTrigger value='tomorrow'>Ngày mai</TabsTrigger>
          <TabsTrigger value='week'>Cả tuần</TabsTrigger>
        </TabsList>

        <TabsContent value='today'>
          <Card>
            <CardHeader>
              <CardTitle>Lịch đặt hôm nay</CardTitle>
              <CardDescription>
                {format(today, 'EEEE, dd/MM/yyyy', { locale: vi })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayBookings.length === 0 ? (
                <p className='text-center text-gray-500 py-4'>
                  Không có lịch đặt nào hôm nay
                </p>
              ) : (
                <div className='space-y-4'>
                  {todayBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='tomorrow'>
          <Card>
            <CardHeader>
              <CardTitle>Lịch đặt ngày mai</CardTitle>
              <CardDescription>
                {format(tomorrow, 'EEEE, dd/MM/yyyy', { locale: vi })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tomorrowBookings.length === 0 ? (
                <p className='text-center text-gray-500 py-4'>
                  Không có lịch đặt nào ngày mai
                </p>
              ) : (
                <div className='space-y-4'>
                  {tomorrowBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='week'>
          <Card>
            <CardHeader>
              <CardTitle>Lịch đặt trong tuần</CardTitle>
              <CardDescription>
                Từ{' '}
                {format(new Date(weekDays[0] || today), 'dd/MM/yyyy', {
                  locale: vi,
                })}{' '}
                đến{' '}
                {format(
                  new Date(weekDays[weekDays.length - 1] || today),
                  'dd/MM/yyyy',
                  { locale: vi }
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weekDays.length === 0 ? (
                <p className='text-center text-gray-500 py-4'>
                  Không có lịch đặt nào trong tuần này
                </p>
              ) : (
                <div className='space-y-6'>
                  {weekDays.map((dateKey) => (
                    <div key={dateKey} className='border rounded-lg p-4'>
                      <h3 className='font-semibold text-lg mb-3'>
                        {format(new Date(dateKey), 'EEEE, dd/MM/yyyy', {
                          locale: vi,
                        })}
                      </h3>
                      <div className='space-y-3'>
                        {bookingsByDay[dateKey].map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component hiển thị thông tin lịch đặt
function BookingCard({ booking }: { booking: any }) {
  return (
    <div className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
      <div className='flex justify-between items-start'>
        <div>
          <h3 className='font-medium'>{booking.user.name}</h3>
          <p className='text-sm text-gray-500'>{booking.user.phone}</p>
        </div>
        <Badge className={getStatusColor(booking.status)}>
          {getStatusText(booking.status)}
        </Badge>
      </div>

      <div className='mt-2'>
        <p className='font-medium'>{booking.service.name}</p>
        <p className='text-sm text-gray-600'>
          {format(new Date(booking.startTime), 'HH:mm')} -{' '}
          {format(new Date(booking.endTime), 'HH:mm')}
        </p>
        <p className='text-sm font-medium mt-1'>
          {booking.service.price.toLocaleString('vi-VN')}đ
        </p>
      </div>

      {booking.notes && (
        <div className='mt-2 text-sm text-gray-600'>
          <p className='font-medium'>Ghi chú:</p>
          <p>{booking.notes}</p>
        </div>
      )}
    </div>
  );
}
