export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  user: User;
  service: Service;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFormData {
  name: string;
  phone: string;
  date: Date;
  timeSlot: string;
  serviceId: string;
}
