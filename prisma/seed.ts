import { prisma } from '../src/lib/prisma';

async function main() {
  // Xóa dữ liệu cũ
  await prisma.booking.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});

  // Thêm dữ liệu mẫu cho services
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'Cắt tóc nam',
        duration: 30, // 30 phút
        price: 150000,
        description: 'Cắt tóc nam cơ bản, gội đầu, tạo kiểu',
      },
      {
        name: 'Cắt tóc nữ',
        duration: 45, // 45 phút
        price: 200000,
        description: 'Cắt tóc nữ, gội đầu, tạo kiểu',
      },
      {
        name: 'Nhuộm tóc',
        duration: 120, // 2 tiếng
        price: 500000,
        description: 'Nhuộm tóc toàn đầu, gội đầu, dưỡng tóc',
      },
      {
        name: 'Uốn tóc',
        duration: 180, // 3 tiếng
        price: 800000,
        description: 'Uốn tóc toàn đầu, gội đầu, dưỡng tóc',
      },
      {
        name: 'Duỗi tóc',
        duration: 150, // 2.5 tiếng
        price: 600000,
        description: 'Duỗi tóc toàn đầu, gội đầu, dưỡng tóc',
      },
    ],
  });

  console.log('Đã thêm dữ liệu mẫu cho services:', services);
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
