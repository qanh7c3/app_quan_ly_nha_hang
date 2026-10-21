require('dotenv').config();
const mongoose = require('mongoose');
const Table = require('../models/Table');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Reservation = require('../models/Reservation');

const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db');
    console.log(`✅ Kết nối MongoDB: ${conn.connection.host}`);

    // Dọn dẹp dữ liệu cũ
    await Table.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Reservation.deleteMany({});
    console.log('🧹 Đã dọn dẹp dữ liệu cũ');

    // 1. Tạo 5 tài khoản mẫu cho 5 vai trò
    await User.create([
      { name: 'Hoàng Lễ Tân', email: 'letan@nhahang.com', password: 'password123', role: 'waiter', phone: '0901111111' },
      { name: 'Lê Văn Phục Vụ', email: 'phucvu@nhahang.com', password: 'password123', role: 'waiter', phone: '0902222222' },
      { name: 'Nguyễn Bếp Trưởng', email: 'bep@nhahang.com', password: 'password123', role: 'kitchen', phone: '0903333333' },
      { name: 'Trần Thu Ngân', email: 'thungan@nhahang.com', password: 'password123', role: 'cashier', phone: '0904444444' },
      { name: 'Phạm Tổng Quản Lý', email: 'quanly@nhahang.com', password: 'password123', role: 'admin', phone: '0905555555' }
    ]);
    console.log('👤 Đã tạo 5 tài khoản mẫu cho 5 vai trò (Lễ tân, Phục vụ, Bếp, Thu ngân, Quản lý)');

    // 2. Tạo kho nguyên vật liệu
    await Inventory.create([
      { name: 'Thịt bò Úc', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 25, minThreshold: 5, costPerUnit: 280000 },
      { name: 'Tôm sú tươi', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 18, minThreshold: 4, costPerUnit: 220000 },
      { name: 'Mực ống', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 15, minThreshold: 3, costPerUnit: 190000 },
      { name: 'Dẻ sườn non', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 30, minThreshold: 6, costPerUnit: 170000 },
      { name: 'Khoai tây củ', category: 'Rau củ', unit: 'kg', quantityInStock: 50, minThreshold: 10, costPerUnit: 25000 },
      { name: 'Đào ngâm đóng hộp', category: 'Đồ uống/Bia', unit: 'lon', quantityInStock: 40, minThreshold: 8, costPerUnit: 35000 },
      { name: 'Bia Heineken', category: 'Đồ uống/Bia', unit: 'lon', quantityInStock: 120, minThreshold: 24, costPerUnit: 18000 }
    ]);
    console.log('📦 Đã tạo kho nguyên vật liệu');

    // 3. Tạo danh mục món ăn
    const categories = await Category.create([
      { name: 'Khai Vị', slug: 'khai-vi', sortOrder: 1 },
      { name: 'Món Bò & Thịt Nướng', slug: 'bo-thit-nuong', sortOrder: 2 },
      { name: 'Hải Sản Tươi Sống', slug: 'hai-san', sortOrder: 3 },
      { name: 'Món Lẩu & Cơm', slug: 'lau-com', sortOrder: 4 },
      { name: 'Đồ Uống & Tráng Miệng', slug: 'do-uong-trang-mieng', sortOrder: 5 }
    ]);

    const [cKhaiVi, cBo, cHaiSan, cLau, cDoUong] = categories;

    // 4. Tạo món ăn kèm công thức định lượng (recipe) để tự động trừ kho
    await MenuItem.create([
      {
        name: 'Gỏi Ngó Sen Tôm Thịt',
        categoryId: cKhaiVi._id,
        price: 95000,
        description: 'Ngó sen giòn rụm kết hợp tôm sú và thịt ba chỉ',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [{ ingredientName: 'Tôm sú tươi', amount: 0.15, unit: 'kg' }]
      },
      {
        name: 'Bò Lúc Lắc Khoai Tây Chiên',
        categoryId: cBo._id,
        price: 185000,
        description: 'Thịt bò Úc mềm mọng sốt tiêu đen kèm khoai tây vàng giòn',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt bò Úc', amount: 0.25, unit: 'kg' },
          { ingredientName: 'Khoai tây củ', amount: 0.15, unit: 'kg' }
        ]
      },
      {
        name: 'Sườn Nướng BBQ Mật Ong',
        categoryId: cBo._id,
        price: 220000,
        description: 'Dẻ sườn non nướng than hoa tẩm mật ong',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [{ ingredientName: 'Dẻ sườn non', amount: 0.4, unit: 'kg' }]
      },
      {
        name: 'Mực Trứng Hấp Gừng Sả',
        categoryId: cHaiSan._id,
        price: 195000,
        description: 'Mực trứng tươi sống hấp thơm nồng mùi gừng',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [{ ingredientName: 'Mực ống', amount: 0.35, unit: 'kg' }]
      },
      {
        name: 'Lẩu Thái Hải Sản Chua Cay',
        categoryId: cLau._id,
        price: 350000,
        description: 'Nồi lẩu đậm vị chua cay Tom Yum ngập tràn hải sản',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm sú tươi', amount: 0.25, unit: 'kg' },
          { ingredientName: 'Mực ống', amount: 0.2, unit: 'kg' }
        ]
      },
      {
        name: 'Trà Đào Cam Sả Tươi',
        categoryId: cDoUong._id,
        price: 45000,
        description: 'Trà thanh mát kết hợp lát đào giòn ngọt và sả tươi',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        station: 'bar',
        recipe: [{ ingredientName: 'Đào ngâm đóng hộp', amount: 0.2, unit: 'lon' }]
      },
      {
        name: 'Bia Heineken Lon',
        categoryId: cDoUong._id,
        price: 30000,
        description: 'Bia ướp lạnh sảng khoái',
        imageUrl: 'https://images.unsplash.com/photo-1608270119614-7e8cf65f128c?w=600&auto=format&fit=crop&q=80',
        station: 'bar',
        recipe: [{ ingredientName: 'Bia Heineken', amount: 1, unit: 'lon' }]
      }
    ]);
    console.log('🍲 Đã tạo danh sách món ăn kèm công thức định lượng');

    // 5. Tạo sơ đồ bàn ăn
    const createdTables = await Table.create([
      { tableNumber: 'Bàn 01', zone: 'Tầng 1 (Trong nhà)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 02', zone: 'Tầng 1 (Trong nhà)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 03', zone: 'Tầng 1 (Trong nhà)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 04', zone: 'Tầng 1 (Trong nhà)', capacity: 2, status: 'empty' },
      { tableNumber: 'Bàn 05', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 06', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 07', zone: 'Sân Vườn (Ngoài trời)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn VIP 1', zone: 'Phòng VIP', capacity: 10, status: 'empty' }
    ]);
    console.log('🪑 Đã tạo sơ đồ bàn ăn');

    // 6. Tạo 1 đơn đặt bàn trước mẫu cho Lễ tân
    await Reservation.create({
      customerName: 'Anh Minh (VIP Khách Quen)',
      phone: '0988776655',
      guestCount: 6,
      reservationTime: new Date(Date.now() + 2 * 3600000), // 2 tiếng nữa
      tableId: createdTables[4]._id, // Gán Bàn 05
      specialRequests: 'Yêu cầu ghế trẻ em, trang trí hoa tươi sinh nhật',
      status: 'confirmed'
    });

    // Cập nhật Bàn 05 thành 'reserved'
    createdTables[4].status = 'reserved';
    await createdTables[4].save();
    console.log('📅 Đã tạo đặt bàn trước mẫu');

    console.log('🎉 Khởi tạo dữ liệu toàn diện hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed data:', error);
    process.exit(1);
  }
};

seedDatabase();
